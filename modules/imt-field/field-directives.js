/*

imt-form directive

To be used as an attribute of a <form> element

*/

app.directive('imtForm', function() {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs) {
			scope.editMode = (attrs.editMode === 'true');
			scope.debugMode = (attrs.debugMode === 'true');
		},
		controller: function($scope, $parse, LookupHelpers) {

			var imtFields = [];
			var isFieldEditable = function(fieldScope) {
				//note: when true and false parameters are passed to the directive using attributes, they are String.
				return ($scope.editMode === true) && (fieldScope.readonly !== 'true');
			};

/*			$scope.$watch('editMode', function() {
				angular.forEach(imtFields, function(fieldScope) {
					fieldScope.editMode = isFieldEditable(fieldScope);
				});
			});*/

			this.addField = function(fieldScope, ngModelController) {

				imtFields.push(fieldScope);
				fieldScope.editMode = isFieldEditable(fieldScope);
				fieldScope.field = ngModelController;

				//Add debug property in the scope debug.
				fieldScope.debug = $scope.debug;

			};
		}
	};
});



/*

<imt-field-container> directive

Used as a container for a field (or a group of fields) and its label.
it has its own scope that has a property called "field" used to show/hide error messages.
field.$invalid == true means that the field is invalid.
See ngModelController in AngularJS documentation. for more details.

Belongs to an "imt-form" component used to register fields.


*/


app.directive('imtFieldContainer', function() {
	var html = '<div class="form-group has-feedback" ' +
	'ng-class="{\'has-error\': field.$invalid == true}"><div ng-transclude></div>' +

	'</div>';
	return {
		template: html,
		replace: true,
		restrict: 'AE',
		transclude: true,
		require: '^imtForm',
		scope: true,
		controller: function($scope) {
			//Method called by imt-field-bind-error-scope directive to update the current scope.
			this.addField = function(ngModelController) {
				//console.info('Add the field to fieldContainer scope', ngModelController.$name, ngModelController);
				$scope.field = ngModelController;
			};
			this.fieldScope = $scope;
		},
		link: function(scope, element, attrs, ctrls) {
		}
	};
});

/*

<imt-field-label> directive

Used to setup field label markup in only one place.

*/
app.directive('imtFieldLabel', function() {
	var html = '<label class="control-label" ng-transclude></label>';
	return {
		template: html,
		restrict: 'AE',
		transclude: true
	};
});

/*

<imt-field-static-text> directive

Used to display a field in read-only mode.

*/
app.directive('imtFieldStaticText', function() {
	var html = '<p class="form-control-static" ng-transclude></p>';
	return {
		template: html,
		restrict: 'AE',
		transclude: true
	};
});

/*

<imt-field-content> directive

Container for fields. Set up the error messages.

*/
app.directive('imtFieldContent', function() {
	var html = '<div ng-transclude></div>' +
	'<div	class="alert alert-danger" ' +
	'ng-messages="$parent.field.$error" ' +
	'ng-show="$parent.field.$invalid" ' +
	'ng-messages-include="modules/imt-field/error-messages.html"' +
	'></div>';
	return {
		template: html,
		restrict: 'AE',
		transclude: true,
		scope: false
	};
});

/*

<imt-input> directive

*/
app.directive('imtInput', function(ValidationMethods) {
	var getTemplate = function(element, attrs) {
		var model = attrs.ngModel;
		var type = (attrs.type === 'hidden') ? 'hidden' : 'text';

		var html = '<input ng-show="editMode" class="form-control"' +
		' ng-model="' + model + '" name="' + model + '" ng-required="' + attrs.ngRequired + '"' +
		' type="' + type + '">';

		if (type === "text") {
			html = html + '<imt-field-static-text ng-show="!editMode">{{' + model + '}}<imt-field-static>';
		}

		return html ;
	};
	return {
		restrict: 'E',
		scope: true,//creates a new scope that inherits from the parent
		template: getTemplate,
		require: ['^imtForm','^imtFieldContainer'],
		link: function(scope, element, attrs, ctrls) {
			var input = element.find('input');
			var ngModelController = input.controller('ngModel');
			if (!angular.isDefined(ngModelController)) console.error('No ngModelController');
			if (attrs.validation) {
				ValidationMethods.updateNgModel(ngModelController, attrs.validation.split(','));
			}
			ctrls[0].addField(ctrls[1].fieldScope, ngModelController);
			//ctrls[1].addField(ngModelController, attrs);
		}
	};
});

/*

<imt-select> directive

Used to display a list of keywords from a given category in LookupData.

*/
app.directive('imtSelect', function(LookupHelpers) {
	var getTemplate = function(element, attrs) {
		var model = attrs.ngModel;
		var html = '<select ng-show="editMode" class="form-control"' +
		' ng-model="' + model + '"' +
		' name="' + model + '" ng-required="' + attrs.ngRequired + '"' +
		' ng-options="item.value as item.translation for item in items">' +
		'</select>' +
		'<imt-field-static-text ng-show="!editMode"><lookup category="' + attrs.category + '" value="' + model + '"></lookup></imt-field-static-text>';
		return html ;
	};
	return {
		restrict: 'E',
		scope: true,//creates a new scope that inherits from the parent
		template: getTemplate,
		require: ['^imtForm','^imtFieldContainer'],
		link: function(scope, element, attrs, ctrls) {
			scope.category = attrs.category;
			scope.items = LookupHelpers.getTranslatedItems(scope.category);
			var select = element.find('select');
			var ngModelController = select.controller('ngModel');
			console.log(ngModelController);
			ctrls[0].addField(ctrls[1].fieldScope, ngModelController);
		}
	};
});

/*

<imt-radio> directive

Used to display radio buttons, from a given category in LookupData.

*/
app.directive('imtRadio', function(LookupHelpers) {
	var getTemplate = function(element, attrs) {
		var model = attrs.ngModel;
		var html = '<label ng-show="editMode" class="radio-inline" ng-repeat="item in items">' +
		'<input type="radio" ng-model="' + model + '"' +
		' name="' + model + '" value="{{item.value}}"/>' +
		'<span lookup category="{{category}}" value="item.value"></span>' +
		'</label>' +
		'<imt-field-static-text ng-show="!editMode"><lookup category="' + attrs.category + '" value="' + model + '"></lookup></imt-field-static>';
		return html ;
	};
	return {
		restrict: 'E',
		scope: true,//creates a new scope that inherits form the parent
		template: getTemplate,
		require: ['^imtForm','^imtFieldContainer'],
		link: function(scope, element, attrs, ctrls) {
			scope.category = attrs.category;
			scope.items = LookupHelpers.getTranslatedItems(scope.category);
			var input = element.find('input');
			var ngModelController = input.controller('ngModel');
			ctrls[0].addField(ctrls[1].fieldScope, ngModelController);
		}
	};
});
