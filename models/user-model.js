const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  // first arg, fields of the collection
  {
    // all users have a name
    name: { type: String },
    role: {
      type: String,
      enum: ['normal user', 'admin'],
      default: 'normal user'
    },

    // 3 types of users....

    // traditional registration users
    username: {type: String},
    encryptedPassword: {type: String},

    // login with facebook users
    facebookID: {type: String},
    // login with google users
    googleID: {type: String},
  },

  // second arg, additional options
  {
    // adds created at & updated at
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
