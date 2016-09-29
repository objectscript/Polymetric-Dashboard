(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('ecpCtrl', ['$rootScope', '$scope', '$timeout', '$compile', 'dashboard', function($rootScope, $scope, $timeout, $compile, dashboard) {
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

    // the tabs themselves are a midway point for the update call
    // this allows only the viz tools that are shown to be updated (reducing lag)
    dashboard.subscribe($scope, update); // subscribe to the dashboard update call
    $scope.$on('renderComplete', function(event, args) {update(args);}); // when visualization tool held in the tab are done rendering they emit this so they will be populated

    // intercept the broadcast, and only update the data if currently selected tab.
    var clearData = false;
    function update(args) {
      clearData = clearData || args.clearData;
      if ($rootScope.curTab === 'ecp') {
        $scope.$broadcast('updateData', {'clearData': clearData});
        clearData = false;
      }
    }

  }]);
})();
