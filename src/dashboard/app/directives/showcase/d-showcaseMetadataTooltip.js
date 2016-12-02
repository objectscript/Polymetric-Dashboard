/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseMetadataTooltip', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseMetadataTooltip.html',
        controller: 'showcaseMetadataTooltipCtrl as scMetadata',
        scope: {
          sensors: '=',
          activeSensor: '='
        }
      };
    });
})();
