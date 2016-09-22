(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseDashboardMethods', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseDashboardMethods.html',
        controller: 'showcaseDashboardMethodsCtrl as dashboardMethods',
        scope: {}
      };
    });
})();
