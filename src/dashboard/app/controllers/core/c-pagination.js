/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var core = angular.module('core');

  core.controller('paginationCtrl', ['$scope', '$filter', '$mdMedia', function($scope, $filter, $mdMedia) {
    // number of numbered buttons to show
    var maxVisibleButtons = 7;
    $scope.$watch(function() { return $mdMedia('xs'); }, function(xs) {
      if (xs && maxVisibleButtons !== 0) {
        maxVisibleButtons = 0;
        $scope.getBtns();
      }
    });
    $scope.$watch(function() { return $mdMedia('sm'); }, function(sm) {
      if (sm && maxVisibleButtons !== 2) {
        maxVisibleButtons = 4;
        $scope.getBtns();
      }
    });
    $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(gtSm) {
      if (gtSm && maxVisibleButtons !== 7) {
        maxVisibleButtons = 7;
        $scope.getBtns();
      }
    });
    // number of items per page (defaults to 10 but can be overriden)
    $scope.numItemsPerPage = parseInt($scope.itemsPerPage) ? parseInt($scope.itemsPerPage) : 10;
    // page to show by default (defaults to the first page but can be overriden)
    $scope.curPage = parseInt($scope.curPage) ? parseInt($scope.curPage) : 1;

    // watch the number of items because if it changes buttons might been to be updated (for instance, being on page 10 when all the results are filtered out and only 1 page is left)
    $scope.$watch('numItems', function(nV, oV) {
      // how many buttons to show (dont show 7 numbered buttons if only 3 pages are available)
      $scope.numButtons = Math.ceil(nV / $scope.numItemsPerPage);

      // any change in number of items (most likely filtering of results) should sent the user back to the first page
      $scope.curPage = 1;

      // get the buttons to show
      $scope.getBtns();
      // update the last index shown (aka the positon of the last item shown on the current page with respect to all items )
      $scope.endIndex = Math.min($scope.numItems, ($scope.startIndex + $scope.numItemsPerPage));
    });
    // watch the current page, updating the start index and and index of the shown items
    $scope.$watch('curPage', function(nV, oV) {
      $scope.startIndex = (nV - 1) * $scope.numItemsPerPage;
      $scope.endIndex = Math.min($scope.numItems, ($scope.startIndex + $scope.numItemsPerPage));
    });

    // get buttons returns an array of all the numbered buttons
    // it tries to keep the current page in the middle, but at the beginning and end end of the items no pages after the first/ last wil be shown
    $scope.getBtns = function() {
      var start = 1; // the start is by default the first page
      var end = $scope.numButtons; // the end is by default the number of buttons to show

      // if there are more pages than number of buttons shown by default we need to do some calculations
      if ($scope.numButtons > maxVisibleButtons) {
        // first get the number of button show show on either side of the current pages button
        var pad = Math.floor(maxVisibleButtons / 2);
        start = $scope.curPage - pad;
        end = $scope.curPage + pad;

        // however if this means having negative page numbers on buttons, increment them so they start at 1
        var shift = 0;
        if (start <= 0) {
          shift = -start + 1;
        }
        // again if this means having page numbers on the buttons above the number of pages of items shift their values down
        if (end > $scope.numButtons) {
          shift = $scope.numButtons - end;
        }

        // get the start end end values for the page number buttons
        start += shift;
        end += shift;
      }

      // build the array
      var btns = [];
      for (var i = start; i <= end; i++) {
        btns.push(i);
      }

      $scope.btns = btns;
    };

    // changes the page (aka the index of shown items)
    $scope.gotoPage = function(page) {
      var nextPage;

      if (page === 'first') {
        nextPage = 1;
      }
      if (page === 'previous' && $scope.curPage > 1) {
        nextPage = $scope.curPage - 1;
      }
      if (page === 'next' && $scope.curPage < $scope.numButtons) {
        nextPage = $scope.curPage + 1;
      }
      if (page === 'last') {
        nextPage = $scope.numButtons;
      }
      if (!isNaN(parseInt(page))) {
        nextPage = page;
      }

      if (nextPage && nextPage !== $scope.curPage) {
        $scope.curPage = nextPage;
      }

      $scope.getBtns();
    };

  }]);
})();
