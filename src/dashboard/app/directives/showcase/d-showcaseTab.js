(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseTab', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseTab.html',
        scope: false
      };
    });
})();
