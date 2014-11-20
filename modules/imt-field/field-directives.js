/*

imt-form directive

To be used as an attribute of a <form> element

*/

app.directive('imtForm', function() {
	return {
		restrict: 'A',
		scope: true,
		compile: function(scope, element, attrs) {
			return {
				pre: function(scope, element, attrs) {
					//Set the form editMode attribute (true by default)
					scope.editMode = (attrs.editMode === 'true' || !angular.isDefined(attrs.editMode));
					scope.debugMode = (attrs.debugMode === 'true');
				}
			};
		},
		controller: function($scope) {

			var imtFields = [];

			this.addField = function(fieldBlockScope, ngModelController, fieldScope) {
				//called by imt-input, imt-select and imt-radio children directives to "register" a new field.

				imtFields.push(fieldBlockScope);
				fieldBlockScope.editMode = isFieldEditable(fieldBlockScope);
				fieldBlockScope.field = ngModelController;

				//Add isEditable function to imt field scopes, used in imt-input, imt-select and imt-radio templates
				fieldScope.isEditable = function() {
        	return fieldBlockScope.editMode;
      	};

				//Add debug property in the field scope.
				fieldBlockScope.debug = $scope.debug;

			};

			//Watch for changes about the editmode form property
			$scope.$watch('editMode', function() {
				angular.forEach(imtFields, function(fieldBlockScope) {
					fieldBlockScope.editMode = isFieldEditable(fieldBlockScope)
				});
			});
			var isFieldEditable = function(fieldBlockScope) {
				return ($scope.editMode === true) && (fieldBlockScope.readonly !== true);
			};
		}
	};
});



/*

<imt-field-blockr> directive

Used as a container for a field (or a group of fields) and its label.
it has its own scope that has a property called "field" used to show/hide error messages.
field.$invalid == true means that the field is invalid.
See ngModelController in AngularJS documentation. for more details.

Belongs to an "imt-form" component used to register fields.


*/


app.directive('imtFieldBlock', function() {
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
		compile: function(element, attrs) {
			return {
				pre: function(scope, element, attrs) {
					scope.readonly = (attrs.readonly == 'true');
					scope.directiveName = 'imtFieldBlock';
				}
			};
		},
		controller: function($scope) {
			this.fieldScope = $scope;
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

		var html = '<input ng-show="isEditable()" class="form-control"' +
		' ng-model="' + model + '" name="' + model + '" ng-required="' + attrs.ngRequired + '"' +
		' type="' + type + '">';

		if (type === "text") {
			html = html + '<imt-field-static-text ng-show="!isEditable()">{{' + model + '}}<imt-field-static>';
		}

		return html ;
	};
	return {
		restrict: 'E',
		scope: true,//creates a new scope that inherits from the parent
		template: getTemplate,
		require: ['^imtForm','^imtFieldBlock'],
		link: function(scope, element, attrs, ctrls) {
			var input = element.find('input');
			var ngModelController = input.controller('ngModel');
			if (!angular.isDefined(ngModelController)) console.error('No ngModelController');
			if (attrs.validation) {
				ValidationMethods.updateNgModel(ngModelController, attrs.validation.split(','));
			}
			ctrls[0].addField(ctrls[1].fieldScope, ngModelController, scope);

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
		require: ['^imtForm','^imtFieldBlock'],
		link: function(scope, element, attrs, ctrls) {
			scope.category = attrs.category;
			scope.items = LookupHelpers.getTranslatedItems(scope.category);
			var select = element.find('select');
			var ngModelController = select.controller('ngModel');
			ctrls[0].addField(ctrls[1].fieldScope, ngModelController, scope);
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
		require: ['^imtForm','^imtFieldBlock'],
		link: function(scope, element, attrs, ctrls) {
			scope.category = attrs.category;
			scope.items = LookupHelpers.getTranslatedItems(scope.category);
			var input = element.find('input');
			var ngModelController = input.controller('ngModel');
			ctrls[0].addField(ctrls[1].fieldScope, ngModelController, scope);
		}
	};
});

app.directive('imtField', function() {
	return {
		restrict: 'A',
		controller: function() {

    }
	};
});
