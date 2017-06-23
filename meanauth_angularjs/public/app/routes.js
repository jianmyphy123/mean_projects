angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

  $routeProvider

  .when('/', {
    templateUrl: 'app/views/pages/home.html'
  })

  .when('/about', {
    templateUrl: 'app/views/pages/about.html'
  })

  .when('/register', {
    templateUrl: 'app/views/pages/users/register.html',
    controller: 'regCtrl',
    controllerAs: 'register'
  })

  .when('/login', {
    templateUrl: 'app/views/pages/users/login.html'
  })

  .when('/logout', {
    templateUrl: 'app/views/pages/users/logout.html'
  })

  .when('/profile', {
    templateUrl: 'app/views/pages/users/profile.html'
  })

  .when('/facebook/:token', {
    templateUrl: 'app/views/pages/users/social/social.html',
    controller: 'facebookCtrl',
    controllerAs: 'facebook'
  })

  .when('/facebookerror', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'facebookCtrl',
    controllerAs: 'facebook'
  })

  .when('/google/:token', {
    templateUrl: 'app/views/pages/users/social/social.html',
    controller: 'googleCtrl',
    controllerAs: 'google'
  })

  .when('/googleerror', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'googleCtrl',
    controllerAs: 'google'
  })

  .when('/facebook/inactive/error', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'facebookCtrl',
    controllerAs: 'facebook'
  })

  .when('/google/inactive/error', {
    templateUrl: 'app/views/pages/users/login.html',
    controller: 'googleCtrl',
    controllerAs: 'google'
  })

  .when('/activate/:token', {
    templateUrl: 'app/views/pages/users/activation/activate.html',
    controller: 'emailCtrl',
    controllerAs: 'email'
  })

  .when('/resend', {
    templateUrl: 'app/views/pages/users/activation/resend.html',
    controller: 'resendCtrl',
    controllerAs: 'resend'
  })

  .when('/resetusername', {
    templateUrl: 'app/views/pages/users/reset/username.html',
    controller: 'usernameCtrl',
    controllerAs: 'username'
  })

  .when('/resetpassword', {
    templateUrl: 'app/views/pages/users/reset/password.html',
    controller: 'passwordCtrl',
    controllerAs: 'password'
  })

  .when('/reset/:token', {
    templateUrl: 'app/views/pages/users/reset/newpassword.html',
    controller: 'resetCtrl',
    controllerAs: 'reset'
  })

  .otherwise({ redirectTo: '/'});

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

});
