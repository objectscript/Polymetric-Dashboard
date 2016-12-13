/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseLineChartCtrl', ['$scope', 'dashboard', function($scope, dashboard) {
    var _this = this;

    // default selections for the linechart
    _this.namespace = $scope.activeSensor.namespace;
    _this.sensor = $scope.activeSensor.sensor;
    _this.item = $scope.activeSensor.item;
    _this.update = update;

    // gupdates the chart by calling the dashboard broadcast method
    function update() {
      // update the global showcase sensor data
      $scope.activeSensor.namespace = _this.namespace;
      $scope.activeSensor.sensor = _this.sensor;
      $scope.activeSensor.item = _this.item;

      // emit the notify dashboard of change to emit update call for line demo
      dashboard.notify({clearData: true});
    }

    _this.attributes = {
      'Required': [
        {attr: 'id', type: 'String', desc: 'An unique identifier.', default: 'N/A'},
        {attr: 'type', type: 'String', desc: 'What type of chart to display. For a line chart set it to "lineChart".', default: 'N/A'},
        {attr: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
        {attr: 'sensor', type: 'String', desc: 'The sensor the chart will display.', default: 'N/A'},
        {attr: 'item', type: 'String', desc: 'The item the chart will display.', default: 'N/A'}
      ],
      'Optional': [
        {attr: 'height', type: 'Integer', desc: 'The height, in pixels, of the chart.', default: 144},
        {attr: 'marginLeft', type: 'Integer', desc: 'The width, in pixels, of the margin to the left of the chart.', default: 60},
        {attr: 'marginRight', type: 'Integer', desc: 'The width, in pixels, of the margin to the right of the chart.', default: 60},
        {attr: 'marginTop', type: 'Integer', desc: 'The height, in pixels, of the margin to the top of the chart.', default: 20},
        {attr: 'marginBottom', type: 'Integer', desc: 'The height, in pixels, of the margin to the bottom of the chart.', default: 40},
        {attr: 'xaxisVisible', type: 'Boolean', desc: 'When true, the x-axis is shown.', default: true},
        {attr: 'xaxisLabel', type: 'String', desc: 'The label below x-asis.', default: '" "'},
        {attr: 'yaxisVisible', type: 'Boolean', desc: 'When true, the y-axis is shown.', default: true},
        {attr: 'yaxisLabel', type: 'String', desc: 'The label below the y-asis.', default: '" "'}
      ]
    };

  }]);
})();
