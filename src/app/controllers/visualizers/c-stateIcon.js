(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('stateIconCtrl', ['$scope', '$filter', 'dashboard', function($scope, $filter, dashboard) {
    var _this = this;

    $scope.$watch('state', function(nV, oV) {
      // the dashboard broadcasts should only be watched when necessary (and removed otherwise)
      _this.dashboardListener = null;

      // parse the passed in state
      var state = parseInt($scope.state);

      // if no state was passed in parseInt returns -1
      if (state === -1) {
        // keep track of when the last update was so new data can be retrieved at correct time
        _this.lastUpdate = undefined;

        getData();
        _this.getOwnData = true;

        // set up broadcast listener for automatic updates
        _this.dashboardListener = $scope.$on('updateDashboardData', function(event, args) {
          if (needsNewData())
            getData();
        });
        // sometimes the passed value will be undefined if the page has not yet rendered fully
        // otherwise if the state is the null string "" the state should show no data (this is what the
        // server returns for no data)
      } else if (isNaN(state)) {
        _this.state = -2;
      // otherwise the state passed in is valid (or some random number) so save it
      } else {
        _this.state = state;
      }
    });

    // FUNCTINALITY FOR THE STATE ICON TO GET ITS OWN DATA IF NECESSARY

    // if the last update is before the sample period (or never), get new data
    function needsNewData() {
      var lastUpdate = $filter('TStoUnix')(_this.lastUpdate);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();

      return lastUpdate < now;
    }

    // call the dashboard Api to get a whole chart window of calcuated data
    function getData() {
      dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined)
        .then(function(data) {
          calculatedDataRespHandler(data);
        });
    }

    // parse the response to get the state of the sensor
    function calculatedDataRespHandler(data) {
      if (data) {
        // if the state is undefined set it to -2 (all bars will be grey)
        if (data.state === undefined) {
          _this.state = -2;
        // otherwise parse the state string into an int
        } else {
          _this.state = parseInt(data.state);
        }
      }
    }

  }]);
})();
