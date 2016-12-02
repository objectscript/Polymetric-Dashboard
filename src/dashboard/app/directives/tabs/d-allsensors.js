/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpAllsensors', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-allsensors.html',
        controller: 'allsensorsCtrl as allsensors'
      };
    });
})();
