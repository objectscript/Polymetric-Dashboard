(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('sensorDisplayCtrl', ['$scope', '$filter', '$element', '$compile', '$timeout', '$q', 'dashboard', function($scope, $filter, $element, $compile, $timeout, $q, dashboard) {
    var lastUpdate = -1; // The time stamp of the most recent data point displayed. This value is used to determine if new data should be collected from the server
    var updateClock; // The update clock is a reference to a $timeout function that has a delay equal to the amount of time until the next sample interval of data on the server is collected
    var callChartData = false; // flag to see if calculated data should be retrieved from the server
    var callCalculatedData = false; // flag to see if calculated data should be retrieved from the server
    var metricValues; // object to hold all the metric data, this will be accessed by each cell in the sensor display to show the mretrics value

    // Request data update DOM
    $scope.$on('updateData', function(event, args) {control(args);});
    // This is the main workflow director of the sensor display. It is called initially (if the chart is visible) and during any tab changes or update ticks from the dashboard
    // it will initialize the sensor display (if not already done so) otherwise it will just get new data
    if ($element.css('visibility') === 'visible') control({clearData: false});
    function control(args) {
      // if metric values is undefined then the sensor display has not been set up and needs to be initialized
      if (!metricValues) { // initialize the sensor display if it has not been done yet
        init()
          .then(function() {
            requestData(-1) // gets data to display on the sensor display
              .then(function(lU) {
                delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
              });
          });
      } else { // otherwise update the sensor display
        // if new data is needed (sample period/chart window change), set lastUpdate to -1 so new data (only the newest sample interval) will be retrieved
        if (args.clearData) lastUpdate = -1;

        requestData(lastUpdate) // gets data to display on the sensor display
          .then(function(lU) {
            delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
          });
      }
    }

    // initialized the DOM element and gets data
    function init() {
      return $q(function(resolve, reject) {
        // initial REST call to get static properties of the sensor (also tests if the sensor exists so charts are not created for unknown sensors)
        getSensorProps()
          .then(function(p) {
            metricValues = {};
            metricValues.sensor = '[' + $scope.namespace + '] ' + $scope.sensor + ', ' + $scope.item;
            metricValues.units = p.units;
            metricValues.criticalValue = (p.criticalValue === '' ? 'Not Set' : p.criticalValue);
            metricValues.warningValue = (p.warningValue === '' ? 'Not Set' : p.warningValue);
            metricValues.readingInterval = p.readingInterval;

            setupSensor() // sets up the sensor display DOM element
              .then(function() {
                resolve(); // once everything has been set up, resolve so the sensor display can request data from the server
              });

          }, function(e) {
            $log.error(e);
            reject();
          });
      });
    }

    function delayedUpdate(lU) {
      return $q(function(resolve, reject) {
        // cancel and clear the update clock to keep multiple requests from being sent to the sever at a time
        $timeout.cancel(updateClock);
        updateClock = undefined;

        lastUpdate = lU; // update the lastUpdate global
        var delay = getUpdateDelay(lU);
        updateClock = $timeout(function() { // $timeout waits the amount of miliseconds returned from getUpdateDelay(lU) before calling control() to get more data
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
      var interval = dashboard.meta.samplePeriod === '0' ? metricValues.readingInterval : dashboard.meta.samplePeriod;
      // data was aquired this request
      if (!lastUpdate && !lU) {
        // delay = dashboard.meta.samplePeriod * 1000; // if the delay is negative wait a full sample period
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

    function setupSensor() {
      return $q(function(resolve, reject) {

        // convert the DOMs string attrs into arrays for parsing
        var metricArr = $scope.metrics.split(',');
        var widthArr = !$scope.widths ? [] : $scope.widths.split(',');
        var classArr = !$scope.classes ? [] : $scope.classes.split(',');

        // these are split into three arrays because the data is retrieved via three routes.
        // if data from a route is not needed then that call will not be made.
        var validChartData = ['value']; // getChartData
        var validCalculatedData = ['state', 'max', 'min', 'mean', 'stdDev']; // getCalculatedData

        // go through all the properties
        var elems = [];
        var metric;
        var width;
        var elemClass;
        for (var i = 0; i < metricArr.length; i++) {
          metric = metricArr[i];
          // flags for the type of calls to make
          callChartData = callChartData || (validChartData.indexOf(metric) !== -1); // getCalculatedData
          callCalculatedData = callCalculatedData || (validCalculatedData.indexOf(metric) !== -1); // getCalculatedData

          // width defaults to auto, but can be overrided by the developer
          width = 'auto';
          if (!!widthArr[i] && (widthArr[i] !== '')) width = Number(widthArr[i]);

          // class defaults to '' (none), but can be overrided by the developer
          elemClass = '';
          if (!!classArr[i] && (classArr[i] !== '')) elemClass = classArr[i];

          elems.push({'metric': metric.trim(), 'width': width, 'class': elemClass.trim()});
        }
        $scope.elems = elems;

        // convert string elem attrs into flag bools
        $scope.showUnit = ($scope.showUnit === 'true');
        $scope.showMetadata = ($scope.showMetadata === 'true');

        resolve();
      });
    }

    function requestData(lU) {
      return $q(function(resolve, reject) {
        // only get new data if it is needed
        if (lU === -1 || needNewData(lU)) {
          var promises = [];
          // always need to call for chart data so the timestamp is updated
          if (callChartData) promises.push(dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, lU, metricValues.readingInterval));
          // promises.push(dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, lU, metricValues.readingInterval));
          // if calculated data is needed for the sensor display make that call as well
          if (callCalculatedData) promises.push(dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined, metricValues.readingInterval));

          // $q.all combines multiple promises into one response
          $q.all(promises)
            .then(function(resp) { // SUCCESS CALLBACK: if call was successful (response could have or not have data
              if (resp) {
                handleResponse(resp) // parse the data returned by the server
                  .then(function(newLU) {
                    resolve(newLU); // resolve the new lastUpdate
                  });
              }
            }, function(error) { // FAILURE CALLBACK: if there was an internal server error or incorrect uri
              resolve(lU);
            });
        // otherwise new data is not needed
        } else {
          resolve(lU); // resolve current lastUpdate
        }
      });
    }

    // Tests if the current data is out-of-date (needs to update it)
    function needNewData(lU) {
      var prev = $filter('TStoUnix')(lU);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();
      return prev < now;
    }

    // extracts the data returned by the server and saves it in a local variable so it can be displayed
    function handleResponse(resp) {
      return $q(function(resolve, reject) {
        // since the sensor display can get data from two routes, I use lodash to merge the responses into one object
        // merge overwrites existing data, so newest data will be shown
        for (var i = 0; i < resp.length; i++) {
          // ChartData returns an array of one object, CalcData returns an object
          // so extract the chartData object and merge, or just merge the CalcData object
          metricValues = _.merge(metricValues, (angular.isArray(resp[i]) ? resp[i][resp[i].length - 1] : resp[i]));
        }

        // store the metric values in the scope
        for (var j = 0; j < $scope.elems.length; j++) {
          $scope.elems[j].value = getMetricValue($scope.elems[j].metric);
        }

        var newLU = metricValues.timestamp ? metricValues.timestamp : -1;
        // resolve the most recent timestamp (will become the new lastUpdate)
        resolve(newLU);
      });
    }

    // reutrns the values of the metrics to be shown
    function getMetricValue(metric) {
      var display = '';
      // if there is no data format it correctly
      if (metricValues[metric] !== undefined) {
        // timestamps to local time
        if (metric === 'timestamp') {
          display = $filter('TStoLocal')(metricValues[metric]);
        // values append the unit
        } else if (['value', 'max', 'min', 'mean', 'stdDev'].indexOf(metric) !== -1) {
          display = $filter('number')(metricValues[metric], 1).replace('.0', '') + metricValues.units;
        // otherwise just return the value
        } else if (['criticalValue', 'warningValue'].indexOf(metric) !== -1) {
          display = metricValues[metric] + metricValues.units;
        } else {
          display = metricValues[metric];
        }
      // if there is no data return No Data
      } else {
        display = 'No Data';
      }

      return display;
    }
  }]);
})();
