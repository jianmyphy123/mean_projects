angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'emailController'])

.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptors');
});
