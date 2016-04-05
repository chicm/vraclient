
var app = angular.module('myApp', []).controller('LoginController', function($scope, $window, AuthService) {
	$scope.credentials = {
		username: '',
		password: ''
	};
	$scope.login = function (credentials) {
		console.log(credentials);
		
		AuthService.login(credentials);/*.then(function (user) {
			//$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			$scope.setCurrentUser(user);
			}, function () {
			//$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		});*/
		
		$window.location.href = '/index.html';
	};
});


app.factory('AuthService', function ($http) {
  var authService = {};
 
  authService.login = function (credentials) {
    return credentials.username;
	
	/*$http
      .post('/login', credentials)
      .then(function (res) {
        Session.create(res.data.id, res.data.user.id,
                       res.data.user.role);
        return res.data.user;
      });*/
  };
 
  authService.isAuthenticated = function () {
    return true;
  };
/* 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 */
  return authService;
})