app.controller('HomeController', function($scope) {
	console.log("HomeController... start!");
});

app.controller('RequestHomeController', function($scope) {
	console.log("RequestHomeController... start!");
});

app.controller('ConfirmFeesController', function($scope, $http, WIMS_SERVERS, LookupData, Fees) {
	console.log("ConfirmFeesController... start!");

	$scope.fees = Fees.getAll();

});

app.controller('CustomerTouchCardController', function(NFC) {
	console.log('CustomerTouchCardController... start!');
	NFC.readRequest();
})
