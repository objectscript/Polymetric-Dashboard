(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('stateIconCtrl', ['$scope', '$filter', '$element', '$timeout', '$log', '$q', 'dashboard', function($scope, $filter, $element, $timeout, $log, $q, dashboard) {
    var _this = this;
    var sensorProps;

    $scope.$watch('state', function(nV, oV) {
      // the dashboard broadcasts should only be watched when necessary (and removed otherwise)
      _this.dashboardListener = null;

      // parse the passed in state
      var state = parseInt($scope.state);

      // if no state was passed in parseInt returns -1
      if (state === -1) {
        // keep track of when the last update was so new data can be retrieved at correct time
        _this.lastUpdate = -1;
        _this.updateClock;
        _this.getOwnData = true;

        // set up broadcast listener for automatic updates
        _this.dashboardListener = $scope.$on('updateData', function(event, args) { control(args); });
        // get initial data
        // emit the render complete event which tells the tab to update its contents data
        if ($element.css('visibility') === 'visible') control({clearData: false});

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
            requestData(-1) // gets data to display on the sensor display
              .then(function(lU) {
                delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
              });
          }, function(e) {
            $log.error(e);
          });
      } else {
        // if new data is needed (sample period/chart window change), set lastUpdate to -1 so new data (only the newest sample interval) will be retrieved
        if (args.clearData) _this.lastUpdate = -1;

        requestData(_this.lastUpdate) // gets data to display on the sensor display
          .then(function(lU) {
            delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
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

    function delayedUpdate(lU) {
      return $q(function(resolve, reject) {
        // cancel and clear the update clock to keep multiple requests from being sent to the sever at a time
        $timeout.cancel(_this.updateClock);
        _this.updateClock = undefined;

        _this.lastUpdate = lU; // update the lastUpdate global
        var delay = getUpdateDelay(lU);
        _this.updateClock = $timeout(function() { // $timeout waits the amount of miliseconds returned from getUpdateDelay(lU) before calling control() to get more data
          // only continue to get data if the component is visible
          if ($element.css('visibility') === 'visible') control({clearData: false}); // update call
        }, delay);

        resolve();
      });
    }

    // calculates the amount of time to wait until the next set of data is ready on the server
    function getUpdateDelay(lU) {
      var delay;
      // the interval is the number of seconds defined by the dashboard api
      // however, if System Interval is selected, then use the number of seconds between each reading (defined by the backend)
      var interval = dashboard.meta.samplePeriod === '0' ? sensorProps.readingInterval : dashboard.meta.samplePeriod;
      // data was aquired this request
      if (!_this.lastUpdate && !lU) {
        delay = interval * 1000; // if the delay is negative wait a full sample period (multiply by 1000 to convert senconds into miliseconds)
      // no data was aquired this request
      } else {
        var nextReadingTime = $filter('TStoUnix')(lU) + interval * 1000; // next reading time is the last update time plus one sample interval (multiply by 1000 to convert senconds into miliseconds)
        var now = moment.utc().valueOf();
        delay = nextReadingTime - now;
        if (delay <= 0) {
          delay = interval * 1000; // if the delay is negative wait a full sample interval (multiply by 1000 to convert senconds into miliseconds)
        }
      }

      // Always add 2 seconds to the delay to make sure that the data is ready on the server
      // This also makes the sensor display try to get new data in 2 seconds if it previously got data, but no data was retrieved in the last call
      return delay + 2000;
    }

    // FUNCTINALITY FOR THE STATE ICON TO GET ITS OWN DATA IF NECESSARY
    // call the dashboard Api to get a whole chart period of calcuated data
    function requestData(lU) {
      return $q(function(resolve, reject) {
        if (needsNewData()) {
          dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined, sensorProps.readingInterval)
            .then(function(data) { // SUCCESS CALLBACK: if call was successful (response could have or not have data)
              calculatedDataResponseHandler(data)
                .then(function(newLU) {
                  resolve(newLU);
                });
            }, function(error) { // FAILURE CALLBACK: if there was an internal server error or incorrect uri
              resolve(lU);
            });
        }
      });
    }

    // if the last update is before the sample interval (or never), get new data
    function needsNewData() {
      var lastUpdate = $filter('TStoUnix')(_this.lastUpdate);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();

      return lastUpdate < now;
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
