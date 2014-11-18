/*

Lookup up data used to retrieve etext items from "lookup data"
(for lists of keywords such as country, deliveryType...)

This service is used by <lookup> directive

*/

app.factory('LookupResourceMockup', function() {
	return function() {
		return {
			nationality: [
				{
					value: 'FR',
					text: 'French'
				},
				{
					value: 'US',
					text: 'American'
				}
			],
			bankAccount: [
				{
					value: '1',
					etextid: 'I0001-0023-0001',
					text: 'Ordinary'
				},
				{
					value: '2',
					etextid: '0001-0023-0002',
					text: 'Current'
				},
				{
					value: '3',
					etextid: 'I0001-0023-0003',
					text: 'Saving'
				}
			],
			financialInstitution: [
				{
					value: 'BNK',
					text: 'Bank'
				},
				{
					value: 'JPB',
					text: 'Japan Postal Bank'
				}
			],
			gender:[
				{
					value: '1',
					text: 'Male'
				},
				{
					value: '2',
					text: 'Female'
				}
			],
			reason: [
					{
						value: '1',
						etextid: 'I0001-0023-0091',
						text: 'Living expenses'
					},
					{
						value: '2',
						etextid: 'I0001-0023-0092',
						text: 'Ceremonial Occasions'
					}
				]
		};
	};
});

app.factory('LookupData', ['Translations', 'LookupResourceMockup', function(Translations, LookupFetchData) {
	//categories is an object whose keys are IMT lookup categories (singular form).
	var categories = LookupFetchData();

	var	getData = function(category, value) {
			//For a given lookup category (country, deliveryMethod...),
			//return the etext item associated to a given value.
			if(! categories[category]) return null;
			var found = false;
			var data = null;
			angular.forEach(categories[category], function(element) {
				if (element.value == value) {
					found = true;
					data = element;
				}
			});
			//Return an object with 2 properties: etextid and defaultText
			if (found) return {etextid: data.etextid, text: data.text};
	};

	return {
		getData: getData,
		getTranslation: function(category, value) {
			var data = getData(category, value);
			if (!data) return value;
			var text = Translations.get(data.etextid, data.text);
			return text;
		},
		getList: function (category) {
			//return the list of elements, for a given category
			return categories[category];
		},
		set: function(data) {
			angular.forEach(data, function(value, key) {
  			categories[key] = data[key];
			});
			console.log('set data', categories);
		}
	};
}]);
