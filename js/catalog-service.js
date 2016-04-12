angular.module('catalogservice', [])
.constant("CATALOG_SERVICE", {
	"LIST_CATALOG_ITEMS": "/catalog-service/api/consumer/entitledCatalogItems",
	"LIST_CATALOG_ITEM_VIEWS": "/catalog-service/api/consumer/entitledCatalogItemViews",
	"LIST_RESOURCES": "/catalog-service/api/consumer/resources",
	"LIST_VMS": "/catalog-service/api/consumer/resourceTypes/Infrastructure.Machine",
	"LIST_REQUESTS": "/catalog-service/api/consumer/requests",
	"GET_VM": "auth-logout-success"
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
	
	return catalogService;
});