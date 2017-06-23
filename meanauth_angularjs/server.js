const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyPaser = require('body-parser');
const path = require('path');
const passport = require('passport');

const config = require('./config/database');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 3001;

const api = require('./routes/api');
const social = require('./passport/passport')(app, passport);

mongoose.connect(config.database, function(err) {
  if(err) {
    console.log('Not connected to database '+err);
  } else {
    console.log('Successfully connnected to MongoDB');
  }
});

app.use(morgan('dev'));
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));

app.use('/api', api);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/app/views/index.html'));
});

app.listen(port, function() {
  console.log('Running the server on ' + port);
});
