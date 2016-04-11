
var app = angular.module('myApp', ['LocalStorageModule']).controller('LoginController', function($scope, localStorageService, $window, AuthService) {
	$scope.credentials = {
		username: '',
		password: '',
		tenant: ''
	};
	$scope.login = function (credentials) {
		console.log(credentials);
		
		console.log(AuthService.isAuthenticated());
		AuthService.login(credentials).then(function (userInfo) {
			//$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
			//$scope.setCurrentUser(user);
			console.log("user:" + localStorageService.get('userInfo'));
			console.log(AuthService.isAuthenticated());
			console.log("token: " + userInfo.token);
			$window.location.href = './index.html';
			}, function () {
			//$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
			console.log("login failed.")
		});
		
	};
});

app.factory('AuthService', function ($http, localStorageService) {
	var authService = {};
	console.log("AuthService begin");
	localStorageService.clearAll();
 
	authService.login = function (credentials) {
		var req = {
			method: 'POST',
			url: '/identity/api/tokens',
			headers: {
			   'Content-Type': 'application/json'
			},
			data: { username: credentials.username, password: credentials.password, tenant: 'vsphere.local' }
		};
		console.log("req:" + angular.toJson(req));
		var userInfo = {};
		return $http(req).then(function(res){
				console.log(res);
				userInfo = {
					username: credentials.username,
					token: res.data.id,
					expires: res.data.expires
				};
				console.log("userInfo:" + angular.toJson(userInfo));
				localStorageService.set('userInfo', angular.toJson(userInfo, true));
				return userInfo;
		});
	};
 
	authService.isAuthenticated = function () {
		var jsonstr = localStorageService.get('userInfo');
		console.log("isAuthenticated: jsonstr: " + jsonstr);
		if(!jsonstr) {
			return false;
		}
		var userInfo = angular.fromJson(jsonstr);
		if(userInfo.token == null) {
			return false;
		}
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
