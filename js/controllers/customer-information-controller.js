app.controller('CustomerInformationController', function($scope, Customer) {
	console.log('CustomerInformationController GO!');

	var	id = '1011182';

/*	Customer.getInformation(id, function(data) {
		$scope.master = angular.copy(data);
		$scope.customer = data;
		$scope.customer.editMode = true;
	});*/


	$scope.save = function() {
		console.info('Form submission!', $scope.customer);
	};

	$scope.user = {
		username: 'Michael',
		gender: '2',
		birthDate: '1977/02/11'
	};


});
