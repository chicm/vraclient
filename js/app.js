
'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', ['ngRoute', 'LocalStorageModule', 'catalogservice'])
.config(['$routeProvider', function($routeProvider) {
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
	  .when('/requests', {
        templateUrl: "views/requests.html",
        controller: "RequestController"
      })
      .otherwise({redirectTo: '/vms'});
}])

.controller('homeController', function() {

})
.controller('itemController', function($scope, CatalogService, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
	console.log('itemController:' + token);
	/*
	$scope.items = [{
		catalogItem: {
			name: 'CentOS6.3',
			description: 'CentOS6.3 blueprint'
		}	
	}, 
	{
		catalogItem: {
			name: 'RedHat 6.4',
			description: 'RedHat 6.4 blueprint'
		}
	}];*/
	
	var items = CatalogService.listCatalogItems(token).then(function(content) {
		$scope.items = content;
		console.log("items:" + content);
	}, function(res) {
	});
})
.controller('vmController', function($scope, CatalogService, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
	CatalogService.listVMs(token).then(function(vms) {
		console.log("vms:" + vms);
		$scope.vms = vms;
		$scope.vmDetails = [];
		vms.forEach(function(vm) {
			console.log("vm id:" + vm.id);
			CatalogService.getVMDetails(token, vm.id).then(function(vmDetail){
				$scope.vmDetails.push(vmDetail);
			}, function(res){});
		});
	}, function(res) {
	});
})

.controller('RequestController', function($scope, CatalogService, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
	console.log('itemController:' + token);
	
	var items = CatalogService.listRequests(token).then(function(content) {
		$scope.requests = content;
		console.log("requests:" + $scope.requests);
	}, function(res) {
	});
})
.controller('TopController', function($scope, localStorageService) {
	console.log("userInfo:" + localStorageService.get('userInfo'));
	$scope.username = angular.fromJson(localStorageService.get('userInfo')).username;
})

.controller('NavController', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
		//console.log($location.path());
		return (viewLocation === $location.path());
	};
});