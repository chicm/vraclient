'use strict';

angular.module('myApp',['ngCookies'])
.controller('samlctl', function($scope, $http, $httpParamSerializer, $window, $cookies){
	$scope.auth=function() {
		var cks = angular.toJson($cookies.getAll());
		console.log('cookies:' + cks);
		/*if(hzn != null) {
			$window.open('https://vra-01a.corp.local/vcac/', '_blank');	
			return;
		}*/
		console.log("start");
		var req = {
			method: "GET",
			url: "/vcac/"
		};
		$http(req).then( function(res){
			console.log(res);
			var req2 = {
				method: "POST",
				url: "https://vra-01a.corp.local/SAAS/auth/login/userstore",
				headers: {
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer({
					dest: 'https://vra-01a.corp.local/SAAS/auth/oauth2/authorize?response_type=code&client_id=csp-admin-4tlcFjacmQ&redirect_uri=https://vra-01a.corp.local/vcac/org/vsphere.local/',
					userStoreDomain: {
						userStoreUuid: "e65fda77-688f-4294-ac46-be6f5295f2eb",
						userDomainUuid: "d04fa3be-3d63-4215-894a-ff5f4965cd61"
					},
					remember:true
				})
			};
			$http(req2).then(function(res) {
				console.log(res);
				var parser = new DOMParser();
				var doc = parser.parseFromString(res.data, 'text/html');
				var reqId  = doc.getElementById('requestId').value;
				var ctx = doc.getElementById('authnContext').value;
				var relay = doc.getElementById('RelayState').value;
				console.log("requestID:" + reqId.value);
				console.log("RelayState:" + relay);
				console.log("ctx:" + ctx);
				
				var req3 = {
					method: 'POST',
					url: 'https://vra-01a.corp.local/hc/3001/authenticate/',
					headers: {
						'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: $httpParamSerializer({
						acsUrl: 'https://vra-01a.corp.local/SAAS/t/VSPHERE.LOCAL/auth/saml/response',
						RelayState: relay,
						requestId: reqId,
						userstore: 'corp.local',
						authnContext: ctx,
						userNameTextFieldReadonly: false,
						username: 'tony',
						password: 'VMware1!',
						action: 'Sign in'
					})
				};
				
				$http(req3).then(function(res) {
					console.log(res);
					var parser = new DOMParser();
					var doc = parser.parseFromString(res.data, 'text/html');
					var elemsamlres = doc.getElementsByName('SAMLResponse');
					var samlres = elemsamlres[0].value;
					var elemrelay = doc.getElementsByName('RelayState');
					var relay = elemrelay[0].value;
					console.log("samlresponse:" + samlres);
					console.log("relay:" + relay);

					var req4 = {
						method: 'POST',
						url: 'https://vra-01a.corp.local/SAAS/t/VSPHERE.LOCAL/auth/saml/response',
						headers: {
							'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						data: $httpParamSerializer({
							SAMLResponse: samlres,
							RelayState: relay							
						})
					}
					
					$http(req4).then(function(res) {
						console.log(res);
						$window.open('https://vra-01a.corp.local/vcac/', '_blank');					
					}, function(){});
					
				}, function() {});
				
			}, function(){
			});
		},
		function(){}
		);
	};
	$scope.msg ="hello";
	console.log("init");
});