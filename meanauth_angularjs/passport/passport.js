var session = require('express-session');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
const jwt = require('jsonwebtoken');
const secret = 'jianmyphy';

module.exports = (app, passport) => {
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

  passport.serializeUser(function(user, done) {
    if(user.active) {
      token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
    } else {
      token = 'inactive/error';
    }
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
      clientID: '468936066804168',
      clientSecret: '41d7513b0c9d4f828969d4588ecfb5ce',
      callbackURL: "http://localhost:3001/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile._json.email);

      User.findOne({ email: profile._json.email }).select('username active password email').exec(function(err, user) {
        if(err) done(err);
        if(user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: '231059594220-m99aef3ivmikpkgaot52trjgrlo34seb.apps.googleusercontent.com',
      clientSecret: 'JMoj85dpHrjiN_7eR4XkRyDf',
      callbackURL: "http://localhost:3001/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile.emails[0].value);
      User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user) {
        if(err) done(err);
        if(user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));

  app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));

  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
      res.redirect('/google/' + token);
  });

  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res) {
      res.redirect('/facebook/' + token);
  });

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
}
