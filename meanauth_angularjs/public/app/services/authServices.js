angular.module('authServices', [])

.factory('Auth', function($http, AuthToken) {
  let authFactory = {};

  // Auth.create(regData);
  authFactory.login = function(loginData) {
    return $http.post('/api/authenticate', loginData).then(function(data) {

      AuthToken.setToken(data.data.token);
      return data;
    });
  }

  // Auth.isLoggedIn()
  authFactory.isLoggedIn = function() {

    if(AuthToken.getToken()) {
      return true;
    } else {
      return false;
    }
  }

  // Auth.facebook(token);
  authFactory.facebook = function(token) {
    AuthToken.setToken(token);
  }

  // Auth.facebook(token);
  authFactory.google = function(token) {
    AuthToken.setToken(token);
  }

  // Auth.getUser()
  authFactory.getUser = function() {
    if(AuthToken.getToken()) {
      return $http.post('/api/me');
    } else {
      $q.reject({ message: 'User has no token' });
    }
  }

  // Auth.logout()
  authFactory.logout = function() {
    AuthToken.setToken();
  }

  return authFactory;
})

.factory('AuthToken', function($window) {
  let authTokenFactory = {};

  // AuthToken.setToken(token);
  authTokenFactory.setToken = function(token) {
    if(token) {
      $window.localStorage.setItem('token', token);
    } else {
      $window.localStorage.removeItem('token');
    }
  }

  // AuthToken.getItem();
  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  }

  return authTokenFactory;
})

.factory('AuthInterceptors', function(AuthToken) {
  let authIntercetorsFactory = {};

  authIntercetorsFactory.request = function(config) {

    let token = AuthToken.getToken();

    if(token)
      config.headers['x-access-token'] = token;

    return config;
  }

  return authIntercetorsFactory;
});
