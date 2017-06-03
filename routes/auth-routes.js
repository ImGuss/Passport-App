const express  = require('express');
const bcrypt   = require('bcrypt');
const passport = require('passport');
const ensure   = require('connect-ensure-login');

const User     = require('../models/user-model');

const authRoutes = express.Router();



authRoutes.get('/signup', ensure.ensureNotLoggedIn('/'), (req, res, next) => {

  res.render('auth/signup-view');
});

// user signup
authRoutes.post('/signup', ensure.ensureNotLoggedIn('/'), (req, res, next) => {

  const signupUserName = req.body.signupUserName;
  const signupPassword = req.body.signupPassword;

  // Don't let users submit blank usernames or passwords
  if (signupUserName === '' || signupPassword === '') {
    res.render('auth/signup-view', {
      errorMessage: 'Please provide both username and password'
    });
    return;
  }

  User.findOne(
    // first arg, criteria object, what you're looking for
    {username: signupUserName},
    // second arg, projection object, what you want returned
    {username: 1},
    // third arg callback
    (err, foundUser) => {
      if (err) {
        next(err);
        return;
      }

      // Don't let the user register if username is taken
      if (foundUser) {
        res.render('auth/signup-view', {
          errorMessage: 'Username is taken, beeeitch.'
        });
        return;
      }

      // ENCRYPT THE PASSWORD
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(signupPassword, salt);

      // Create the user
      const theUser = new User({
        name: req.body.signupName,
        username: req.body.signupUserName,
        encryptedPassword: hashPass
      });

      // Save the user
      theUser.save( (err) => {
        if (err) {
          next(err);
          return;
        }

        // Store a message in the box to display after the redirect
        req.flash(
          // first arg, key of the message
          'success',
          // second arg, the actual message
          'You have registered successfully.'
        );

        res.redirect('/');
      });
    }
  );
});


// user login
authRoutes.get('/login', ensure.ensureNotLoggedIn('/'), (req, res, next) => {
  res.render('auth/login-view', {
    errorMessage: req.flash('error')
  });
});

authRoutes.post('/login', passport.authenticate('local',
  {
    successRedirect: '/',
    successFlash: true,
    failureRedirect: '/login',
    failureFlash: true
  }
));

// user logout
authRoutes.get('/logout', (req, res, next) => {
  req.logout();

  req.flash('success', 'You have logged out successfully 🤠');

  res.redirect('/');
});


  // link to this addres to log in with facebook
authRoutes.get('/auth/facebook', passport.authenticate('facebook'));

  // where facebook comes back to after the user has accepted/rejected

  // callbackURL: '/auth/facebook/callback'
authRoutes.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

authRoutes.get('/auth/google', passport.authenticate('google', {
  scope: [
    "https://www.googleapis.com/auth/plus.login",
    "https://www.googleapis.com/auth/plus.profile.emails.read"
  ]
}));

authRoutes.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


module.exports = authRoutes;
