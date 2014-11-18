/*
All field validation methods are defined in this service
*/
app.factory('ValidationMethods', function() {
	var methods = {
		nameAlphabet: function(source) {
			//only letters, - , _,.
			if (source === '') return true;
			return (/^[a-zA-Z_=\-\\-\\. ]+$/).test(source);
		},
		username: function(source) {
			//only letters, - , _,.
			if (source === '') return true;
			return (/^[0-9a-zA-Z_\\-\\.]+$/).test(source);
		},
		accountNumber: function(source) {
			//Account number must have from 7 to 13 numbers
			if (source === '') return true;
			return (/^\d{7,13}$/).test(source);
		},
		accountName: function(source) {
			//Account number must have from 7 to 13 numbers
			if (source === '') return true;
			return (/^\d{7,13}$/).test(source);
		},
		kigouBangou: function(source) {
			//5 numbers
			if (source === '') return true;
			return (/^\d{5}$/).test(source);
		},
		tsuuchouBangou: function(source) {
			//8 numbers
			if (source === '') return true;
			return (/^\d{8}$/).test(source);
		}
	};

	var addToNgModel = function(ngModel, methodName) {
		var validator = methods[methodName];
		if (!validator) throw new Error('Invalid validation method name ' + methodName);
		ngModel.$validators[methodName] = validator;
	};

	return {
		updateNgModel: function(ngModel, methodNames) {
			//method called by imt-input directive to add custom validation methods to the field model.
			angular.forEach(methodNames, function(validationMethod) {
				addToNgModel(ngModel, validationMethod);
			});
		}
	};
});
