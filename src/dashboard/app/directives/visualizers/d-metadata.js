/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.directive('smpMetadata', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/visualizers/t-metadata.html',
        controller: 'metadataCtrl',
        replace: true,
        scope: {
          namespace: '@',
          sensor: '@',
          item: '@'
        }
      };
    });
})();
