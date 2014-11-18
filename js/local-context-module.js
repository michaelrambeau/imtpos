var localContextModule = angular.module('imtposLocalModule', []);

localContextModule.factory('Device', function() {
	return {
		getData: function() {
			return {
				nfcId: '04e12f9a492d80',
				serial: '04e12f9a492d80'
			};
		}
	};
});

localContextModule.constant('WIMS_SERVERS', {
  //etext: 'http://192.168.2.116',
  //authentication: 'http://postest.050jp.com/Dev'
  authentication: 'http://192.168.2.112:8443/WIMS2'
});


/*
Add "ApiRquest" (the same service name as before) service to the module used in the context of the WEB application.
*/

localContextModule.factory('ApiRequest', function($http, WIMS_SERVERS, Device, LocalStorage) {
	var TOKEN_KEY = 'token';
	var token = LocalStorage.get(TOKEN_KEY);

	var ajaxRequest = function(methodPath, params, userToken, cb) {
		var url = WIMS_SERVERS.authentication + methodPath;

		//add fake device parameters
		var deviceData =  Device.getData();
		params.nfcId = deviceData.nfcId;
		params.serial = deviceData.serial;

		var strParams = jQuery.param(params);
		var headers = {
			'SecurityToken': '',
			'Content-Type': 'application/x-www-form-urlencoded'
			//'Content-Type': 'multipart/form-data'
		};

		//Add the SecurityToken to the request headers
		if (userToken == true && token !== '') headers.SecurityToken = token;

		console.info('Ajax request made in the context of the web application', url, params, headers);

		$http({
			url: url,
			data: strParams,
			method: 'POST',
			headers: headers
			})
			.success(function(data) {
				if (cb) cb(data);
			})
			.error(function(err) {
				console.error('Error calling ' + methodPath + err);
			});
	};

	return {
		generateKeypad: function(cb) {
			ajaxRequest('/External/GenerateKeypad', {}, false, cb);
		},
		getStaffToken: function(params, cb) {
			ajaxRequest('/External/GetSecurityToken', params, false, function(data) {
				if (data.success === true) {
					//update the local variable used to store the token in a private attribute.
					//token = formatToken(data.securityToken);
					token = data.securityToken;
					LocalStorage.set(TOKEN_KEY, token);
				}
				if (cb) cb(data);
			});
		},
		webMethod: function(methodName, params, cb) {
			params.service_id = methodName;
			ajaxRequest('/External/InvokeWithToken', params, true, function(data) {
				var json = JSON.parse(data.data);
				console.info('Data retuned by ', methodName, json);
				cb(json);
			});
		},
		webApiMethod: function(methodName, params, userToken, cb) {
			ajaxRequest(methodName, params, userToken, function(data) {
				//var json = JSON.parse(data.data); is already a JSObject

				console.info('Data retuned by ', methodName, data);
				cb(data);
			});
		}
	};
});

/*
Local Storage template used to store the security token in the browser local storage.
Useful for web tests, to avoid asking a new token when the page is reloaded.
Such a feature is not available in the "DeviceContext" module.
*/
localContextModule.factory('LocalStorage', function(){
	return {
		get: function(key) {
			var store = localStorage.getItem(key);
			return (store && JSON.parse(store)) || '';
		},
		set: function(key, data) {
			localStorage.setItem(key, JSON.stringify(data));
		}
	};
});

/*
Add Scan service
*/

localContextModule.factory('Scan', function($state) {
	return {
		startScanMonitoring: function() {
			console.info('Start scan monitoring process...');
			$state.go('staff.scan-waiting');
		}
	};
});

/*
Add NFC service
*/
localContextModule.factory('NFC', function() {
	return {
		readRequest: function() {
			console.info('NFC read request');
		}
	};
});



/*

"Translations" service used to get a translation from wims etext items.
First getAll() method is called by the main controller to get translations in all languages.
And then, get() can be used to translate a given etext item in the "current" language.

This service is used by the directives related to translations: etext and etextid

*/

localContextModule.factory('Translations', function($http) {
	var translations = {};
	return {
		getAll: function(language, cb) {
			var params = {type:'', language_id:''};
			params.type = '1-2-5-9-12-20-30-31-43-80-82-1109';
			params.language_id = language;
			var url = '/data/etext/eng.js';
			$http.get(url).success(function(data) {
				translations = data;
				console.info('Get translation from local file!');
				if (cb) cb(translations);
			});
		},
		get: function (id, defaultTranslation) {
			//console.log('get', id, translations[id]);
			if (translations[id]) {
				return translations[id];
			} else {
				return defaultTranslation;
			}
		}
	};
});
