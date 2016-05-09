angular.module('catalogservice', [])
.constant("CATALOG_SERVICE", {
	"LIST_CATALOG_ITEMS": "/catalog-service/api/consumer/entitledCatalogItems",
	"LIST_CATALOG_ITEM_VIEWS": "/catalog-service/api/consumer/entitledCatalogItemViews/",
	"LIST_RESOURCES": "/catalog-service/api/consumer/resources/?page=1&limit=100",
	"LIST_VMS": "/catalog-service/api/consumer/resourceTypes/Infrastructure.Virtual",
	"LIST_REQUESTS": "/catalog-service/api/consumer/requests",
	"GET_VM_DETAILS": "/catalog-service/api/consumer/resources/",
	"VM_ACTIONS": "/catalog-service/api/consumer/resources/",
	"RESOURCE_VIEWS": "/catalog-service/api/consumer/resourceViews/"
})
.factory('CatalogService', function($http, CATALOG_SERVICE) {
	console.log("register catalog service");
	console.log("constant:" + CATALOG_SERVICE.LIST_CATALOG_ITEMS);
	var catalogService = {};
	catalogService.listCatalogItems = function(token) {
		var req = {
			method: 'GET',
			url: CATALOG_SERVICE.LIST_CATALOG_ITEMS,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		};
		return $http(req).then(function(res) {
			console.log(res);
			return res.data.content;
		});
	}
	
	catalogService.listRequests = function(token) {
		var req = {
			method: 'GET',
			url: CATALOG_SERVICE.LIST_REQUESTS,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		};
		return $http(req).then(function(res) {
			console.log(res);
			return res.data.content;
		});
	}
	
	catalogService.listVMs = function(token) {
		var req = {
			method: 'GET',
			url: CATALOG_SERVICE.LIST_RESOURCES,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		};
		return $http(req).then(function(res) {
			console.log(res);
			var resources = res.data.content;
			var vms = resources.filter(function(resource) {
				return resource.resourceTypeRef.id === "Infrastructure.Virtual";
			});
			console.log("vms: " + vms);
			return vms;
		});
	}
	
	catalogService.getVMDetails = function(token, resourceId) {
		var req = {
			method: 'GET',
			url: CATALOG_SERVICE.GET_VM_DETAILS + resourceId,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		};
		return $http(req).then(function(res) {
			console.log("vm: " + res.data.name);
			console.log(res);
			return res.data;
		});
	}
	
	catalogService.getIconImage = function(token, iconId) {
		var reqIcon = {
			method: 'GET',
			url: "/catalog-service/api/icons/" + iconId,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		}
		return $http(reqIcon).then(function(res) {
			return "data:image/png;base64," + res.data.image;
		});
	}
	
	catalogService.powerOff = function(token, vmDetail) {
		var actionId = null;
		vmDetail.operations.forEach(function(op) {
			if(op.type === "ACTION" && op.bindingId.indexOf("PowerOff") > -1) {
				actionId = op.id;
			}
		});
		var req1 = {
			method: 'GET',
			url: CATALOG_SERVICE.VM_ACTIONS + vmDetail.id + "/actions/" + actionId + "/requests/template",
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		}
		$http(req1).then(function(res){
			console.log(res);
			var req2 = {
				method: 'POST',
				url: CATALOG_SERVICE.VM_ACTIONS + vmDetail.id + "/actions/" + actionId + "/requests",
				headers: {
					'Authorization': 'Bearer ' + token
				},
				data: res.data
			};
			$http(req2).then(function(res){
				console.log("powerOff success!")
				console.log(res);
			});
		});
	}
	
	catalogService.openConsole = function(token, vmDetail) {
		
		var actionId = null;
		vmDetail.operations.forEach(function(op) {
			if(op.type === "EXTENSION" && op.extensionId.indexOf("ConnectViaVmrc") >= 0) {
				actionId = op.id;
			}
		});
		var req1 = {
			method: 'GET',
			url: CATALOG_SERVICE.RESOURCE_VIEWS + vmDetail.id,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		}
		
		var reqOp = {
			method: 'GET',
			//url: "/catalog-service/api/resourceOperations",
			//url: "/catalog-service/api/plugins",
			url: "/catalog-service/api/icons/" + vmDetail.iconId,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		}
		
		$http(reqOp).then(function(res) {
			console.log(res);
		});
		
		/*
		$http(req1).then(function(res){
			console.log(res);
			res.data.links.forEach(function(link) {
				if(link.rel.indexOf("ConnectViaVmrc") >= 0 && link.rel.indexOf("GET Template") >= 0) {
					console.log("hatos: " + link.href);
					console.log("action link:" + CATALOG_SERVICE.VM_ACTIONS + vmDetail.id + "/actions/" + actionId + "/requests");
					var req2 = {
						method: 'GET',
						url: link.href,
						headers: {
							'Authorization': 'Bearer ' + token
						}
					};
					$http(req2).then(function(res){
						console.log(res);
					});
				}
			});
		});*/
	}

	
	catalogService.requestItem = function(token, catalogItemId, description, reason, deployments) {
		var req = {
			method: 'GET',
			url: CATALOG_SERVICE.LIST_CATALOG_ITEM_VIEWS + catalogItemId,
			headers: {
			   'Authorization': 'Bearer ' + token
			}
		};
		console.log("requestItem:" + catalogItemId);
		$http(req).then(function(res) {
			console.log(res);
			var templateLink = res.data.links[0];
			var requestLink = res.data.links[1];
			if(res.data.links[1].rel.indexOf("Request Template") > -1) {
				templateLink = res.data.links[1];
				requestLink = res.data.links[0];
			}
			console.log("templateLink:" + templateLink.href);
			var templateReq = {
				method: 'GET',
				url: templateLink.href,
				headers: {
					'Authorization': 'Bearer ' + token
				}
			};
			$http(templateReq).then(function(res){
				console.log("template response: ");
				console.log(res);
				var reqData = res.data;
				reqData.description = description;
				reqData.reasons = reason;
				reqData.data._number_of_instances = deployments;
				var requestItemReq = {
					method: 'POST',
					url: requestLink.href,
					headers: {
						'Authorization': 'Bearer ' + token
					},
					data: reqData
				}
				$http(requestItemReq).then(function(res){
					console.log("request response:");
					console.log(res);
				});
			});
		});
	}
	
	return catalogService;
});