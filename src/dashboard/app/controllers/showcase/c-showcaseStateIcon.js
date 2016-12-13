/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseStateIconCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    var _this = this;

    // default selections for the sensor display
    _this.namespace = $scope.activeSensor.namespace;
    _this.sensor = $scope.activeSensor.sensor;
    _this.item = $scope.activeSensor.item;
    _this.stateOptions = [
      {value: 0, label: 'Normal'},
      {value: 1, label: 'Warning'},
      {value: 2, label: 'Alert'},
      {value: -2, label: 'Unknown'}
    ];
    _this.state = _this.stateOptions[2].value;
    _this.selectedState = _this.stateOptions[2].value;
    _this.showStateIcon = true;
    _this.update = update;

    function update() {
      // this removes the current sensor display from the DOM (this is done because the metrics must be updated
      // and the easiest way is to replace the sensor display so it updates based on the new metrics)
      _this.showStateIcon = false;

      // update the global showcase sensor data
      $scope.activeSensor.namespace = _this.namespace;
      $scope.activeSensor.sensor = _this.sensor;
      $scope.activeSensor.item = _this.item;

      // update the selected state sate icon's value
      _this.state = _this.selectedState;

      // timeout so the call stack will finish removing it before adding it again (so new metrics are represented)
      $timeout(function() {
        _this.showStateIcon = true;
      }, 0);
    }

    _this.attributes = {
      'Required': [
        {attr: 'state', type: 'Integer', desc: 'The state to display.', default: '-2'},
        {type: 'alternative', msg: 'or'},
        {attr: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
        {attr: 'sensor', type: 'String', desc: 'The sensor to display.', default: 'N/A'},
        {attr: 'item', type: 'String', desc: 'The item to display.', default: 'N/A'}
      ],
      'Optional': [
      ]
    };
  }]);
})();
