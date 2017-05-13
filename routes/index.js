const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

  console.log('HOME ~~~~~~~~~~~~``');

  console.log('SESSION (from express-session)', req.session);

  console.log('USER (from Passport)', req.user);

  // render the homepage with the user's name when logged in.
  res.render('index', {
    successMessage: req.flash('success')
    //                           ^^^^ default success message key from Passport
  });
});

module.exports = router;
