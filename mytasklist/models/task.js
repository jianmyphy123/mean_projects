const mongoose = require('mongoose');
const config = require('../config/database');

// User Schema
const UserSchema = mongoose.Schema({
  title: {
    type: String
  },
  isDone: {
    type: Boolean
  }
});

const Task = module.exports = mongoose.model('Task', UserSchema);

module.exports.getTasks = (callback) => {
  Task.find({}, callback);
}

module.exports.getOneTask = (id, callback) => {
  Task.findOne({_id: id}, callback);
}

module.exports.addTask = (task, callback) => {
  task.save(callback);
}

module.exports.removeTask = (id, callback) => {
  Task.remove({_id: id}, callback);
}

module.exports.updateTask = (id, task, callback) => {
  Task.update({_id: id}, task, callback);
}
