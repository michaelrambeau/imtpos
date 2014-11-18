app.directive('ngJqueryPlugin', [function() {
    return {
        link : function(scope, element, attrs) {
            var plugins=scope.$eval(attrs.ngJqueryPlugin), $e=jQuery(element);

            Object.keys(plugins).forEach(function( plugin) {
                $e[plugin](plugins[plugin]);
            });
        }
    };
}]);
