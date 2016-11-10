(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('stateIconCtrl', ['$scope', '$filter', '$element', '$timeout', '$log', '$q', 'dashboard', 'UpdateProvider', function($scope, $filter, $element, $timeout, $log, $q, dashboard, UpdateProvider) {
    var _this = this;
    var sensorProps;
    var updater;

    $scope.$watch('state', function(nV, oV) {
      // the dashboard broadcasts should only be watched when necessary (and removed otherwise)
      _this.dashboardListener = null;

      // parse the passed in state
      var state = parseInt($scope.state);

      // if no state was passed in parseInt returns -1
      if (state === -1) {
        _this.getOwnData = true;

        // regiester chart to updateprovider, getting the "updater" to handle when to make new update calls
        updater = UpdateProvider.updater($element, $scope, -1, control);

      // sometimes the passed in state will be undefined if the page has not yet rendered fully. Also if the state is the null string "" the state should show no data
      } else if (isNaN(state)) {
        _this.state = -2;
      // otherwise the state passed in is valid (or some random number) so save it
      } else {
        _this.state = state;
      }
    });

    function control(args) {

      if (!sensorProps) {
        getSensorProps()
          .then(function(p) {
            sensorProps = p;
            updater.readingInterval = sensorProps.readingInterval;
            requestData() // gets data to display on the sensor display
              .then(function(lU) {
                // give the updater the new lastUdpate time stamp, so it can calculate when the next call should be made (and make it)
                updater.delay(lU);
              });
          }, function(e) {
            $log.error(e);
          });
      } else {
        // if new data is needed (sample period/chart window change), set lastUpdate to -1 so new data (only the newest sample interval) will be retrieved
        if (args.clearData) _this.lastUpdate = -1;

        requestData() // gets data to display on the sensor display
          .then(function(lU) {
            // give the updater the new lastUdpate time stamp, so it can calculate when the next call should be made (and make it)
            updater.delay(lU);
          });
      }
    }

    // gets the sensors properties (state, critical value, warning value and units)
    function getSensorProps() {
      return $q(function(resolve, reject) {
        // get the units, warning value and critical value of the sensor
        dashboard.getSensor($scope.namespace, $scope.sensor, $scope.item)
          .then(function(p) { // if the sensor was found resolve its props
            if (p) {
              resolve(p);
            } else { // otherwise reject (no reason to do anything else if the sensor does not exist)
              reject('The sensor display was not created because the sensor "[' + $scope.namespace + '] ' + $scope.sensor + ', ' + $scope.item + '" was not found.');
            }
          });
      });
    }

    // FUNCTINALITY FOR THE STATE ICON TO GET ITS OWN DATA IF NECESSARY
    // call the dashboard Api to get a whole chart period of calcuated data
    function requestData(lU) {
      return $q(function(resolve, reject) {
        dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined, sensorProps.readingInterval)
          .then(function(data) { // SUCCESS CALLBACK: if call was successful (response could have or not have data)
            calculatedDataResponseHandler(data)
              .then(function(newLU) {
                resolve(newLU);
              });
          }, function(error) { // FAILURE CALLBACK: if there was an internal server error or incorrect uri
            resolve(lU);
          });
      });
    }

    // parse the response to get the state of the sensor
    function calculatedDataResponseHandler(data) {
      return $q(function(resolve, reject) {
        var newLU = -1;

        if (data) {
          // if the state is undefined set it to -2 (all bars will be grey)
          if (data.state === undefined) {
            _this.state = -2;
          // otherwise parse the state string into an int
          } else {
            _this.state = parseInt(data.state);
          }

          newLU = data.timestamp ? data.timestamp : -1;
        }

        // resolves with the last update or -1
        resolve(newLU);
      });
    }

  }]);
})();
