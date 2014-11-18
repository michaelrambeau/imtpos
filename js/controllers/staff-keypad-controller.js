/*
Controller of the Keypad page (displayed just after "touch card" page)
*/
app.controller('StaffKeypadController', function($scope, $rootScope, Authentication, AUTH_EVENTS) {
	$scope.submitPin = function () {
		Authentication.getToken($scope.data.pin, $scope.data.keypadId, function(data) {
			$scope.$emit(AUTH_EVENTS.loginSuccess, data);
		});
	};
});
