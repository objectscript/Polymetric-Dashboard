(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.directive('smpSensorDisplay', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/visualizers/t-sensorDisplay.html',
        controller: 'sensorDisplayCtrl',
        replace: false,
        scope: {
          namespace: '@',
          sensor: '@',
          item: '@',
          units: '@',
          showLabel: '@',
          metrics: '@',
          widths: '@',
          classes: '@',
          iconClass: '@',
          showUnit: '@',
          showMetadata: '@'
        }
      };
    });
})();
