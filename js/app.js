
'use strict';

// Declare app level module which depends on views, and components

angular.module('myApp', ['ui.router', 'ui.bootstrap', 'LocalStorageModule', 'catalogservice'])
.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/items');
	$stateProvider
		.state('items', {
			url:'/items',
			templateUrl: "views/items.html",
			controller: "itemController"
		})
		.state('vms', {
			url:'/vms',
			templateUrl: "views/vms.html",
			controller: "vmController"
		})
		.state('requests', {
			url:'/requests',
			templateUrl: "views/requests.html",
			controller: "RequestController"
		});
     // .otherwise({redirectTo: '/vms'});
})
.controller('itemController', function($scope, $uibModal, CatalogService, localStorageService) {
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
	$scope.request_submitted = { alert: false };
	
	$scope.open=function(item) {
		var modalInstance = $uibModal.open({
			animation:true,
			templateUrl: 'views/requestItemModal.html',
			controller: 'RequestItemController',
			size: 'lg',
			resolve: {
				catalogItem: function () {
				  return item;
				}
			}
		});
		modalInstance.result.then(function (catalogItem) {
		  $scope.request_submitted.alert = true;
		}, function () {
		  console.log('Modal dismissed at: ' + new Date());
		});
	};
	
	var items = CatalogService.listCatalogItems(token).then(function(content) {
		console.log("items:" + angular.toJson(content, true));
		$scope.items = content.map(function(elem) {
			var newElem = elem;
			newElem.jsonstr = angular.toJson(elem.catalogItem, true);
			return newElem;
		});
	}, function(res) {
	});
})
.controller('RequestItemController', function($scope, $uibModalInstance, catalogItem, CatalogService, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
	//$scope.openModal = function() {
		console.log("opening modal: " + catalogItem);
		$scope.item = catalogItem;
		$scope.deployments = 1;
		$scope.ok = function() {
			console.log("modal.OK");
			console.log("$scope.item:" + angular.toJson($scope.item));
			console.log("$scope.des:" + $scope.description);
			console.log("$scope.reason:" + $scope.reason);
			console.log("$scope.deployments:" + $scope.deployments);
			CatalogService.requestItem(token, $scope.item.catalogItem.id);
			$uibModalInstance.close($scope.item);
		};
		$scope.cancel = function() {
			console.log("modal.cancel");
			$uibModalInstance.dismiss("cancel");
		};
		//$modal.open({templateUrl:'views/requestItemModal.html'});
	//};
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