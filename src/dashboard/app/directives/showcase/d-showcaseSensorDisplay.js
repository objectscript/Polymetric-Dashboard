/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseSensorDisplay', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseSensorDisplay.html',
        controller: 'showcaseSensorDisplayCtrl as scSensorDisplay',
        scope: {
          sensors: '=',
          activeSensor: '='
        }
      };
    });
})();
