(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseDashboardSettings', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseDashboardSettings.html',
        scope: {}
      };
    });
})();
