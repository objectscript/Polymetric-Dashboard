(function() {
  'use strict';

  var core = angular.module('core');

  core.directive('smpContent', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/core/t-content.html',
        controller: 'contentCtrl as content'
      };
    });
})();
