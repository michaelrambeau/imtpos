app.controller('SelectRecipientController', function($scope, LookupData, Customer, $http) {
	$scope.selected = false;
	$scope.user = {
		name: 'Michael'
	};
	$scope.recipients = Customer.getAllRecipients();
	angular.forEach($scope.recipients, function(r) {
		r.showDetails = false;
	});

	$scope.items = LookupData.getList('reason');

	$scope.select = function(recipient)	{
		angular.forEach($scope.recipients, function(r) {
			r.selected = false;
			r.showDetails = false;
		});
		$scope.selected = true;
		recipient.selected = true;
	};
	$scope.toggle = function(recipient) {
		//close all panels except the one that was clicked.
		angular.forEach($scope.recipients, function(r) {
			if (r.name != recipient.name) r.showDetails = false;
		});
		recipient.showDetails = ! recipient.showDetails;
	};

	$scope.isFormValid = function() {
		return $scope.selected === true;
	};

	$scope.$watch('remittance.amountYen', function(newValue, oldValue) {
		var amountYen = newValue;
		var amountLocal = amountYen / $scope.remittance.exchangeRate;
		$scope.remittance.amountLocal = amountLocal;
	});
	$scope.$watch('remittance.amountLocal', function(newValue, oldValue) {
		var amountLocal = newValue;
		var amountYen = amountLocal * $scope.remittance.exchangeRate;
		$scope.remittance.amountYen = amountYen;
	});

	$scope.test = function() {
		var url = 'http://192.168.2.112:8443/WIMS2/IMTPOS/Services/InvokeWithToken?service_id=lkNationality&securityToken=' + $scope.token;
		$http.get(url).success(function(data) {
			console.info(JSON.parse(data.data));
		});
	};

});
