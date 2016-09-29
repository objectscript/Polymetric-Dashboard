(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseSidenav', ['$mdSidenav', function($mdSidenav) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/templates/showcase/t-showcaseSidenav.html',
        controller: false,
        compile: function(element, attr) {
          return {
            // In order to make the shocase side nav actually fixed with respect to the application
            // not the showcase tab (it will scroll with the playground tab) I detach it from the
            // dom then append it to the dashboards body.
            // This allows me to keep it within the playground scope but have it in the correct
            // dom position that it is acutally fixed.
            post: function prelink(scope, element, attrs) {
              var dash = $('#SMPDashbaord');
              var scSideNav = $('#showcaseSideNav').detach();

              scSideNav.appendTo(dash);

              $mdSidenav('showcaseSidenav').toggle();
            }
          };
        }
      };
    }]);
})();
