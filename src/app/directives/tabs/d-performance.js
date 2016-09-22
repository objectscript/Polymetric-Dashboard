(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpPerformance', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-performance.html',
        controller: 'performanceCtrl as performance',
      };
    });
})();
