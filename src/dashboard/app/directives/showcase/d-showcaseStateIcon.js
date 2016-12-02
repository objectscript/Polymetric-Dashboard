/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseStateIcon', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseStateIcon.html',
        controller: 'showcaseStateIconCtrl as scStateIcon',
        scope: {
          sensors: '=',
          activeSensor: '='
        }
      };
    });
})();
