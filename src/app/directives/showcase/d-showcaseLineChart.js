(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseLineChart', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseLineChart.html',
        controller: 'showcaseLineChartCtrl as scLineChart',
        scope: {
          sensors: '=',
          activeSensor: '=',
        }
      };
    });
})();
