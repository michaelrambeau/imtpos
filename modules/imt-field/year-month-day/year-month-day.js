app.directive('imtYearMonthDate', function() {
	var getLastDayOfTheMonth = function(year, month){
		//Return the number of day in a given month : 28, 29, 30 ou 31
		var d = new Date(year, month - 1,1);
		d.setMonth(d.getMonth() + 1);
		d.setDate(d.getDate() - 1);
		return(d.getDate());
	};

	var isValidDate = function(year, month, day) {
		//Return true if user selection is a valid date (2014,2,30 is not a valid date)
		var lastDay = getLastDayOfTheMonth(year, month);
		return day <= lastDay;
	};

	var format2digits = function(i) {
		return ((parseFloat(i) < 10) ? '0' : '') + i;
	};

	var getYears = function() {
		//Return available year list, as String
		var minAge = 18;
		var today = new Date();
		var start = today.getFullYear() - minAge;
		var years = [];
		for (var i = start; i > start - 120; i--) {
			years.push(i.toString());
		}
		return years;
	};
	var getMonths = function() {
		//Return available month list, as a String array, values from '01' to '12'
		var months = [];
		for (var i = 1; i <= 12; i++) {
			months.push({
				value: format2digits(i),
				text: format2digits(i)
			});
		}
		return months;
	};
	var getDays = function() {
		//Return available day list, as a String array, values from '01' to '31'
		var days = [];
		for (var i = 1; i <= 31; i++) {
			days.push(format2digits(i));
		}
		return days;
	};

	return {
		templateUrl: 'modules/imt-field/year-month-day/year-month-day.html',
		require: '^imtForm',
		restrict: 'AE',
		scope: {
			ngModel: '=',
			ngRequired: '='
		},
		link: function(scope, element, attrs, formCtrl) {
			formCtrl.addField(scope, element, scope);
			var input = element.find('input');
			var ngModelController = input.controller('ngModel');
			ngModelController.$validators.invalidDate = function(value) {
				return (value !== 'invalid');
			};
			//scope.field = ngModelController;

		},
		controller: function($scope) {

			var init = function() {
				$scope.years = getYears();
				$scope.months = getMonths();
				$scope.days = getDays();
			};

			$scope.update = function() {
				var array = $scope.ngModel.split('/');
				$scope.year = array[0];
				$scope.month = array[1];
				$scope.day = array[2];
			};

			$scope.onChange = function() {
				if (! $scope.checkIsSelected()) {
					$scope.ngModel = '';
					return;
				}
				if (! $scope.checkIsValid()) {
					$scope.ngModel = 'invalid';
					return;
				}
				$scope.ngModel = $scope.year + '/' + $scope.month + '/'+ $scope.day;
			};

			$scope.checkIsValid = function() {
				//Return true if the selected date is a valid date
				var y = parseFloat($scope.year);
				var m = parseFloat($scope.month);
				var d = parseFloat($scope.day);
				return isValidDate(y, m, d);
			};

			$scope.checkIsSelected = function() {
				//Return true if year, month and day have ALL been selected.
				if (!$scope.year) return false;
				if (!$scope.month) return false;
				if (!$scope.day) return false;
				return true;
			};
			init();
			$scope.update();
		}
	};
});
