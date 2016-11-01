(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseSparklineChart', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseSparklineChart.html',
        controller: 'showcaseSparklineChartCtrl as scSparklineChart',
        scope: {
          sensors: '=',
          activeSensor: '='
        }
      };
    });
})();
