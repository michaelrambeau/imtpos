/*

<imt-customer> directive

Build the customer form, in either edit or read-only mode.

*/
app.directive('imtCustomer', ['Customer', function(Customer) {

	var POST_OFFICE = 'post_office_bank';

	var postalCodeBinding = function($scope) {
		//Synchronize data and the 2 fields used to enter the postal code.
		$scope.$watch('customer.address.postalCode', function(postalCode) {
			$scope.customer.address.postalCodeNumbers = postalCode.split('-');
		});
		$scope.onChangePostalCode = function(){
			$scope.customer.address.postalCode = $scope.customer.address.postalCodeNumbers.join('-');
		};
	};

	var accountNumberBinding = function(customer) {
		//add some "calculated" attributes and methods to the model.
		customer.bank.financialInstitution = (customer.bank.bankName === POST_OFFICE) ? 'JPB' : 'BNK';

		//a function used in the template to show/hide fiels about customer's bank account.
		customer.isJPB = function() {
			return customer.bank.financialInstitution == 'JPB';
		};

		//Initialize the specific account number fields, for Yucho and banks.
		customer.bank.accountNumberJPB = ['', '', ''];
		customer.bank.accountNumberBNK = '';
		if (customer.isJPB()) {
			//For Yucho, we use an array of 3 numbers.
			var array = customer.bank.accountNumber.split('-');
			customer.bank.accountNumberJPB[0] = array[0];
			customer.bank.accountNumberJPB[array.length - 1] = array[array.length -1];
			if(array.length == 3) customer.bank.accountNumberJPB[1] = array[1];
		} else {
			customer.bank.accountNumberBNK = customer.bank.accountNumber;
		}

		//To be called before saving to update some fields.
		customer.update = function() {
			customer.bank.accountNumber = getAccountNumber(customer);
			if (customer.isJPB()) customer.bank.bankName = POST_OFFICE;
		};
	};

	var getAccountNumber = function(customer) {
		//Return the bank account number, depending on the selected financial institution ('JPB' vs 'BNK')
		var accountNumber = '';
		if (customer.isJPB()) {
			//update the bank account number field, "joining" the 3 yucho account numbers.
			accountNumber = customer.bank.accountNumberJPB[0];
			if (customer.bank.accountNumberJPB[1] !== '') {
				accountNumber = accountNumber + '-' + customer.bank.accountNumberJPB[1];
			}
			accountNumber = customer.bank.accountNumber  + '-' + customer.bank.accountNumberJPB[2];
		}	else {
			accountNumber = customer.bank.accountNumberBNK;
		}
		return accountNumber;
	};

	return {
		restrict: 'AE',
		templateUrl: 'modules/imt-customer/customer-template.html',
		scope: {
			accountId: '@',
			editMode: '='
		},
		controller: function($scope) {
			var id = $scope.accountId;
			var init = function() {
				postalCodeBinding($scope);
				accountNumberBinding($scope.customer);
			};

			Customer.getInformation(id, function(data) {
				$scope.customer = data;
				//Store "a copy" of data that we can restore if the user cancels the change.
				$scope.master = angular.copy($scope.customer);
				init();
			});

			$scope.save = function() {
				$scope.customer.update();
				console.info('save', $scope.customer);
			};
			$scope.reset = function() {
				console.info('Revert the changes!');
				angular.copy($scope.master, $scope.customer);
				init();
			};
		}
	};
}]);
