(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('sensorDisplayCtrl', ['$scope', '$filter', '$element', '$compile', '$q', 'dashboard', function($scope, $filter, $element, $compile, $q, dashboard) {
    $scope.lastUpdate = undefined;

    // flag to see if calculated data should be retrieved from the server
    var localFormat = 'MMM D, h:mma';
    var callCalculatedData = false; // getCalculatedData

    // object to hold all the metric data, this will be accessed by each cell in the sensor display to show the mretrics value
    var metricValues = {};

    // initialize sensor by finding out what data it needs to display, as well as any custom widths or classes to applyChanges
    // to each of its displayed metrics.
    // the user can set these but there are defaults if no data is given (for the widths and style, metrics must be given)
    setupSensor()
      .then(function() {
        // Once the chart has been set up then add listeners
        // update data listener
        $scope.$on('updateData', function(event, args) {getInfo();});

        // initially the sensor display needs to get properties of the sensor
        if ($scope.namespace && $scope.sensor && $scope.item) {
          dashboard.getSensor($scope.namespace, $scope.sensor, $scope.item)
            .then(function(data) {
              // extract the sensor properties and store them locally
              if (data) {
                metricValues.sensor = '[' + $scope.namespace + '] ' + $scope.sensor + ', ' + $scope.item;
                metricValues.units = data.units;
                metricValues.criticalValue = (data.criticalValue === '' ? 'Not Set' : data.criticalValue);
                metricValues.warningValue = (data.warningValue === '' ? 'Not Set' : data.warningValue);
              }

              // emit the render complete event which tells the tab to update its contents data
              $scope.$emit('renderComplete', {clearData: false});
            });
        }
      });
    function setupSensor() {
      return $q(function(resolve, reject) {

        // convert the DOMs string attrs into arrays for parsing
        var metricArr = $scope.metrics.split(',');
        var widthArr = !$scope.widths ? [] : $scope.widths.split(',');
        var classArr = !$scope.classes ? [] : $scope.classes.split(',');

        // these are split into three arrays because the data is retrieved via three routes.
        // if data from a route is not needed then that call will not be made.
        var validCalculatedData = ['state', 'max', 'min', 'mean', 'stdDev']; // getCalculatedData

        // go through all the properties
        var elems = [];
        var metric;
        var width;
        var elemClass;
        for (var i = 0; i < metricArr.length; i++) {
          metric = metricArr[i];
          // flags for the type of calls to make
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

    function getInfo() {
      if (needNewInfo()) {
        var promises = [];

        // always need to call for chart data so the timestamp is updated
        promises.push(dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, -1));
        // if calculated data is needed for the sensor display make that call as well
        if (callCalculatedData) promises.push(dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined));

        // $q.all combines multiple promises into one response
        $q.all(promises)
          .then(function(resp) {
            if (resp) {
              handleResponse(resp);
            }
          });

        // if a call was made but no response recieved, set the last update to null so it is known not to make another call
        if ($scope.lastUpdate === undefined) $scope.lastUpdate = null;
      }
    }

    // Tests if the current data is out-of-date (needs to update it)
    // returns true if $scope.lastUpdate is undefined, but false if $scope.lastUpdate=null
    function needNewInfo() {
      var lastUpdate = $filter('TStoUnix')($scope.lastUpdate);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();
      return lastUpdate < now;
    }

    // extracts the data returned by the server and saves it in a local variable so it can be displayed
    function handleResponse(resp) {
      // since the sensor display can get data from two routes, I use lodash to merge the responses into one object
      // merge overwrites existing data, so newest data will be shown
      for (var i = 0; i < resp.length; i++) {
        // ChartData returns an array of one object, CalcData returns an object
        // so extract the chartData object and merge, or just merge the CalcData object
        metricValues = _.merge(metricValues, (angular.isArray(resp[i]) ? resp[i][0] : resp[i]));
      }

      for (var j = 0; j < $scope.elems.length; j++) {
        $scope.elems[j].value = getMetricValue($scope.elems[j].metric);
      }

      // if the first data response has no data, $scope.lastUpdate will be remain null and no new data will
      // even be retrieved. By setting $scope.lastupdate back to undefined new data will be requested for (even if it does not exist)
      if ($scope.lastUpdate === null) $scope.lastUpdate = undefined;
      else $scope.lastUpdate = metricValues.timestamp;
    }

    // reutrns the values of the metrics to be shown
    function getMetricValue(metric) {
      var display = '';
      // if there is no data format it correctly
      if (metricValues[metric] !== undefined) {
        // timestamps to local time
        if (metric === 'timestamp') {
          display = $filter('TStoLocal')(metricValues[metric], localFormat);
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
