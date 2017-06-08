const express = require('express');
const router = express.Router();
const config = require('../config/database');
const Task = require('../models/task');

// Get All Tasks
router.get('/tasks', (req, res, next) => {
  Task.getTasks((err, tasks) => {
    if(err) throw err;
    res.json(tasks);
  });
  //res.render('index', { title: 'MyTaskList' });
});

// Get Single Task
router.get('/tasks/:id', (req, res, next) => {
  Task.getOneTask(req.params.id, (err, task) => {
    if(err) throw err;
    res.json(task);
  });
});

// Add Task
router.post('/task', (req, res, next) => {
  var task = req.body;
  if(!task.title || !(task.isDone + '')) {
    res.status(400);
    res.json({
      error: 'Bad Data'
    });
  } else {
    let newTask = new Task({
      title: task.title,
      isDone: task.isDone
    });

    Task.addTask(newTask, (err, task) => {
      if(err) {
        res.send(err);
      } else {
        res.json(task);
      }
    });
  }
});

// Delete Task
router.delete('/task/:id', (req, res, next) => {
  Task.removeTask(req.params.id, (err, task) => {
    if(err) {
      res.send(err);
    } else {
      res.json(task);
    }
  });
});

// Update Task
router.put('/task/:id', (req, res, next) => {
  let task = req.body;
  let updateTask = {};

  if(task.title) {
    updateTask.title = task.title;
  }
  if(task.isDone) {
    updateTask.isDone = task.isDone;
  }

  console.log(updateTask);

  if(!updateTask) {
    res.status(400);
    res.json({
      error: 'Bad Data'
    });
  } else {
    Task.updateTask(req.params.id, task, (err, task) => {
      if(err)
        res.send(err);
      else
        res.json(task);
    });
  }
});

module.exports = router;
