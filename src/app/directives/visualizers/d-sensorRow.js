(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.directive('smpSensorRow', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/visualizers/t-sensorRow.html',
        controller: 'sensorRowCtrl as sensorRow',
        replace: true,

        // pass the attrs to scope
        scope: {
          namespace: '@',
          sensor: '@',
          item: '@',
          units: '@',
          desc: '@'
        },
        compile: function(element, attr) {
          return function postLink(scope, element, attrs) {
            // \W matches all charts that are not a word char (alphanumeric or underscore) from the chartID
            // because having such punctuation or whitespace can cause issues for the ID (and selectors tring to reference it)
            scope.chartId = scope.namespace.replace(/\W/g, '') + scope.sensor.replace(/\W/g, '') + scope.item.replace(/\W/g, '');
          };
        }
      };
    });
})();
