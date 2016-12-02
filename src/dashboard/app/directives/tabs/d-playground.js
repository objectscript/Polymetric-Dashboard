/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpPlayground', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-playground.html',
        controller: 'playgroundCtrl as playground',
        compile: function(element, attr) {
          return {
            // In order to make the playground FAB actually fixed with respect to the application
            // not the playground tab (it will scroll with the playground tab) I detach it from the
            // dom then append it to the dashboards body.
            // This allows me to keep it within the playground scope but have it in the correct
            // dom position that it is acutally fixed.
            post: function postLink(scope, element, attrs) {
              var dash = document.body;
              var pgFab = $('#playgroundFAB').detach();

              pgFab.appendTo(dash);
            }
          };
        }
      };
    });
})();
