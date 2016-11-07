(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.directive('smpStateIcon', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/visualizers/t-stateIcon.html',
        controller: 'stateIconCtrl as stateIcon',
        replace: true,
        scope: {
          namespace: '@',
          state: '@',
          sensor: '@',
          item: '@'
        },
        compile: function compile(tElement, tAttrs, transclude) {
          return {
            post: function postLink(scope, iElement, iAttrs, controller) {
              // the post link function is run at the FINAL part of the compilation process
              // all this elements children and parents have been compiles and scopes built
              // thus this is the safest place to do scope alterations

              // Thats a bit much info for the fact I am only setting the scope.state to the
              // unknown flag, but cant hurt
              if (!scope.state) scope.state = '-1';
            }
          };
        }
      };
    });
})();
