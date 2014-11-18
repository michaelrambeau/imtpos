/*
A service used to retrieve data about a customer
Either CustomerResource or CustomerResourceMockup can be injected.
*/


app.factory('Customer', ['CustomerResourceMockup', function(CustomerResource) {
	var accountId = '?';
	return {
		setAccountId: function(id) {
			accountId = id;
		},
		getAllRecipients: function(cb) {
			CustomerResource.getAllRecipients(cb);
		},
		getInformation: function(accountId, cb) {
			CustomerResource.getInformation(accountId, function(customer) {

				//add some "calculated" attributes and methods to the model.
				customer.bank.financialInstitution = (customer.bank.bankName === 'post_office_bank') ? 'JPB' : 'BNK';

				//a function used in the template to show/hide fiels about customer's bank account.
				customer.isJPB = function() {
					return customer.bank.financialInstitution == 'JPB';
				};

				//Initialize the 3 yucho account number fields.
				if (customer.isJPB()) {
					var array = customer.bank.accountNumber.split('-');
					customer.bank.yuchoAccountNumbers = ['', '', ''];
					customer.bank.yuchoAccountNumbers[0] = array[0];
					customer.bank.yuchoAccountNumbers[array.length - 1] = array[array.length -1];
					if(array.length == 3) customer.bank.yuchoAccountNumbers[1] = array[1];
				}

				//To be called before saving to update some fields.
				customer.update = function() {
					if (customer.isJPB()) {
						//update the bank account number field, "joining" the 3 yucho account numbers.
						customer.bank.accountNumber = customer.bank.yuchoAccountNumbers[0];
						if (customer.bank.yuchoAccountNumbers[1] !== '') {
							customer.bank.accountNumber = customer.bank.accountNumber + '-' + customer.bank.yuchoAccountNumbers[1];
						}
						customer.bank.accountNumber = customer.bank.accountNumber  + '-' + customer.bank.yuchoAccountNumbers[2];
					}
				};

				//...and finally "Return" the customer object.
				cb(customer);
			});
		}
	};
}]);

/*
Record service is read to parse data that comes from web method
and returns the objects used in the application "scopes".
*/

app.factory('Record', function() {

	var addKey = function(source, result, keyResult, keySource){
		var a = keyResult.split('.');
		if (a.length > 1){
			if (!result[a[0]]) result[a[0]] = {};
			result[a[0]][a[1]] = getValue(source,keySource);
		} else {
			result[keyResult] = getValue(source,keySource);
		}
	};
	var getValue = function (source, key) {
		var a = key.split('.');
		var result = '';
		if (a.length > 1){
			result = source[a[0]][a[1]];
		} else {
			result = source[key];
		}
		return result;
	};

	return {
		read: function(serverData, mapping) {
			var result = {};
			angular.forEach(mapping, function(value, key) {
				var keySource = (value.read) ? value.read : value;
				addKey(serverData, result, key, keySource);
			});
			return result;
		},
		save: function() {
			return true;
		}
	};
});


app.factory('CustomerResource', function(ApiRequest, Record) {
	//The mapping associates keys used in the application to keys found in data returned by the back-end.
	var mapping = {
		'username': 'UserName',

		'address.area': 'Area',
		'address.cityward:': 'Cityward',
		'address.complement:': 'Complement',
		'address.number': 'Number',
		'address.postalCode': 'PostalCode',
		'address.prefecture': 'Prefecture',

		'birthdate': 'BirthDate',

		email1: 'Email1',
		email2: 'Email2',

		'bank.accountName': {
			read: 'FinancialInstitution.AccountName',
			write: 'accountName'
		},

		'bank.accountNumber': 'FinancialInstitution.AccountNumber',
		'bank.accountType': 'FinancialInstitution.AccountType',
		'bank.bankName': 'FinancialInstitution.BankName',
		'bank.branchName': 'FinancialInstitution.BranchName',

		gender: 'Gender',
		language: 'Language',
		nameAlphabet: 'NameAlphabet',
		nameKanji: 'NameKanji',
		nationality: 'Nationality',

		'occupation.value': 'Occupation.OccupationName',
		'occupation.others': 'Occupation.OccupationOthers',
		phone1: 'PhoneNumber1',
		phone2: 'PhoneNumber2'
	};
	return {
		getAllRecipients: function(cb) {
			cb();
		},
		getInformation: function(accountId, cb) {
			ApiRequest.webMethod('IMTGetAccountData', {accountID: accountId}, function(data) {
					var customerData = data.WIMS2.GetAccountDataResult.Data.Customer;
					var result = Record.read(customerData, mapping);
					result.id = accountId;
					cb(result);
				});
		}
	};
});

app.factory('CustomerResourceMockup', function() {

	var recipients = [
		{
			name: 'Tony Parker',
			deliveryMethod: '1',
			reason: '1'
		},
		{
			name: 'Manu Ginobili',
			deliveryMethod: '2',
			reason: '2'
		},
		{
			name: 'Tim Duncan',
			deliveryMethod: '2',
			reason: '2'
		}
	];

	var userInformation = {
		id: '1011182',
		address: {
			area: 'OOTECHOU',
			cityward:'IBARAKI-SHI',
			complement: '',
			number: '10-25-502',
			postalCode: '567-0883',
			prefecture: 'OSAKA-FU'
		},
		bank: {
			accountName: 'Michael Rambeau',
			accountNumber: '12345-7-12345678',
			accountType: '2',
			bankName: 'post_office_bank',
			branchName: 'my branch'
		},
		birthDate: '1977/02/11',
		email1: 'm_rambeau@brastel.co.jp',
		email2: '',
		gender: '1',
		language: '4',
		nameAlphabet: 'Michael Rambeau',
		nameKanji: '',
		nationality: 'FR',
		occupation: {
			others: '',
			value: '9'
		},
		phone1: '09019194375',
		phone2: '',
		username: 'michael'
	};

	return {
		getAllRecipients: function(cb) {
			cb(recipients);
		},
		getInformation: function(accountId, cb) {
			cb(userInformation);
		}
	};
});
