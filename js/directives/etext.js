/*
All AngularJS directives related to translations
- etext element
- etextid attribute
- lookup
-
*/

/*
Directive #1: <etext> element

Example #1:
<etext key="I0001-0043-0003">EASY TRANSFER</etext>

If you need ot inject data in the text, this directive can be used to with placeholders, using 2 attributes:
- placeholder: the text has to be replaced by data
- value: data that will replace the placeholder

Example #2:
Let's say that the traslation contains "[n]", that has to be replaced by user's username.
<etext key="I0001-0042-0002" placeholders="[n]" values="{{currentUser.username}}">
	Dear [n], thank you for using Brastel Remit!
</etext>
*/

app.directive('etext', function(Translations) {

	var replaceValue = function (text, placeholder, value) {
		var p = placeholder;
		//Replace "[" by "\\[" so that we can run a regular expression
		p = p.replace(/\[/, '\\[');
		p = p.replace(/\]/, '\\]');

		var re = new RegExp(p);
		var t = text.replace(re, value);
		return t;
	};

	return {
		restrict: 'E',
		template: '<span class="translation" ng-bind-html="getText()"></span>',
		scope: {},
		transclude: true,
		replace: true,
		link: function(scope, element, attrs) {
			// we cannot use here element.text() to get the content of the node before the template applies;
			scope.key = attrs.key;
			scope.placeholders = attrs.placeholders;
			scope.values = attrs.values;
			scope.list = attrs.list;
			scope.getText = function () {
				var text = Translations.get(scope.key, scope.defaultText);
				if (scope.values) {
					text = replaceValue(text, scope.placeholders, scope.values);
				}
				if (scope.list == 'true') {
					var array = text.split('\n');
					text = '<li>' + array.join('</li><li>') + '</li>';
				}
				return text;
			};
		},
		controller: function ($scope, $transclude) {
			//this controller is used to access the "transcluded" content of the directive
			//(the text content before the template applies)
			$transclude(function(clone) {
				$scope.defaultText = jQuery.trim(clone.text());//trim function is used to remove leading and trailing end of line characters.
			});
		}
	};
});

/*
Directive #2: etextid attribute
it is kind of shorcut of the previous directive, it is compacter but with less power.
Add etext id to any existing HTML tag to translate the tag content.
For example:
<h3 etextid="I0001-0043-0003">EASY TRANSFER</h3>
*/
app.directive('etextid1', function(Translations) {
	return {
		restrict: 'A',
		template: '<span class="translation" ng-bind-html="getText()"></span>',
		scope: {},
		transclude: true,
		link: function(scope, element, attrs) {
			// we cannot use here element.text() to get the content of the node before the template applies;
			scope.key = attrs.etextid1;
			scope.getText = function () {
				return Translations.get(scope.key, scope.defaultText);
			};
		},
		controller: function ($scope, $transclude) {
			//this controller is used to access the "transcluded" content of the directive
			//(the text content before the template applies)
			$transclude(function(clone) {
				$scope.defaultText = clone.text();
			});
		}
	};
});
app.directive('etextid', function(Translations) {
	return {
		restrict: 'A',
		priority: 1000,
		scope: {
			key: '@etextid'
		},
		link: function(scope, element, attrs) {
			scope.defaultText = element.html();
		 	element.html(Translations.get(scope.key, scope.defaultText));
		}
	};
});



/*

Directive 3: <lookup>

Example of use:
<lookup category="country" value="B" />
will display the translation for the country whose value is "B" (Brazil)

*/

app.directive('lookup', function(Translations, $sanitize, LookupData) {
	return {
		restrict: 'EA',
		template: '{{getText()}}',
		scope: {
			value: '='
		},
		link: function(scope, element, attrs) {
			scope.category = attrs.category;
			//scope.value = attrs.value;
			scope.getText = function () {
				return LookupData.getTranslation(scope.category, scope.value);
			};
		}

	};
});

/*
A helper used to avoid repeating code used by several "Lookup" directives
*/

app.factory('LookupHelpers', function(LookupData, Translations) {

	return {
		//Return an array of objects [{value:'FR', translation: 'French'},...]
		getTranslatedItems: function(category) {
			var items = LookupData.getList(category);
			var array = jQuery.map(items, function(item) {
				return {
					value: item.value,
					translation: Translations.get(item.etextid, item.text)
				};
			});
			return array;
		},
		linkFunction: function(scope, element, attrs) {
			scope.category = attrs.category;
			scope.value = attrs.value;
			scope.name = attrs.name;
			scope.emptyText = attrs.empty;
			scope.getItems = function() {
				return LookupData.getList(scope.category);
			};
			scope.getTranslatedItems = function() {
				var array = jQuery.map(scope.getItems(), function(item) {
					return {
						value: item.value,
						translation: Translations.get(item.etextid, item.text)
					};
				});

				return array;
			};
		}
	};
});

/*

Directive #4: lookup-options

Directive to add to <select> element in order to generate a list of <option> tags.

Examples:

1. Display all country, select the one whose code is "B"
<select class="form-control" lookup-options category="country" value="B"></select>

2. Display all nationalities, inserting an empty element, whose text is "---" at the first position.
<select name="nationality" lookup-options category="nationality" empty="---" class="form-control"></select>

*/
app.directive('imtLookupSelect', function(LookupHelpers) {
	var html = '<select class="form-control" ng-model="model" ' +
	'ng-options="item.value as item.translation for item in items"' +
	'ng-required="ngRequired"' +
	'></select>';
	return {
		restrict: 'EA',
		replace: false,
		template: html,
		scope: {
			category: '@',
			model: '=',
			ngRequired: '='
		},
		link: function(scope, element, attrs) {
			//LookupHelpers.linkFunction(scope, element, attrs);
			var items = LookupHelpers.getTranslatedItems(scope.category)
			scope.items = items;
		}
	};
});

/*
Directive #5 lookupRadio

Note for developers: $parent is needed inside ng-model attribute because of the ng-repeat attribute that creates a new scope.
*/

app.directive('lookupRadio', function(LookupHelpers) {
	var html = '' +
		'<label class="radio-inline" ng-repeat="item in getItems()">' +
		'<input type="radio" ng-model="$parent.binding" value="item.value" />' +
		'<span lookup category="{{category}}" value="{{item.value}}"></span>' +//call the "lookup" directive (that was defined just below)...
		'</label>' +
		'';
	return {
		restrict: 'AE',
		template: html,
		scope: {
			binding: '='
		},
		link: LookupHelpers.linkFunction
	};
});
