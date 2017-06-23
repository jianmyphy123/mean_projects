const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secret = 'jianmyphy';
const nodemailer = require('nodemailer');
const mailconfig = require('../config/mail');


var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: mailconfig.username,
    pass: mailconfig.password
  }
});

// http://localhost:3000/api/users
// User Registeration Route
router.post('/users', function(req, res) { console.log(req.body);



  if(req.body.name == null || req.body.name == '' || req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '') {
    res.json({ success: false, message: 'Ensure name, username, password and email were provided'});
  } else {
    let user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      temporaryToken: jwt.sign({ username: req.body.username, email: req.body.email }, secret, { expiresIn: '1h'})
    });
    user.save(function(err) {

      if(err) {

        if(err.errors != null) {
          if(err.errors.name) {
            res.json({ success: false, message: err.errors.name.message });
          } else if(err.errors.email) {
            res.json({ success: false, message: err.errors.email.message });
          } else if(err.errors.username) {
            res.json({ success: false, message: err.errors.username.message });
          } else if(err.errors.password) {
            res.json({ success: false, message: err.errors.password.message });
          } else {
            res.json({ success: false, message: err });
          }
        } else if(err){
          if(err.code == 11000)
            res.json({ success: false, message: err.errmsg });
          else
            res.json({ success: false, message: err });
        }

      } else {

        var mainOptions = {
          from: 'John Doe <johndoe@outlook.com>',
          to: user.email,
          subject: 'Localhost Activation Link',
          text: 'Hello '+user.name+',Thank you for your registering at localhost.com. Please click on the link to complete your activation: http://localhost:3001/activate/'+user.temporaryToken,
          html: 'Hello<strong>'+user.name+'</strong>,<br><br>Thank you for your registering at localhost.com. Please click on the link to complete your activation: <br><br><a href="http://localhost:3001/activate/'+user.temporaryToken+'">http://localhost:3001/activate</a>'
        }

        transporter.sendMail(mainOptions, function(error, info) {
          if(error) {
            console.log(error);
          }
          else {
            console.log('Message Sent: '+info.response);
          }
        });

        res.json({ success: true, message: 'Account registered! Please check your e-mail for activation link'});
      }
    });
  }
});

router.post('/checkusername', function(req, res) {
  User.findOne({ username: req.body.username }).select('username').exec(function(err, user) {
    if(err) throw err;

    if(user) {
      res.json({ success: false, message: 'The username is already taken' });
    } else {
      res.json({ success: true, message: 'Valid username' });
    }
  });
});

router.post('/checkemail', function(req, res) {
  User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
    if(err) throw err;

    if(user) {
      res.json({ success: false, message: 'The e-mail is already taken' });
    } else {
      res.json({ success: true, message: 'Valid e-mail' });
    }
  });
});

// http://localhost:3000/api/authenticate
// User Login Route
router.post('/authenticate', function(req, res) {
  User.findOne({ username: req.body.username }).select('email username password active').exec(function(err, user) {
    if(err) throw err;
    if(!user) {
      res.json({ success: false, message: 'Could not authenticate user'});
    } else if(user){
      if(req.body.password) {
        var validPassword = user.comparePassword(req.body.password);
      } else {
        res.json({ success: false, message: 'No password provided' });
      }
      if(!validPassword) {
        res.json({ success: false, message: 'Could not authenticate password'});
      } else if(!user.active) {
        res.json({ success: false, message: 'Account is not yet activated. Please check your e-mail for activation link.', expired: true });
      }
      else {
        let token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '30s' });
        res.json({ success: true, message: 'User authenticated!', token: token });
      }
    }
  });
});

router.put('/activate/:token', function(req, res) {
  User.findOne({ temporaryToken: req.params.token }, function(err, user) {
    if(err) throw err;

    var token = req.params.token;

    jwt.verify(token, secret, function(err, decoded) {
      if(err) {
        res.json({ success: false, message: 'Activation link has expires' });
      } else if(!user) {
        res.json({ success: false, message: 'Activation link has expires' });
      } else {
        user.temporaryToken = false;
        user.active = true;

        user.save(function(err) {
          if(err) {
            console.log(err);
          } else {

            var mainOptions = {
              from: 'John Doe <johndoe@outlook.com>',
              to: user.email,
              subject: 'Localhost Account Activated',
              text: 'Hello '+user.name+', Your account has been successfully activated!',
              html: 'Hello <strong>'+user.name+'</strong>,<br><br>Your account has been successfully activated!'
            }

            transporter.sendMail(mainOptions, function(error, info) {
              if(error) {
                console.log(error);
              }
              else {
                console.log('Message Sent: '+info.response);
              }
            });

            res.json({ success: true, message: 'Account Activated!' });
          }
        })


      }

    });
  });
});

router.post('/resend', function(req, res) {
  User.findOne({ username: req.body.username }).select('email username password active').exec(function(err, user) {
    if(err) throw err;
    if(!user) {
      res.json({ success: false, message: 'Could not authenticate user'});
    } else if(user){
      if(req.body.password) {
        var validPassword = user.comparePassword(req.body.password);
      } else {
        res.json({ success: false, message: 'No password provided' });
      }
      if(!validPassword) {
        res.json({ success: false, message: 'Could not authenticate password'});
      } else if(user.active) {
        res.json({ success: false, message: 'Account is already activated' });
      }
      else {
        res.json({ success: true, user: user });
      }
    }
  });
});

