/*jshint esnext: true */
(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseDashboardMethodsCtrl', ['$scope', '$compile', function($scope, $compile) {
    var _this = this;

    _this.promises = [
      {
        name: 'Get All Sensors',
        info: {
          'Description': 'Response contains an array of objects representing all of the Sensors registered to the dashboard. Each Sensor\'s identifiers and properties are included within the objects.',
          'Parameters': {
            'Required': [],
            'Optional': []
          },
        }
      },
      {
        name: 'Get One Sensor',
        info: {
          'Description': 'Response contains one object representing a single Sensor registered within the dashboard. Only the Sensor\'s properties are included within the object as the identifiers must be known already to make this call.',
          'Parameters': {
            'Required':
              [
                {name: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
                {name: 'sensor', type: 'String', desc: 'The name of the sensor to retrieve.', default: 'N/A'},
                {name: 'item', type: 'String', desc: 'The name of the item to retrieve.', default: 'N/A'}
              ],
            'Optional': []
          },
        }
      },
      {
        name: 'Get Chart Data',
        info: {
          'Description': 'Response contains an array of objects representing a single Sensor\'s readings, starting from the current time and ending at a specified time in the past. Each object contains the time and value of the reading.',
          'Parameters': {
            'Required':
              [
                {name: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
                {name: 'sensor', type: 'String', desc: 'The name of the sensor to retrieve.', default: 'N/A'},
                {name: 'item', type: 'String', desc: 'The name of the item to retrieve.', default: 'N/A'},
              ],
            'Optional':
              [
                {name: 'startTime', type: 'Integer', desc: 'A number of seconds in the past defining oldest reading to return. The start time can also take the value -1 to only return the newest reading, or undefined to return a set of readings that range the entire chart period.', default: 'undefined'},
              ],
          },
        }
      },
      {
        name: 'Get Calculated Data',
        info: {
          'Description': 'Response contains one object representing a single Sensor\'s calculated data, starting from the current time and ending at a specified time in the past. The object contains the Sensor\'s state, max value, min value, mean value, and standard deviation.',
          'Parameters': {
            'Required':
              [
                {name: 'namespace', type: 'String', desc: 'The namespace in which the sensor is stored.', default: 'N/A'},
                {name: 'sensor', type: 'String', desc: 'The name of the sensor to retrieve.', default: 'N/A'},
                {name: 'item', type: 'String', desc: 'The name of the item to retrieve.', default: 'N/A'},
              ],
            'Optional':
              [
                {name: 'startTime', type: 'Integer', desc: 'A number of seconds in the past defining oldest reading to return. The start time can also take the value -1 to only return the newest reading, or undefined to return a set of readings that range the entire chart period.', default: 'undefined'},
              ],
          },
        }
      },
    ];
  }]);
})();
