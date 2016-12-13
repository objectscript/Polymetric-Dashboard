/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseMetadataTooltipCtrl', ['$scope', function($scope) {
    var _this = this;

    // default selections for the metadata tooltip
    _this.namespace = $scope.activeSensor.namespace;
    _this.sensor = $scope.activeSensor.sensor;
    _this.item = $scope.activeSensor.item;

    _this.update = update;

    function update() {
      // update the global showcase sensor data
      $scope.activeSensor.namespace = _this.namespace;
      $scope.activeSensor.sensor = _this.sensor;
      $scope.activeSensor.item = _this.item;
    }

    _this.attributes = {
      'Required': [
        {attr: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
        {attr: 'sensor', type: 'String', desc: 'The sensor to display.', default: 'N/A'},
        {attr: 'item', type: 'String', desc: 'The item to display.', default: 'N/A'}
      ],
      'Optional': [
      ]
    };
  }]);
})();