router.put('/resend', function(req, res) {
  User.findOne({ username: req.body.username }).select('username name email temporaryToken').exec(function(err, user) {
    if(err) throw err;

    user.temporaryToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'});
    user.save(function(err) {
      if(err) {
        console.log(err);
      } else {
        var mainOptions = {
          from: 'John Doe <johndoe@outlook.com>',
          to: user.email,
          subject: 'Localhost Activation Link Request',
          text: 'Hello '+user.name+', You recently requested a new account activation link. Please click on the link to complete your activation: http://localhost:3001/activate/'+user.temporaryToken,
          html: 'Hello<strong>'+user.name+'</strong>,<br><br>You recently requested a new account activation link. Please click on the link to complete your activation: <br><br><a href="http://localhost:3001/activate/'+user.temporaryToken+'">http://localhost:3001/activate</a>'
        }

        transporter.sendMail(mainOptions, function(error, info) {
          if(error) {
            console.log(error);
          }
          else {
            console.log('Message Sent: '+info.response);
          }
        });

        res.json({ success: true, message: 'Activation has been sent to ' + user.email + '!'});
      }
    });
  });
});

router.get('/resetusername/:email', function(req, res) {
  console.log(req.params.email);
  User.findOne({email: req.params.email}).select('username name email').exec(function(err, user) {
    if(err) {
      res.json({success: false, message: err});
    } else {
      if(!req.params.email) {
        res.json({success: false, message: 'No e-mail was provided.'});
      } else {
        if(!user) {
          res.json({success: false, message: 'E-mail not found'});
        } else {

          var mainOptions = {
            from: 'John Doe <johndoe@outlook.com>',
            to: user.email,
            subject: 'Localhost Username Request',
            text: 'Hello '+user.name+', You recently requested your username. Please save it in your files: ' + user.username,
            html: 'Hello<strong>'+user.name+'</strong>,<br><br>You recently requested your username. Please save it in your files: ' + user.username
          }

          transporter.sendMail(mainOptions, function(error, info) {
            if(error) {
              console.log(error);
            }
            else {
              console.log('Message Sent: '+info.response);
            }
          });

          res.json({success: true, message: 'Username has been sent to e-mail!'});
        }
      }
    }
  });
});

router.put('/resetpassword', function(req, res) {
  User.findOne({username: req.body.username }).select('username active email resettoken name').exec(function(err, user) {
    if(err) throw err;
    if(!user) {
      res.json({ success: false, message: 'Username not found'});
    } else if(!user.active) {
      res.json({ success: false, message: 'Account has not activated'});
    } else {
      user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'});
      user.save(function(err) {
        if(err) {
          res.json({success: false, message: err});
        } else {

          var mainOptions = {
            from: 'John Doe <johndoe@outlook.com>',
            to: user.email,
            subject: 'Localhost Reset Password Request',
            text: 'Hello '+user.name+', You recently request a password reset link. Please click on the following link to complete your activation: http://localhost:3001/reset/'+user.resettoken,
            html: 'Hello<strong>'+user.name+'</strong>,<br><br>You recently request a password reset link. Please click on the following link to complete your activation: <br><br><a href="http://localhost:3001/reset/'+user.resettoken+'">http://localhost:3001/reset/</a>'
          }

          console.log(mainOptions);

          transporter.sendMail(mainOptions, function(error, info) {
            if(error) {
              console.log(error);
            }
            else {
              console.log('Message Sent: '+info.response);
            }
          });

          res.json({success: true, message: 'Please check e-mail for password reset link'});
        }
      })
    }
  });
});

router.get('/resetpassword/:token', function(req, res){
  User.findOne({ resettoken: req.params.token}).select('').exec(function(err, user) {
    if(err) throw err;
    var token = req.params.token;

    jwt.verify(token, secret, function(err, decode) {
      if(err) {
        res.json({success: false, message: 'Password link has expired'});
      } else {
        if(!user) {
          res.json({success: false, message: 'Password link has expired'});
        } else
          res.json({success: true, user: user});
      }
    })
  });
});

router.put('/savepassword', function(req, res) {console.log(req.body);
  User.findOne({username: req.body.username}).select('username name password resettoken email').exec(function(err, user) {
    if(err) throw err;
    if(req.body.password == null | req.body.password == '') {
      res.json({success: false, message: 'Password not provided'});
    } else {
      user.password = req.body.password;
      user.resettoken = false;
      user.save(function(err) {
        if(err) {
          res.json({success: false, message: err});
        } else {
          var mainOptions = {
            from: 'John Doe <johndoe@outlook.com>',
            to: user.email,
            subject: 'Localhost Reset Password',
            text: 'Hello '+user.name+', This e-mail is to notify you that your password was recently reset at localhost.com',
            html: 'Hello<strong>'+user.name+'</strong>,<br><br> This e-mail is to notify you that your password was recently reset at localhost.com'
          }

          console.log(mainOptions);

          transporter.sendMail(mainOptions, function(error, info) {
            if(error) {
              console.log(error);
            }
            else {
              console.log('Message Sent: '+info.response);
            }
          });

          res.json({success: true, message: 'Password has been reset!'});
        }
      });
    }

  })
});

router.use(function(req, res, next) {
  let token = req.body.token || req.body.query || req.headers['x-access-token'];

  if(token) {
    // verify token
    jwt.verify(token, secret, function(err, decoded) {
      if(err) {
        res.json({ success: false, message: 'Token invalid' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.json({ success: false, message: 'No token provided' });
  }
});

router.post('/me', function(req, res) {
  res.send(req.decoded);
});

router.get('/renewToken/:username', function(req, res) {
  User.findOne({username: req.params.username}).select('').exec(function(err, user) {
    if(err) throw err;
    if(!user) {
      res.json({success: false, message: 'No user not found'});
    } else {
      var newToken = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '24h'});
      res.json({success: true, message: 'User authenticated', token: newToken});
    }
  });
});

module.exports = router;
