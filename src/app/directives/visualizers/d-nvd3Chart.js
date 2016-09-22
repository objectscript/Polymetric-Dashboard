(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.directive('smpNvd3Chart', function() {
      return {
        restrict: 'E',
        template: '<svg class="nvd3Component" layout="row" layout-align="center center"></svg>',
        controller: 'nvd3ChartCtrl as nvd3Chart',
        replace: true,
        scope: {
          type: '@',
          id: '@',
          namespace: '@',
          sensor: '@',
          item: '@',
          units: '@',
          marginLeft: '@',
          marginRight: '@',
          marginTop: '@',
          marginBottom: '@',
          transition: '@',
          guideline: '@',
          showLegend: '@',
          xaxisVisible: '@',
          xaxisLabel: '@',
          xaxisFormat: '@',
          yaxisVisible: '@',
          yaxisLabel: '@',
          yaxisFormat: '@',
          height: '@',
        }
      };
    });
})();
