(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('ecpCtrl', ['$scope', '$timeout', '$compile', 'dashboard', function($scope, $timeout, $compile, dashboard) {
    var _this = this;

    // bind to controller so template can access
    _this.show = show;

    // default to the application server
    var shown = 'app';
    // if given a truthy toggle arg will swap which grid is shown
    // otherwise returns the currently shown grid
    function show(toggle) {
      if (!toggle) {
        return shown;
      } else {
        if (shown === 'app') shown = 'data';
        else shown = 'app';
      }
    }

  }]);
})();
