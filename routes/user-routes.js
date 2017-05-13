const express = require('express');
const ensure = require('connect-ensure-login');
const User = require('../models/user-model');


const userRoute = express.Router();

userRoute.get(
  '/profile/edit',
  // if not logged in...
  // redirects to    ------vv
  ensure.ensureLoggedIn('/login'),
                    //    ^^^  default is '/login' if argument added
  (req, res, next) => {

    // if we didn't have ensureLoggedIn, we'd have to do...
    // if (!req.user) {
    //   res.redirect('/login');
    //   return;
    // }
    res.render('user/edit-profile-view', {successMessage: req.flash('success')
  });
  }
);


userRoute.post('/profile/edit', ensure.ensureLoggedIn('/login'), (req, res, next) => {

  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.profileName,
      username: req.body.profileUsername
    },
    (err, theUser) => {
      if (err) {
        next(err);
        return;
      }


      req.flash('success', 'Changes saved 💩');

      res.redirect('/profile/edit');
    }
  );
});


userRoute.get('/users', (req, res, next) => {

  // if logged in user is not an admin
  if (!req.user || req.user.role !== 'admin') {
    // show 404 page
    next();
    return;
  }


  User.find( (err, usersList) => {
    if (err) {
      next(err);
      return;
    }

    res.render('user/users-list-view', {
      users: usersList,
      successMessage: req.flash('success')
    });
  });
});


userRoute.post('/users/:id/admin', (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    // show 404 page
    next();
    return;
  }

  User.findByIdAndUpdate(
    req.params.id,
    {role: 'admin'},
    (err, theUser) => {
      if (err) {
        next(err);
        return;
      }

      req.flash('success', `${theUser.name} is now an admin`);

      res.redirect('/users');
    }
  );
});



module.exports = userRoute;
