const express    = require('express');
const ensure     = require('connect-ensure-login');
const multer     = require('multer');
const path       = require('path');

const Room       = require('../models/room-model');


const roomRoutes = express.Router();


roomRoutes.get('/rooms/new', ensure.ensureLoggedIn('/login'), (req, res, next) => {

  res.render('rooms/new-room-view');
});



const myUploader = multer({
  dest: path.join(__dirname, '../public/uploads')
});


roomRoutes.post(
  '/rooms',
  ensure.ensureLoggedIn('/login'),
  // name if the input in new-room-view
  myUploader.single('roomPhoto'),
  (req, res, next) => {

    console.log('FILE~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(req.file);

  const theRoom = new Room({
    name: req.body.roomName,
    description: req.body.roomDescription,
    photoAddress: `/uploads/${req.file.filename}`,
    owner: req.user._id
  });

  theRoom.save( (err) => {
    if (err) {
      next(err);
      return;
    }

    req.flash('success', 'Your room was saved successfully.');

    res.redirect('/rooms');
  });
});

roomRoutes.get('/rooms', ensure.ensureLoggedIn('/login'), (req, res, next) => {
  Room.find(
    { owner: req.user._id },
    (err, roomsList) => {
      if (err) {
        next(err);
        return;
      }

      res.render('rooms/rooms-list-view', {
        rooms: roomsList,
        successMessage: req.flash('success')
      });
    }
  );
});


module.exports = roomRoutes;
