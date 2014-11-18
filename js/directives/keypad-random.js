/*
<pincode-keyboard> directive (directive = re-usable html component)
display the normal numeric keyboard used to enter user's PIN code (4 numbers)
*/

app.factory('Keypad', function(ApiRequest) {
	return {
		get: function(cb) {
			ApiRequest.generateKeypad(cb);
		}
	};
});

app.factory('KeypadMockup', function() {
	return {
		get: function(cb) {
			var data = {
				keypad: [[4,0],[9,5],[8,6],[2,1],[7,3]],
				keypadId: 7
			};
			cb(data);
		}
	};
});

app.directive('keypadRandom', ['Keypad', function(Keypad) {
	return {
		restrict: 'E',
		templateUrl: 'html/common/keypad-random.html',
		scope: {
			data: '='
		},
		controller: function($scope) {
			var PIN_LENGTH = 4;
			$scope.data = {
				pin: '',
				displayedPin: '',
				keypadId: ''
			};

			var keypadData = null;
			Keypad.get(function(data) {
				keypadData = data;
				$scope.keys = data.keypad;
				$scope.data.keypadId = data.keypadId;
			});


			$scope.keyEvent = function(cell) {
				if (cell == 'BACK') {
					$scope.data.pin = $scope.data.pin.substr(0, $scope.data.pin.length - 1);
				} else {
					if ($scope.data.pin.length == PIN_LENGTH) return;
					$scope.data.pin = $scope.data.pin + cell;
				}

			};

			$scope.displayPin = function() {
				//Display back circles instead of the pushed keys.
				var text = '';
				if ($scope.data.pin === '') {
					text = '....';
				} else {
					for (var i=0; i < $scope.data.pin.length; i++) {
						text = text + '&#9679;';
					}
				}
				return text;
			};

			$scope.$watch('data.pin', function() {
				//Listen to updates about the data.pin object that can be updated from outside the directive
				//(by the "clear" button for example)
				$scope.data.displayPin = $scope.displayPin();
				$scope.data.isValid = ($scope.data.pin.length == PIN_LENGTH);
			});

		}
	};
}]);
