/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseWidget', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseWidget.html',
        controller: 'showcaseWidgetCtrl as scWidget',
        scope: {
          sensors: '=',
          activeSensor: '='
        }
      };
    });
})();
