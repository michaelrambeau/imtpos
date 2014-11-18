//Define which "ApiRequest" module has to be injected to the application module,
//depending on the context (device VS web).
var contextModule = (typeof(imt_pos_interop) == 'undefined') ? 'imtposWebModule' : 'imtposDeviceModule';
contextModule = 'imtposLocalModule';

//Define the main application module.
var app = angular.module('imtpos', [contextModule, 'ui.router', 'ngCookies', 'ngSanitize','ngMessages']);

/*
Expose some functions to the global namespace (to be called from outside Angular)
*/
app.service('DeviceMessage', function($window, $rootScope, $state) {

	$window.setErrorMessage = function(msg) {
		var data = {
			message: msg
		};
		$rootScope.$broadcast('DEVICE_MESSAGE_ERROR', data);
	};
	$window.touchCard = function(data) {
		console.info('Touch Card event', data);
		var state = (data.userType == 'CUSTOMER') ? 'customer.pin-code' : 'staff.pin-code';
		$state.go(state);
	};

});

/*
A Service used to navigate between states
*/
app.factory('StateSequence', function($state) {
	var states = [
		'staff.touch-card',
		'staff.pin-code',
		'staff.dashboard',
		'staff.scan-waiting',
		'staff.scan-completed',
		'staff.customer-information',
		'customer.touch-card',
		'customer.pin-code',
		'customer.accept-conditions',
		'customer.confirm-fees',
		'customer.select-recipient'
	];
	var getCurrentIndex = function() {
		var current = $state.current.name;
		var currentIndex = states.indexOf(current);
		return currentIndex;
	};
	var goNthState = function(index) {
		var state = states[index];
		if (index >= states.length || index < 0) throw new Error('Impossible to go to state number ' + index);
		$state.go(state);
	};
	return {
		getStates: function(){
			return states;
		},
		canGoNext: function() {
			return getCurrentIndex() < (states.length - 1);
		},
		canGoPrev: function() {
			return getCurrentIndex() > 0;
		},
		goNext: function() {
			var index = getCurrentIndex() + 1;
			goNthState(index);
		},
		goPrev: function() {
			var index = getCurrentIndex() - 1;
			goNthState(index);
		},
		goTo: function(state) {
			$state.go(state);
		}
	};
});

/*
Set up the routes
*/

app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/staff/touch-card');//this how to redirect if the URL is invalid.
	var v = imtpos.version;
	$stateProvider
		.state('staff', {
			url: '/staff',
			templateUrl: 'html/staff/index.html?v=' + v
			//controller: 'StaffHomeController'
		})
		.state('staff.touch-card', {
			url: '/touch-card',
			templateUrl: 'html/staff/pages/touch-card.html?v=' + v,
			controller: 'StaffTouchCardController',
			data:{
				publicAccess: true
			}
		})
		.state('staff.pin-code', {
			url: '/pin-code',
			templateUrl: 'html/staff/pages/pin-code.html?v=' + v,
			controller: 'StaffKeypadController',
			data:{
				publicAccess: true
			}
		})
		.state('staff.dashboard', {
			url: '/dashboard',
			templateUrl: 'html/staff/pages/dashboard.html?v=' + v,
			controller: 'DashboardController'
		})
		.state('staff.scan-waiting', {
			url: '/scan-waiting',
			templateUrl: 'html/staff/pages/scan-waiting.html?v=' + v
		})
		.state('staff.scan-completed', {
			url: '/scan-completed',
			templateUrl: 'html/staff/pages/scan-completed.html?v=' + v
		})
		.state('staff.customer-information', {
			url: '/customer-information',
			templateUrl: 'html/staff/pages/customer-information.html?v=' + v,
			controller: 'CustomerInformationController'
		})
		.state('test', {
			url: '/test',
			templateUrl: 'html/test/imt-fields.html?v=' + v,
			controller: 'CustomerInformationController'
		})


		/*the customer pages */
		.state('customer', {
			url: '/customer',
			templateUrl: 'html/customer/index.html?v=' + v,
			controller: 'CustomerHomeController'
		})
		.state('customer.touch-card', {
			url: '/touch-card',
			templateUrl: 'html/customer/pages/touch-card.html?v=' + v,
			controller: 'CustomerTouchCardController'
		})
		.state('customer.pin-code', {
			url: '/pin-code',
			templateUrl: 'html/customer/pages/pin-code.html?v=' + v,
			controller: 'CustomerPinPadController'
		})
		.state('customer.accept-conditions', {
			url: '/accept-conditions',
			templateUrl: 'html/customer/pages/accept-conditions.html?v=' + v
		})
		.state('customer.confirm-fees', {
			url: '/confirm-fees',
			templateUrl: 'html/customer/pages/confirm-fees.html?v=' + v,
			controller: 'ConfirmFeesController'
		})
		.state('customer.select-recipient', {
			url: '/select-recipient',
			templateUrl: 'html/customer/pages/remittance/select-recipient.html?v=' + v,
			controller: 'SelectRecipientController'
		})
		.state('history', {
			url: '/history',
			templateUrl: 'html/pages/history-list.html?v=' + v,
			controller: 'HistoryListController'
		});
});

