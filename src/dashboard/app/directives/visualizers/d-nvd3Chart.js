/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.directive('smpNvd3Chart', function() {
      return {
        restrict: 'E',
        template: '<svg layout="row" layout-align="center center"></svg>',
        controller: 'nvd3ChartCtrl as nvd3Chart',
        replace: true,
        scope: {
          type: '@',
          id: '@',
          namespace: '@',
          sensor: '@',
          item: '@',
          marginLeft: '@',
          marginRight: '@',
          marginTop: '@',
          marginBottom: '@',
          xaxisVisible: '@',
          xaxisLabel: '@',
          yaxisVisible: '@',
          yaxisLabel: '@',
          height: '@'
        }
      };
    });
})();
