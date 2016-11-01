(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpSummary', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-summary.html',
        controller: 'summaryCtrl as summary'
      };
    });
})();