app.run(['$rootScope', '$state', '$stateParams', function	($rootScope, $state, $stateParams) {
		/* It's very handy to add references to $state and $stateParams to the $rootScope
		# so that you can access them from any scope within your applications.For example,
		# <li ui-sref-active="active }"> will set the <li> // to active whenever
		# 'contacts.list' or one of its decendents is active.*/
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
}]);

/*
Display a "loading.gif" during all $http requests
code updated for Angular 1.3
*/
app.factory('myHttpInterceptor', function($q) {
	var hideLoading = function() {
    return jQuery('#loading').hide();
  };
	var showLoading = function() {
    return jQuery('#loading').show();
  };
	return {
		request: function(config) {
			showLoading();
			return config;
		},
		response: function(response) {
			// do something on success
			hideLoading();
			return response;
		},
		responseError: function(response) {
			// do something on error
			hideLoading();
			return $q.reject(response);
		}
	};
});

app.config(function($httpProvider) {
	$httpProvider.interceptors.push('myHttpInterceptor');
});

/*
Protect the routes that are not "public"
*/

app.run(function ($rootScope) {
  $rootScope.$on('$stateChangeStart', function (event, nextState) {
		$rootScope.errorMessage = '';
    //var publicAccess = next.data && next.data.publicAccess;
		console.log('$stateChangeStart event', nextState.name);

  });
});



/*
Load all Javascript dependencies (controllers, services...) using "toast" loader.
We use toast to be able to add a version number to JS files, to avoid browser cache issues.
*/

var files = [
	'js/services/languages.js',
	'js/services/lookup-data.js',
	'js/services/authentication.js',
	'js/services/fees.js',

	'js/controllers/main-controller.js',
	'js/controllers/staff-keypad-controller.js',
	'js/controllers/remittance-controllers.js',
	'js/controllers/dashboard-controller.js',
	'js/controllers/other-controllers.js',
	'js/controllers/dashboard-controller.js',
	'js/controllers/customer-information-controller.js',

	'js/directives/etext.js',
	'js/directives/keypad-normal.js',
	'js/directives/keypad-random.js',
	'js/directives/pragmatic-angular.js',

	//IMT Field module
	'modules/imt-field/field-directives.js',
	'modules/imt-field/validation-methods.js',
	'modules/imt-field/year-month-day/year-month-day.js',

	//IMT Customer module
	'modules/imt-customer/customer-service.js',
	'modules/imt-customer/customer-directive.js'

];
var urls = jQuery.map(files, function(element){
	return element + '?v=' + imtpos.version;
});

console.log('Loading all dependencies...', urls);
urls.push(function() {
	console.log('All files were loaded, launching the angular app...');
	//This is the "javascript" way to lauch an Angular application called "imtpos"
	//Note: the usual way is to use an ng-app attribute in the <html> tag.
	angular.bootstrap(document, ['imtpos']);
});

toast.apply(null, urls);
