angular.module('catalogservice', ['LocalStorageModule'])
.run(function($http, localStorageService) {
	var token = angular.fromJson(localStorageService.get('userInfo')).token;
	console.log('Token:' + token);
	$http.defaults.headers.common.Authorization = 'Bearer ' + token;
})
.constant("CATALOG_SERVICE", {
	"LIST_CATALOG_ITEMS": "/catalog-service/api/consumer/entitledCatalogItems",
	"LIST_CATALOG_ITEM_VIEWS": "/catalog-service/api/consumer/entitledCatalogItemViews/",
	"LIST_RESOURCES": "/catalog-service/api/consumer/resources/?page=1&limit=500",
	"LIST_VMS": "/catalog-service/api/consumer/resourceTypes/Infrastructure.Virtual",
	"LIST_REQUESTS": "/catalog-service/api/consumer/requests/?page=1&limit=500",
	"GET_VM_DETAILS": "/catalog-service/api/consumer/resources/",
	"VM_ACTIONS": "/catalog-service/api/consumer/resources/",
	"RESOURCE_VIEWS": "/catalog-service/api/consumer/resourceViews/"
})
.factory('CatalogService', function($http, CATALOG_SERVICE) {
	console.log("register catalog service");
	console.log("constant:" + CATALOG_SERVICE.LIST_CATALOG_ITEMS);
	var catalogService = {};
	catalogService.listCatalogItems = function() {
		var url = CATALOG_SERVICE.LIST_CATALOG_ITEMS;
		
		return $http.get(url).then(function(res) {
			console.log(res);
			return res.data.content;
		});
	}
	
	catalogService.listRequests = function() {
		var	url = CATALOG_SERVICE.LIST_REQUESTS;
		
		return $http.get(url).then(function(res) {
			console.log(res);
			return res.data.content;
		});
	}
	
	catalogService.listVMs = function() {
		var url = CATALOG_SERVICE.LIST_RESOURCES;
		
		return $http.get(url, {cache: true}).then(function(res) {
			console.log(res);
			var resources = res.data.content;
			var vms = resources.filter(function(resource) {
				return resource.resourceTypeRef.id === "Infrastructure.Virtual";
			});
			console.log("vms: " + vms);
			return vms;
		});
	}
	
	catalogService.getVMDetails = function(resourceId) {
		var url = CATALOG_SERVICE.GET_VM_DETAILS + resourceId;
		
		return $http.get(url, {cache: true}).then(function(res) {
			console.log("vm: " + res.data.name);
			console.log(res);
			return res.data;
		});
	}
	
	catalogService.getIconImage = function(iconId) {
		var url = "/catalog-service/api/icons/" + iconId;
		
		return $http.get(url, {cache: true}).then(function(res) {
			return "data:image/png;base64," + res.data.image;
		});
	}
	
	catalogService.powerOff = function(vmDetail) {
		var actionId = null;
		vmDetail.operations.forEach(function(op) {
			if(op.type === "ACTION" && op.bindingId.indexOf("PowerOff") > -1) {
				actionId = op.id;
			}
		});
		
		var url = CATALOG_SERVICE.VM_ACTIONS + vmDetail.id + "/actions/" + actionId + "/requests/template";
		
		$http.get(url).then(function(res){
			console.log(res);
			
			var	url2 = CATALOG_SERVICE.VM_ACTIONS + vmDetail.id + "/actions/" + actionId + "/requests";
			
			$http.post(url2, res.data).then(function(res){
				console.log("powerOff success!")
				console.log(res);
			});
		});
	}
	
	catalogService.openConsole = function(vmDetail) {
		var actionId = null;
		vmDetail.operations.forEach(function(op) {
			if(op.type === "EXTENSION" && op.extensionId.indexOf("ConnectViaVmrc") >= 0) {
				actionId = op.id;
			}
		});
		var	url = CATALOG_SERVICE.RESOURCE_VIEWS + vmDetail.id;
		
		$http.get(url).then(function(res){
			console.log(res);
			res.data.links.forEach(function(link) {
				if(link.rel.indexOf("ConnectViaVmrc") >= 0 && link.rel.indexOf("GET Template") >= 0) {
					console.log("hatos: " + link.href);
					console.log("action link:" + CATALOG_SERVICE.VM_ACTIONS + vmDetail.id + "/actions/" + actionId + "/requests");
					$http.get(link.href).then(function(res){
						console.log(res);
					});
				}
			});
		});
	}

	
	catalogService.requestItem = function(catalogItemId, description, reason, deployments) {
		var	url = CATALOG_SERVICE.LIST_CATALOG_ITEM_VIEWS + catalogItemId;
		console.log("requestItem:" + catalogItemId + "," + description + "," + reason + "," + deployments);
		$http.get(url).then(function(res) {
			console.log(res);
			var templateLink = res.data.links[0];
			var requestLink = res.data.links[1];
			if(res.data.links[1].rel.indexOf("Request Template") >= 0) {
				templateLink = res.data.links[1];
				requestLink = res.data.links[0];
			}
			console.log("templateLink:" + templateLink.href);
			var	templateUrl = templateLink.href;
			$http.get(templateUrl).then(function(res){
				console.log("template response: ");
				console.log(res);
				var reqData = res.data;
				reqData.description = description;
				reqData.reasons = reason;
				reqData.data._number_of_instances = deployments;
				
				var requestItemUrl = requestLink.href;
				$http.post(requestItemUrl, reqData).then(function(res){
					console.log("request response:");
					console.log(res);
				});
			});
		});
	}
	
	return catalogService;
});