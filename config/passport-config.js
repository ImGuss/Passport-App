const passport       = require('passport');
const User           = require('../models/user-model');
const bcrypt         = require('bcrypt');
const FbStrategy     = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy  = require('passport-local').Strategy;
  //  ^^^^^     same doing as these two    vvvvvvv
  // const passportLocal = require('passport-local');
  // const LocalStrategy = passportLocal.Strategy;


// Determines WHAT TO SAVE in the session (what to put in the box)
passport.serializeUser( (user, cb) => {
  cb(null, user._id);
});

// Where to get the rest of the user's information (given what's in the box)
passport.deserializeUser( (userId, cb) => {

  // query the database with the _id
  User.findById(userId, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

    // send the user's info to passport
    cb(null, theUser);
  });
});



// FACEBOOK STRATEGY
passport.use(new FbStrategy(
  //first arg,
  {
    // facebook App ID
    clientID: process.env.FB_APP_ID,
    // facebook App Secret
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: '/auth/facebook/callback'
    //              ^^^  web address of a route in our app
  },
  // second arg, callback
  (accessToken, refreshToken, profile, done) => {
    console.log('FACEBOOK PROFILE ~~~~~~~~~~~~~~~~~', '\n');
    console.log(profile, '\n', '\n');


    // LOOK FOR THE USER BY FACEBOOK ID
    User.findOne(
      {facebookID: profile.id},

      (err, foundUser) => {
        if (err) {
          next(err);
          return;
        }

        // if the user is found, log them in
        if (foundUser) {
          done(null, foundUser);
          return;
        }

        // if no user is found create a new User in the db
        if (!foundUser) {
          const theUser = new User({
            facebookID: profile.id,
            name: profile.displayName
          });

          // save the user
          theUser.save( (err) => {
            if (err) {
              done(err);
              return;
            }
           // log them in
            done(null, theUser);
          });
        }
      }
    );
  }
));



// GOOGLE STRATEGY

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_APP_ID,
    clientSecret: process.env.GOOGLE_APP_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, next) => {


    User.findOne(
      { googleID: profile.id },
      (err, foundUser) => {
        if (err) {
          next(err);
          return;
        }

        if (foundUser) {
          next(null, foundUser);
          return;
        }

        if (!foundUser) {
          const theUser = new User({
            googleID: profile.id
          });

          if (!theUser.name) {
            theUser.name = profile.emails[0].value;
          }

          theUser.save( (err) => {
            if (err) {
              next(err);
              return;
            }
          });
        }
      }
    );
  }
));

// LOCAL STRATEGY
passport.use(new LocalStrategy(
  // 1st arg, optional, options to customer LocalStrategy
  {
    // these two refer to the 'name' field in our login form.

    // <input name="loginUserName">
    usernameField: 'loginUserName',
    // <input name="loginPassword">
    passwordField: 'loginPassword'
  },
  // 2nd arg, callback for the logic that validates the login
  (loginUsername, loginPassword, next) => {
    User.findOne({username: loginUsername},
      (err, theUser) => {
        // tell  passport if there was an error
        if (err) {
          next(err);
          return;
        }

        // tell passport if there is no user with given username
        if (!theUser) {
          //           vvv 2nd arg means that login failed
          next(null, false, {message: 'Wrong username, buddy. 😪'});
          return;
        }

        // tell passport if the passwords don't match
        if (!bcrypt.compareSync(loginPassword, theUser.encryptedPassword)) {
          next(null, false, {message: 'Wrong password, bitch! 😪'});
          return;
        }

        // give passport the user's details (SUCCESS!)
        next(null, theUser, {message: `Login for ${theUser.username} was successful! 😎`});
      }
    );
  }
));
