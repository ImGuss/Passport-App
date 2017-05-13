const express       = require('express');
const path          = require('path');
const favicon       = require('serve-favicon');
const logger        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const layouts       = require('express-ejs-layouts');
const mongoose      = require('mongoose');
const session       = require('express-session');
const passport      = require('passport');
const flash         = require('connect-flash');


//load our ENVIRONMENT VARIABLES from the .env file in dev
// for dev only, won't affect anything in production. harmless
require('dotenv').config();


// runs the code in this file
// this is our passport strategies
require('./config/passport-config');


mongoose.connect(process.env.MONGODB_URI);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);


app.use( session( {
  // this secret needs to be different every time. it could be anything
  secret: 'my cool passport app',
  resave: true,
  saveUninitialized: true
}));

// These two need to go AFTER the session middleware
app.use(passport.initialize());
app.use(passport.session());
// ... and they need to go BEFORE your routes


app.use(flash());


// This middleware sets the user variable for all views if logged in so you don't need to add it to the render.
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }

  next();
});
// PASSPORT GOES THROUGH THIS
  // 1. Our form
  // 2. LocalStrategy callback
  // 3. (if successful) passport.serializeUser()



// BEGIN ROUTES
// -------------------------------------------------
const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth-routes');
app.use(authRoutes);

const userRoutes = require('./routes/user-routes');
app.use(userRoutes);

const roomRoutes = require('./routes/room-routes');
app.use(roomRoutes);
// -------------------------------------------------
// END ROUTES



// BEGIN ERRORS
// -------------------------------------------------
// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// -------------------------------------------------
//END ERRORS

module.exports = app;
