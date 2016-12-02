/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpEcp', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-ecp.html',
        controller: 'ecpCtrl as ecp'
      };
    });
})();
