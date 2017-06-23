angular.module('mainController', ['authServices', 'userServices'])

.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope, $window, $interval, $route, User, AuthToken) {
  let app = this;

  app.loadme = false;

  app.checkSession = function() {
    if(Auth.isLoggedIn()) {
      app.checkingSession = true;
      var interval = $interval(function(){
        var token = $window.localStorage.getItem('token');
        if(token == null) {
          $interval.cancel(interval);
        } else {
          self.parseJwt = function(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
          }

          var expireTime = self.parseJwt(token);
          var timestamp = Math.floor(Date.now() / 1000);

          var timeCheck = expireTime.exp - timestamp;
          console.log(timeCheck);

          if(timeCheck<=25) {
            console.log('token has expired');
            showModal(1);
            $interval.cancel(interval);
          } else {
            console.log('token not yet expired');
          }
        }
      }, 2000);
    }
  }

  var showModal = function(option) {
    app.choiceMade = false;
    app.modalHeader = undefined;
    app.modalBody = undefined;
    app.hideButtons = false;

    if(option === 1) {
      app.modalHeader = 'Timeout Warning';
      app.modalBody = 'Your session will expired in 5 minutes. Would you like to renew your session?';
      $('#myModal').modal({backdrop: 'static'});
    } else if(option === 2) {
      app.hideButton = true;
      app.modalHeader = 'Logging Out';
      $('#myModal').modal({backdrop: 'static'});
      $timeout(function() {
        Auth.logout();
        $location.path('/');
        hideModal();
        $route.reload();
      }, 2000);
    }

    $timeout(function() {
      if(!app.choiceMade) {

        hideModal();
      }
    }, 4000);
  }

  app.checkSession();

  app.renewSession = function() {
    app.choiceMade = true;

    console.log('fwefwef');

    User.renewSession(app.username).then(function(data) { console.log(data);
      if(data.data.success) {
        AuthToken.setToken(data.data.token);
        app.checkSession();
      } else {
        app.modalBody = data.data.message;
      }
    });
    hideModal();
  }

  app.endSession = function() {
    app.choiceMade = true;
    console.log('session has ended');
    hideModal();
    $timeout(function() {
      showModal(2);
    }, 2000);
  }

  var hideModal = function() {
    $('#myModal').modal('hide');
  }

  $rootScope.$on('$routeChangeStart', function() {
    if(Auth.isLoggedIn()) {
      app.isLoggedIn = true;
      Auth.getUser().then(function(data) {
        console.log(data.data.username);
        app.username = data.data.username;
        app.useremail = data.data.email;
        app.loadme = true;
      });
    } else {
      app.isLoggedIn = false;
      app.username = '';
      app.loadme = true;
    }

    if($location.hash() == '_=_') $location.hash(null);
  });

  this.facebook = function() {
    app.disabled = true;
    $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
  }

  this.google = function() {
    app.disabled = true;
    $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
  }

  this.doLogin = function() {
    app.loading = true;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

    Auth.login(app.loginData).then(function(data) {
      if(data.data.success) {
        // Create Success message
        // Redirect to home page
        app.loading = false;
        app.successMsg = data.data.message + '...Redirecting';
        $timeout(function() {
          $location.path('/about');
          app.loginData = '';
          app.successMsg = false;
          app.checkSession();
        }, 2000);
      } else {
        if(data.data.expired) {
          // Create an error message
          app.expired = true;
          app.loading = false;
          app.errorMsg = data.data.message;
        } else {
          // Create an error message
          app.loading = false;
          app.disabled = false;
          app.errorMsg = data.data.message;
        }
      }
    });
  };

  app.logout = function() {

    // Auth.logout();
    // $location.path('/logout');
    // $timeout(function(){
    //   $location.path('/')
    // }, 2000);
    showModal(2);
  }
});
