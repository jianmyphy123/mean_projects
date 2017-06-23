angular.module('userControllers', ['userServices'])

.controller('regCtrl', function($http, $location, $timeout, User) {

  let app = this;

  app.regUser = function(valid, confirmed) {
    app.loading = true;
    app.errorMsg = false;
    app.disabled = true;

    if(valid && confirmed) {
      User.create(app.regData).then(function(data) {
        if(data.data.success) {
          // Create Success message
          // Redirect to home page

          app.loading = false;
          app.successMsg = data.data.message + '...Redirecting';
          $timeout(function() {
            $location.path('/');
          }, 2000);
        } else {
          // Create an error message
          app.loading = false;
          app.disabled = false;
          app.errorMsg = data.data.message;
        }
      });
    } else {
      app.loading = false;
      app.disabled = false;
      app.errorMsg = 'Please ensure form is filled our properly';
    }
  };

  app.checkUsername = function() {
    app.checkingUsername = true;
    app.usernameMsg = false;
    app.usernameInvalid = false;

    User.checkUsername(app.regData).then(function(data) {
      if(data.data.success) {
        app.checkingUsername = false;
        app.usernameInvalid = false;
        app.usernameMsg = data.data.message;
      } else {
        app.checkingUsername = false;
        app.usernameInvalid = true;
        app.usernameMsg = data.data.message;
      }
    });
  }

  app.checkEmail = function() {
    app.checkingEmail = true;
    app.emailMsg = false;
    app.emailInvalid = false;

    User.checkEmail(app.regData).then(function(data) {
      if(data.data.success) {
        app.checkingEmail = false;
        app.emailInvalid = false;
        app.emailMsg = data.data.message;
      } else {
        app.checkingEmail = false;
        app.emailInvalid = true;
        app.emailMsg = data.data.message;
      }
    });
  }

})

.directive('match', function() {
  return {
    restrict: 'A',

    controller: function($scope) {

      $scope.confirmed = false;

      $scope.doConfirm = function(values) {
        values.forEach(function(val) {
          if($scope.confirm == val) {
            $scope.confirmed = true;
          } else {
            $scope.confirmed = false;
          }
        })

      }
    },

    link: function(scope, element, attr) {
      attr.$observe('match', function() {
        scope.matches = JSON.parse(attr.match);
        scope.doConfirm(scope.matches);
      });

      scope.$watch('confirm', function() {
        scope.matches = JSON.parse(attr.match);
        scope.doConfirm(scope.matches);
      });
    }
  };
})

.controller('facebookCtrl', function($routeParams, Auth, $location, $window) {

  let app = this;
  app.errorMsg = false;
  app.expired = false;
  app.disabled = true;

  if($window.location.pathname == '/facebookerror') {
    app.errorMsg = 'Facebook e-mail not found in database.';
  } else if($window.location.pathname == '/facebook/inactive/error') {
    app.expired = true;
    app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.';
  } else {
    // Auth.facebook(token);
    Auth.facebook($routeParams.token);
    $location.path('/');
  }
})

.controller('googleCtrl', function($routeParams, Auth, $location, $window) {

  let app = this;
  app.errorMsg = false;
  app.expired = false;
  app.disabled = true;

  if($window.location.pathname == '/googleerror') {
    app.errorMsg = 'Google e-mail not found in database.';
  } else if($window.location.pathname == '/google/inactive/error') {
    app.expired = true;
    app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.';
  } else {
    // Auth.google(token);
    Auth.google($routeParams.token);
    $location.path('/');
  }
});
