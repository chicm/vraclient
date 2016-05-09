
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
	$scope.items = [];
	var items = CatalogService.listCatalogItems(token).then(function(content) {
		console.log("items:" + angular.toJson(content, true));
		$scope.items = content.map(function(elem) {
			var newElem = elem;
			newElem.jsonstr = angular.toJson(elem.catalogItem, true);
			newElem.image = "";
			CatalogService.getIconImage(token, elem.catalogItem.iconId).then(function(imageContent){
				newElem.image = imageContent;
			});
			return newElem;
		});
	}, function(res) {
	});
})
.controller('RequestItemController', function($scope, $uibModalInstance, catalogItem, CatalogService, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
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
})
.controller('vmController', function($scope, CatalogService, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
	
	$scope.powerOff = function(vmDetail) {
		console.log("powerOff: " + vmDetail.id + " :" + vmDetail.name);
		CatalogService.powerOff(token, vmDetail);
	};
	
	$scope.openConsole = function(vmDetail) {
		console.log("open console: " + vmDetail.id + " :" + vmDetail.name);
		CatalogService.openConsole(token, vmDetail);
	};
	
	CatalogService.listVMs(token).then(function(vms) {
		console.log("vms:" + vms);
		$scope.vmDetails = [];
		vms.forEach(function(vm) {
			console.log("vm id:" + vm.id);
			CatalogService.getVMDetails(token, vm.id).then(function(vmDetail){
				for(var entry of vmDetail.resourceData.entries) {
					if(entry.key === "MachineStatus") {
						vmDetail.machineStatus = entry.value.value;
						break;
					}
				}
				CatalogService.getIconImage(token, vmDetail.iconId).then(function(imageContent){
					vmDetail.image = imageContent;
				});
				$scope.vmDetails.push(vmDetail);
				//console.log("vm Details:" + angular.toJson(vmDetail));
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