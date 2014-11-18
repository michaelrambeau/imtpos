app.controller('DashboardController', function($scope, Scan) {

	$scope.startScan = function (params) {
		Scan.startScanMonitoring(params);
	};

	$scope.mainMenu = [
		{
			text: 'SEND MONEY',
			state: 'staff.scan-waiting',
			disabled: true
		},
		{
			text: 'NEW SUBSCRIPTIONS',
			//state: 'staff.scan-waiting',
			state: '',
			action: $scope.startScan,
			disabled: false
		},
		{
			text: 'ADD RECIPIENT',
			state: 'staff.scan-waiting',
			disabled: true
		},
		{
			text: 'NEW PIN NUMBER',
			state: 'staff.scan-waiting',
			disabled: true
		},
		{
			text: 'OPEN CASHIER',
			state: 'staff.scan-waiting',
			disabled: true
		},
		{
			text: 'CLOSE CASHIER / CHANGE STAFF',
			state: 'staff.scan-waiting',
			disabled: true
		},
		{
			text: 'CHECK BALANCE',
			state: 'staff.scan-waiting',
			disabled: true
		}
	];

	$scope.customerWithoutCardMenu = [
		{
			text: 'ASSIGN NEW BRASTEL REMIT CARD',
			state: 'staff.scan-waiting',
			disabled: true
		}
	];

	$scope.customerWithCardMenu = [
		{
			text: 'UPDATE DOCUMENT (ZAIRYU CARD)',
			state: 'xxxx',
			disabled: true
		},
		{
			text: 'UPDATE CUSTOMER INFORMATION',
			state: 'staff.customer-information'
		}
	];



});

app.directive('dashboardMenuEntry', function($compile) {
	var html = '<a href ng-click="item.action()">{{item.text}}</a>';
	return {
		restrict: 'A',
		scope : {
				item: '='
		},
		template: html
/*		link: function (scope, element) {
			element.html('<a href ng-click="item.action()">{{item.text}}</a>');
			$compile(element.contents())(scope);
		}*/
	};
});
