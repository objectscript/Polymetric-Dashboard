/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('sensorDisplayCtrl', ['$scope', '$filter', '$element', '$compile', '$timeout', '$q', 'dashboard', 'UpdateProvider', function($scope, $filter, $element, $compile, $timeout, $q, dashboard, UpdateProvider) {
    var callChartData = false; // flag to see if calculated data should be retrieved from the server
    var callCalculatedData = false; // flag to see if calculated data should be retrieved from the server
    var metricValues; // object to hold all the metric data, this will be accessed by each cell in the sensor display to show the mretrics value

    // regiester chart to updateprovider, getting the "updater" to handle when to make new update calls
    var updater = UpdateProvider.updater($element, $scope, -1, control);

    // This is the main workflow director of the sensor display. It is called initially (if the chart is visible) and during any tab changes or update ticks from the dashboard
    // it will initialize the sensor display (if not already done so) otherwise it will just get new data
    function control(args) {
      // if metric values is undefined then the sensor display has not been set up and needs to be initialized
      if (!metricValues) { // initialize the sensor display if it has not been done yet
        init()
          .then(function() {
            requestData() // gets data to display on the sensor display
              .then(function(lU) {
                // give the updater the new lastUdpate time stamp, so it can calculate when the next call should be made (and make it)
                updater.delay(lU);
              });
          });
      } else { // otherwise update the sensor display
        requestData() // gets data to display on the sensor display
          .then(function(lU) {
            // give the updater the new lastUdpate time stamp, so it can calculate when the next call should be made (and make it)
            updater.delay(lU);
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
            // the updater needs to know the reading interval so it can properly time calls when the sample interval is reading interval
            updater.readingInterval = p.readingInterval;

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
          if (!!widthArr[i] && (widthArr[i] !== '')) width = widthArr[i];

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

    function requestData() {
      return $q(function(resolve, reject) {
        var promises = [];
        // always need to call for chart data so the timestamp is updated
        if (callChartData) promises.push(dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, updater.lastUpdate, metricValues.readingInterval));
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
            resolve(updater.lastUpdate);
          });
      });
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
