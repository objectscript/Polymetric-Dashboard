(function() {
  'use strict';

  var core = angular.module('core');

  core.directive('smpWidget', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/core/t-widget.html',
        controller: 'widgetCtrl as widget',
        replace: true,
        scope: {
          'widgetId': '@'
        }
      };
    });
})();
