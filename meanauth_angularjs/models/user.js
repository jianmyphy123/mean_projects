const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const titlize = require('mongoose-title-case');
const validate = require('mongoose-validator');

const Schema = mongoose.Schema;

var nameValidator = [
  validate({
    validator: 'matches',
    arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
    message: 'Name must be at least 3, max 30, no special characters, must have space in between name'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 20],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Email is not a valid e-mail'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Username must contain letters and numbers only'
  })
];

var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
    message: 'Password must be at least one lower case, one upper case, one number, one special character and must be at least 8 characters but no more than 35.'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 25],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: nameValidator
  },
  username: {
    type: String,
    requied: true,
    unique: true,
    validate: usernameValidator
  },
  password: {
    type: String,
    required: true,
    validate: passwordValidator,
    select: false
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    validate: emailValidator
  },
  active: {
    type: Boolean,
    required: true,
    default: false
  },
  temporaryToken: {
    type: String,
    required: true
  },
  resettoken: {
    type: String,
    required: false
  }
});

UserSchema.pre('save', function(next) {
  let user = this;

  if(!user.isModified('password')) return next();
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if(err) throw err;
    user.password = hash;
    next();
  })
});

UserSchema.plugin(titlize, {
  paths: [ 'name' ]
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);
