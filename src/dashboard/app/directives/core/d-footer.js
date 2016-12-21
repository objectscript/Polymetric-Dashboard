/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var core = angular.module('core');

  core.directive('smpFooter', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/core/t-footer.html',
        controller: 'footerCtrl as footer'
      };
    });
})();
