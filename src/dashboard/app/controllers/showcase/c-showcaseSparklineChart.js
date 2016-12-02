/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseSparklineChartCtrl', ['$scope', 'dashboard', function($scope, dashboard) {
    var _this = this;

    // default selections for the linechart
    _this.namespace = $scope.activeSensor.namespace;
    _this.sensor = $scope.activeSensor.sensor;
    _this.item = $scope.activeSensor.item;
    _this.update = update;

    // updates the chart by calling the dashbaord broadcast method
    function update() {

      // update the global showcase sensor data
      $scope.activeSensor.namespace = _this.namespace;
      $scope.activeSensor.sensor = _this.sensor;
      $scope.activeSensor.item = _this.item;

      // emit the notify dashboard of change to emit update call for sparkline demo
      dashboard.notify({clearData: true});
    }

    _this.attributes = {
      'Required': [
        {attr: 'id', type: 'String', desc: 'An unique identifier.', default: 'N/A'},
        {attr: 'type', type: 'String', desc: 'What type of chart to display. For a sparkline chart set it to "sparklineChart".', default: 'N/A'},
        {attr: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
        {attr: 'sensor', type: 'String', desc: 'The sensor the chart will display.', default: 'N/A'},
        {attr: 'item', type: 'String', desc: 'The item the chart will display.', default: 'N/A'}

      ],
      'Optional': [
        {attr: 'height', type: 'Integer', desc: 'The height, in pixels, of the chart.', default: 48},
        {attr: 'marginLeft', type: 'Integer', desc: 'The width, in pixels, of the margin to the left of the chart.', default: 0},
        {attr: 'marginRight', type: 'Integer', desc: 'The width, in pixels, of the margin to the right of the chart.', default: 0},
        {attr: 'marginTop', type: 'Integer', desc: 'The height, in pixels, of the margin to the top of the chart.', default: 10},
        {attr: 'marginBottom', type: 'Integer', desc: 'The height, in pixels, of the margin to the bottom of the chart.', default: 4}
      ]
    };

  }]);
})();
