/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var filter = angular.module('filters');

  filter.filter('range', function() {
    return function(start, end, step) {
      var s = parseInt(start);
      var e = parseInt(end);
      var st = parseInt(step);

      if (isNaN(s) || !isFinite(s)) {
        return [];
      }

      if (isNaN(e) || !isFinite(e)) {
        return [];
      }

      if (isNaN(st) || !isFinite(st)) {
        st = 1;
      }

      return Array.apply(null, Array(e)).map(function(_, i) {
        return st * i + s;
      });
    };
  });

  filter.filter('startFrom', function() {
    return function(input, start) {
      if (input) {
        start = +start; //parse to int
        return input.slice(start);
      }
      return [];
    };
  });
})();
