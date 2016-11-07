/*jshint esnext: true */
(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseLineChartCtrl', ['$scope', 'dashboard', function($scope, dashboard) {
    var _this = this;

    _this.update = update;

    // watch for changes of the sensors stored by the showcase controller (keep them up to day)
    $scope.$watch('sensors', function(nV, oV) {
      // only update if the sensors are not an empty arrray (no sensors)
      if (!_.isEqual(nV, {})) {
        _this.sensors = $scope.sensors;
      }
    });

    // default selections for the linechart
    _this.namespace = $scope.activeSensor.namespace;
    _this.sensor = $scope.activeSensor.sensor;
    _this.item = $scope.activeSensor.item;
    _this.unit = $scope.activeSensor.unit;

    // gets the new sensors unit and updates the chart by calling the dashbaord broadcast method
    function update() {
      _this.unit = _this.sensors[_this.namespace][_this.sensor].units;

      // update the global showcase sensor data
      $scope.activeSensor.namespace = _this.namespace;
      $scope.activeSensor.sensor = _this.sensor;
      $scope.activeSensor.item = _this.item;
      $scope.activeSensor.unit = _this.unit;

      // emit the notify dashboard of change to emit update call for line demo
      dashboard.notify({clearData: true});
    }

    _this.lineChartAttributes = {
      'Required': [
        {attr: 'id', type: 'String', desc: 'A unique identifier needed to show and update the NVD3 chart and its data.', default: 'N/A'},
        {attr: 'type', type: 'String', desc: 'What type of chart to display. For a line chart set it to "lineChartCtrl".', default: 'N/A'},
        {attr: 'namespace', type: 'String', desc: 'The Namespace in which the sensor is stored.', default: 'N/A'},
        {attr: 'sensor', type: 'String', desc: 'The Sensor the chart will display data of.', default: 'N/A'},
        {attr: 'item', type: 'String', desc: 'The Item the chart will display data of.', default: 'N/A'},
        {attr: 'units', type: 'String', desc: 'The units that the Sensor\'s readings are measured in.', default: '" "'}

      ],
      'Optional': [
        {attr: 'height', type: 'Integer', desc: 'The height of the chart defined as a number of pixels.', default: 144},
        {attr: 'marginLeft', type: 'Integer', desc: 'The width, in pixels of the margin to the left of the chart.', default: 60},
        {attr: 'marginRight', type: 'Integer', desc: 'The width, in pixels of the margin to the right of the chart.', default: 60},
        {attr: 'marginTop', type: 'Integer', desc: 'The height, in pixels of the margin to the top of the chart.', default: 20},
        {attr: 'marginBottom', type: 'Integer', desc: 'The height, in pixels of the margin to the bottom of the chart.', default: 40},
        {attr: 'showLegend', type: 'Boolean', desc: 'When true a legened defining the collections of data available to the chart is shown.', default: false},
        {attr: 'xaxisVisible', type: 'Boolean', desc: 'When true, the x-axis is shown.', default: true},
        {attr: 'xaxisLabel', type: 'String', desc: 'The label below x-asis.', default: '" "'},
        {attr: 'yaxisVisible', type: 'Boolean', desc: 'When true, the y-axis is shown.', default: true},
        {attr: 'yaxisLabel', type: 'String', desc: 'The label below the y-asis.', default: '" "'}
      ]
    };

  }]);
})();
