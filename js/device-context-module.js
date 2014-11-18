var deviceContextModule = angular.module('imtposDeviceModule', []);

/*
Add "ApiRequest" service to the module used in the context of the DEVICE.
*/

deviceContextModule.factory('ApiRequest', function() {
	var device = imt_pos_interop;
	return{
		generateKeypad: function(cb) {
			//Generate a random keypad used for staff authentication.
			var result = device.GenerateKeypadRequest('External/GenerateKeypad');
			cb(JSON.parse(result));
		},
		getStaffToken: function(params, cb) {
			//Return the token used to authenticate the staff user, using the randomly generated keypad.
			var result = device.GetSecurityTokenByTemplateRequest('External/GetSecurityToken', params.pin);
			cb(JSON.parse(result));
		},
		webMethod: function(methodName, params, cb) {
			var result = device.WebApiRequest(methodName, params, 'POST', 'application/x-www-form');
			cb(JSON.parse(result));
		}
	};
});


/*
Add Scan service
*/

deviceContextModule.factory('Scan', function($state) {
	return {
		startScanMonitoring: function(params) {
			//Start the execution of activity to execute document scan
			device.StartScanMonitoring(params.action, params.referenceId);
		}
	};
});

deviceContextModule.factory('NFC', function($state) {
	return {
		readRequest: function() {
			console.info('NFC read request');
		}
	};
});
