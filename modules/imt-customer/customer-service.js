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
				cb(customer);
			});
		}
	};
}]);

/*
Record service parses data that comes from web method
and returns the object used in the application "scopes".
*/

app.factory('Record', function($parse) {

	return {
		parseServerData: function(serverData, mapping) {
			var result = {};
			angular.forEach(mapping, function(dataPath, modelPath) {
				var keySource = (dataPath.read) ? dataPath.read : dataPath;
				var value = $parse(keySource)(serverData);
				$parse(modelPath).assign(result, value);
			});
			return result;
		},
		save: function() {
			return true;
		}
	};
});


app.factory('CustomerResource', function(ApiRequest, Record) {
	//The mapping associates keys used in the application to keys found in data returned by the back-end web methods.
	var mapping = {
		'username': 'UserName',

		'address.area': 'Area',
		'address.cityward': 'Cityward',
		'address.complement': 'Complement',
		'address.number': 'Number',
		'address.postalCode': 'PostalCode',
		'address.prefecture': 'Prefecture',

		'birthDate': 'BirthDate',

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
					var result = Record.parseServerData(customerData, mapping);
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
