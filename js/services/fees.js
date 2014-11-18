app.factory('Fees', function () {
	var fees = [
		{
			min: 0,
			max: 10000,
			fee: 900
		},
		{
			min: 10001,
			max: 50000,
			fee: 1500
		},
		{
			min: 50001,
			max: 100000,
			fee: 2000
		},
		{
			min: 100001,
			max: 250000,
			fee: 3000
		},
		{
			min: 2500001,
			max: 500000,
			fee: 5000
		}
	];
	return {
		getAll: function() {
			return fees;
		}
	};
});
