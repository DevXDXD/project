const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: String,
  firstName: String,
  lastName: String,
  image: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
