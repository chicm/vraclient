'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/home', {
        templateUrl: "views/home.html",
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
      .otherwise({redirectTo: '/home'});
}]);
