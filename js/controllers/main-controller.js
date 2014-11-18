/*

MAIN CONTROLLER
The root scope controller
Manages applicaton-level elements such as the current user, the current language...

*/
app.controller('MainController', function($scope, Languages, Translations, $state, StateSequence, AUTH_EVENTS, $rootScope) {
	console.log('MainController... start!');
	$scope.version = imtpos.version;

	$scope.errorMessage='';

	$scope.$on('DEVICE_MESSAGE_ERROR', function(event, data) {
		$scope.errorMessage = data.message;
		$scope.$digest();//required to update the scope.
	});

	$scope.availableLanguages = Languages.getAll();
	$scope.currentLanguage = 4;

	$scope.switchLanguage = function(lang) {
		$scope.currentLanguage = lang;
		Translations.getAll(lang);
	};

	$rootScope.user = {name: 'mike'};


	$scope.staffUser = null;

	//Expose navigation functions from StateSequence service (used in dev, to go from state to state easily)
	$scope.nav = StateSequence;


  $scope.setStaffUser = function (user) {
    $scope.staffUser = user;
  };

	//Load translations for the default language
	$scope.switchLanguage($scope.currentLanguage);

	//Listen to authentication events
	$scope.$on(AUTH_EVENTS.loginSuccess, function(event, data) {
		console.info('The user has been authenticated!', data);
		$scope.staffUser = {
			fullName: data.fullName,
			token: data.token
		};
		$state.go('staff.dashboard');
	});
	$scope.$on(AUTH_EVENTS.loginFailed, function(event, data) {
		console.info('Authentication failure!', data);
		$scope.errorMessage = 'Login failure.';
	});

	//Remittance data is stored in the global scope so that we can use "scope inheritance" to share data
	$scope.remittance = {
		amountYen: 0,
		amountLocal: 0,
		exchangeRate: 80
	};

});
