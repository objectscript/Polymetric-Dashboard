/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var core = angular.module('core');

  core.directive('smpPagination', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/core/t-pagination.html',
        controller: 'paginationCtrl as pagination',
        scope: {
          numItems: '=',
          startIndex: '=',
          itemsPerPage: '@',
          curPage: '='
        }
      };
    });
})();
