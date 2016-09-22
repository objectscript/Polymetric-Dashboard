(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('sensorDisplayCtrl', ['$scope', '$filter', '$element', '$compile', 'dashboard', function($scope, $filter, $element, $compile, dashboard) {
    $scope.lastUpdate = undefined;

    // parent hight is used to format the sensor display (it makes it the full height)
    $scope.parentHeight = $element.parent()[0].clientHeight;

    // flags to see if new data is needed from the server
    var callSensor = false; // getSensor
    var callChartData = false; // getChartData
    var callCalculatedData = false; // getCalculatedData
    var format = 'MMM D, h:mma'; // format for the timestamp

    // initialize sensor by finding out what data it needs to display, as well as any custom widths or classes to applyChanges
    // to each of its displayed metrics.
    // the user can set these but there are defaults if no data is given (for the widths and style, metrics must be given)
    setupSensor();
    function setupSensor() {
      // convert the DOMs string attrs into arrays for parsing
      var metricArr = $scope.metrics.split(',');
      var widthArr = !$scope.widths ? [] : $scope.widths.split(',');
      var classArr = !$scope.classes ? [] : $scope.classes.split(',');

      // these are split into three arrays because the data is retrieved via three routes.
      // if data from a route is not needed then that call will not be made.
      var validSensor = ['criticalValue', 'warningValue', 'units']; // getSensor
      var validChartData = ['value', 'timestamp']; // getChartData
      var validCalculatedData = ['state', 'max', 'min', 'mean', 'stdDev']; // getCalculatedData

      // go through all the properties
      $scope.elems = [];
      var metric;
      var width;
      var elemClass;
      for (var i = 0; i < metricArr.length; i++) {
        metric = metricArr[i];
        // flags for the type of calls to make
        callSensor = callSensor || (validSensor.indexOf(metric) !== -1); // getSensor
        callChartData = callChartData || (validChartData.indexOf(metric) !== -1); // getChartData
        callCalculatedData = callCalculatedData || (validCalculatedData.indexOf(metric) !== -1); // getCalculatedData

        // width defaults to auto, but can be overrided by the developer
        width = 'auto';
        if (!!widthArr[i] && (widthArr[i] !== '')) width = Number(widthArr[i]);

        // class defaults to '' (none), but can be overrided by the developer
        elemClass = '';
        if (!!classArr[i] && (classArr[i] !== '')) elemClass = classArr[i];

        $scope.elems.push({'metric': metric.trim(), 'width': width, 'class': elemClass.trim()});
      }

      // convert string elem attrs into flag bools
      $scope.showUnit = ($scope.showUnit === 'true');
      $scope.showMetadata = ($scope.showMetadata === 'true');

      // initial get of display metrics
      getInfo();
    }

    // on get new data broadcasts update displayed data
    $scope.$on('updateDashboardData', function(event, args) {
      getInfo();
    });

    function getInfo() {
      // since sensor information will not change only call it once during ititialization
      if (!$scope.lastUpdate)  {
        if (callSensor) dashboard.getSensor($scope.namespace, $scope.sensor, $scope.item)
          .then(function(data) {
            handleResponse(data);
          });
      }
      if (!$scope.lastUpdate || needNewInfo()) {
        // always need to call for chart data so the timestamp is updated
        dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, -1)
          .then(function(data) {
            handleResponse(data);
          });
        if (callCalculatedData) dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined)
          .then(function(data) {
            handleResponse(data);
          });
      }
    }

    // Tests if the current data is out-of-date (needs to update it)
    function needNewInfo() {
      var lastUpdate = $filter('TStoUnix')($scope.lastUpdate);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();

      return lastUpdate < now;
    }

    // extracts the data returned by the server
    // this is a bit complicated because it relies on
    // the data the dev wants to show and this method is accepting of any general config
    function handleResponse(data) {
      // if the server responded with data
      if (data) {
        // if this is the data returned from the chartData call it is inside an array,
        // so extract the newest piece of data and update the lastUpdate var
        if (angular.isArray(data)) {
          data = data[0];
          $scope.lastUpdate = data.timestamp;
        }

        var returnedMetrics = Object.keys(data);
        // parse through all the returned data
        for (var i = 0; i < returnedMetrics.length; i++) {
          // parse through all the metrics to display
          for (var j = 0; j < $scope.elems.length; j++) {
            // if the returned data is supposed to be shown
            if (returnedMetrics[i] === $scope.elems[j].metric) {

              if (['sensor', 'item', 'timestamp'].indexOf($scope.elems[j].metric) !== -1) { // sensors and items are plane strings
                $scope.elems[j].val = data[returnedMetrics[i]];
              } else if ($scope.elems[j].metric === 'state') {
                if (data[returnedMetrics[i]] === undefined) {
                  $scope.elems[j].val = -2;
                } else {
                  $scope.elems[j].val = data[returnedMetrics[i]];
                }
              } else if (['criticalValue', 'warningValue'].indexOf($scope.elems[j].metric) !== -1) {
                if (data[returnedMetrics[i]] === '' || data[returnedMetrics[i]] === undefined) {
                  $scope.elems[j].val = 'Not Set';
                } else {
                  $scope.elems[j].val = $filter('number')(data[returnedMetrics[i]], 1).replace('.0', '');
                }
              }else { // otherwise format the number to be of 1 decimal accuracy
                $scope.elems[j].val = $filter('number')(data[returnedMetrics[i]], 1).replace('.0', '');
              }
            }
          }

          for (var k = 0; k < $scope.elems.length; k++) {
            if ($scope.elems[k].metric === 'sensor') {
              $scope.elems[k].val = [
                {display: '[' + $scope.namespace + ']', style: 'opacity: .82;', class: 'md-body-1'},
                {display: $scope.sensor + ',', style: 'padding: 0 1em 0 1em;', class: 'md-body-1'},
                {display: $scope.item, class: 'md-body-1'}
              ];
            }
            if ($scope.elems[k].metric === 'units') {
              $scope.elems[k].val = $scope.units;
            }
          }
        }
      }
    }

    // returns the display string for all the metrics
    $scope.getElemValDisplay = function(elem, index) {
      var display;
      if (elem.val !== undefined) {
        var val = elem.val;

        // times should be formatted for ease of reading and locale
        if (elem.metric === 'timestamp') {
          display = formatTime(val);
        // for value based metrics concat the unit
        } else if (['value', 'max', 'min', 'mean', 'stdDev', 'criticalValue', 'warningValue'].indexOf(elem.metric) !== -1) {
          if (elem.val !== '' && elem.val !== 'Not Set') {
            display = val + $scope.units;
          }
        // otherwise just return the value
        } else {
          display = val;
        }
      } else {
        display = 'No Data';
      }

      return display;
    };

    // formats the time for display
    function formatTime(time) {
      return $filter('TStoLocal')(time, format);
    }

  }]);
})();
