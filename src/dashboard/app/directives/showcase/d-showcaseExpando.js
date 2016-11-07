(function() {
  'use strict';

  var showcase = angular.module('showcase');

  showcase.directive('smpShowcaseExpando', function() {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'app/templates/showcase/t-showcaseExpando.html',
        controller: 'showcaseExpandoCtrl as scExpando',
        scope: {}
      };
    });
})();
