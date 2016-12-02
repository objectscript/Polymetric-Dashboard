/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var core = angular.module('core');

  core.directive('smpStaticWidget', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/core/t-staticWidget.html',
        controller: 'staticWidgetCtrl as staticWidget',
        replace: false,
        scope: {
          'data': '='
        }
      };
    });
})();
