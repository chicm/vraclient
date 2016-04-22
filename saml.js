'use strict';

angular.module('myApp',[])
.controller('samlctl', function($scope, $http){
	$scope.auth=function() {
		console.log("start");
		var req = {
			method: "GET",
			url: "http://localhost/vcac/"
		};
		$http(req).then( function(res){
			console.log(res);
		},
		function(){}
		);
	};
	$scope.msg ="hello";
	console.log("init");
});