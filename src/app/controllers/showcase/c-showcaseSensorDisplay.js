/*jshint esnext: true */
(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseSensorDisplayCtrl', ['$scope', '$timeout', 'WidgetProvider', function($scope, $timeout, WidgetProvider) {
    var _this = this;

    _this.update = update;
    _this.isShown = isShown;
    _this.toggleMetric = toggleMetric;

    // watch for changes of the sensors stored by the showcase controller (keep them up to day)
    $scope.$watch('sensors', function(nV, oV) {
      // only update if the sensors are not an empty arrray (no sensors)
      if (!_.isEqual(nV, {})) {
        _this.sensors = $scope.sensors;
      }
    });

    // default selections for the sensor display
    _this.namespace = $scope.activeSensor.namespace;
    _this.sensor = $scope.activeSensor.sensor;
    _this.item = $scope.activeSensor.item;
    _this.unit = $scope.activeSensor.unit;
    _this.showSensorDisplay = true;
    _this.showLabels = true;
    _this.labels = true;
    _this.sensorDisplayStyle = {'height': '105px'};

    _this.metricOptions = WidgetProvider.metrics;
    _this.metrics = 'state,sensor,value,max,min,mean,stdDev';

    function isShown(metric) {
      return _this.metrics.indexOf(metric);
    }

    function toggleMetric(metric) {
      var shown = isShown(metric);
      if (shown !== -1) {
        if (shown === 0) {
          if (_this.metrics === metric) {
            _this.metrics = '';
          } else {
            _this.metrics = _this.metrics.replace((metric + ','), '');
          }
        } else {
          _this.metrics = _this.metrics.replace((',' + metric), '');
        }

      } else {
        if (_this.metrics === '') {
          _this.metrics = metric;
        } else {
          _this.metrics = _this.metrics + (',' + metric);
        }
      }
    }

    function update() {
      // this removes the current sensor display from the DOM (this is done because the metrics must be updated
      // and the easiest way is to replace the sensor display so it updates based on the new metrics)
      _this.showSensorDisplay = false;

      // update if the sensor display should have labels
      _this.labels = _this.showLabels;
      if (_this.labels) {
        _this.sensorDisplayStyle.height = '105px';
      } else {
        _this.sensorDisplayStyle.height = '52.5px';
      }

      // update the global showcase sensor data
      $scope.activeSensor.namespace = _this.namespace;
      $scope.activeSensor.sensor = _this.sensor;
      $scope.activeSensor.item = _this.item;
      $scope.activeSensor.unit = _this.unit;
      // timeout so the call stack will finish removing it before adding it again (so new metrics are represented)
      $timeout(function() {
        _this.showSensorDisplay = true;
      }, 0);
    }

    _this.sensorAttributes = {
      'Required': [
        {attr: 'namespace', type: 'String', desc: 'The Namespace in which the sensor is stored.', default: 'N/A'},
        {attr: 'sensor', type: 'String', desc: 'The Sensor to display data of.', default: 'N/A'},
        {attr: 'item', type: 'String', desc: 'The Item to display data of.', default: 'N/A'},
        {attr: 'units', type: 'String', desc: 'The units that the Sensor\'s readings are measured in.', default: '" "'},
        {attr: 'metrics', type: 'String', desc: 'A comma separated string defining the metrics to be shown.', default: 'N/A'}
      ],
      'Optional': [
        {attr: 'widths', type: 'String', desc: 'A comma separated string defining the width of each metric\'s cell, this will be done automatically undefined.', default: '" "'},
        {attr: 'classes', type: 'String', desc: 'A comma separated string defining the class of metric\'s cell.', default: '" "'},
        {attr: 'show-label', type: 'Integer', desc: 'When true, the metric name will be displayed above its value.', default: false}
      ]
    };
  }]);
})();
