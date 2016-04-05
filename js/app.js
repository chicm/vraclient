
'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', [
  'ngRoute'
]).config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/home', {
        templateUrl: "views/dashboard.html",
        controller: "homeController"
      })
      .when('/items', {
        templateUrl: "views/items.html",
        controller: "itemController"
      })
      .when('/vms', {
        templateUrl: "views/vms.html",
        controller: "vmController"
      })
	  .when('/items2', {
        templateUrl: "views/items2.html",
        controller: "vmController"
      })
      .otherwise({redirectTo: '/vms'});
}])

.controller('homeController', function() {

})
.controller('itemController', function() {

})
.controller('vmController', function() {

})


.controller('NavController', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
		console.log($location.path());
		return (viewLocation === $location.path());
	};
});