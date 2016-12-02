/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpShowcase', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-showcase.html',
        controller: 'showcaseCtrl as showcase'
      };
    });
})();
