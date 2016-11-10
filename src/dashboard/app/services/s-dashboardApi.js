(function() {
  'use strict';

  var app = angular.module('dashboardApi', []);

  /*  Holds all the sensor information */
  app.factory('dashboard', ['$rootScope', '$http', '$q', '$log', '$filter', '$interval', '$timeout', '$localStorage', function($rootScope, $http, $q, $log, $filter, $interval, $timeout, $localStorage) {
    var dashboard = {};

    // sets up the properties needed for the dashboard
    dashboard.meta = initDashboardProperties();
    function initDashboardProperties() {

      var defaults = {
        chartWindow: moment.duration(1, 'hour').as('seconds'),
        samplePeriod: moment.duration(1, 'minute').as('seconds'), // 1 minute
        timezone: moment.tz.guess(), // method to call if no timezone was set (it guesses where the user is)
        timeDisplayFormat: 'MMM D, h:mma',
        useAdvancedFormat: false,
        advTimeDisplayFormat: 'MMM D, h:mm:ssa',
        debug: {
          rest: false
        }
      };

      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};

      // pull saved params from local storage, otherwise use the defaults
      var params = {
        // for readability I use moment's duration objects here to
        // define the available chart periods and sample intervals.
        // the .as('seconds') call will return an integer value of seconds,
        // allowing for easy comparison and sorting of the values
        chartWindows: [// available chart period options
          {'val': moment.duration(1, 'hour').as('seconds'), 'display': moment.duration(1, 'hour').humanize()},
          {'val': moment.duration(2, 'hours').as('seconds'), 'display': moment.duration(2, 'hours').humanize()},
          {'val': moment.duration(6, 'hours').as('seconds'), 'display': moment.duration(6, 'hours').humanize()},
          {'val': moment.duration(12, 'hours').as('seconds'), 'display': moment.duration(12, 'hours').humanize()},
          {'val': moment.duration(1, 'day').as('seconds'), 'display': moment.duration(1, 'day').humanize()},
          {'val': moment.duration(2, 'days').as('seconds'), 'display': moment.duration(2, 'days').humanize()},
          {'val': moment.duration(3, 'days').as('seconds'), 'display': moment.duration(3, 'days').humanize()},
          {'val': moment.duration(4, 'days').as('seconds'), 'display': moment.duration(4, 'days').humanize()}
        ],
        samplePeriods: [// available sample interval options
          {'val': moment.duration(0, 'seconds').as('seconds'), 'display': 'Reading Interval'},
          {'val': moment.duration(1, 'minute').as('seconds'), 'display': moment.duration(1, 'minute').humanize()},
          {'val': moment.duration(5, 'minute').as('seconds'), 'display': moment.duration(5, 'minute').humanize()},
          {'val': moment.duration(15, 'minute').as('seconds'), 'display': moment.duration(15, 'minute').humanize()},
          {'val': moment.duration(30, 'minute').as('seconds'), 'display': moment.duration(30, 'minute').humanize()},
          {'val': moment.duration(1, 'hour').as('seconds'), 'display': moment.duration(1, 'hour').humanize()},
          {'val': moment.duration(2, 'hours').as('seconds'), 'display': moment.duration(2, 'hours').humanize()},
          {'val': moment.duration(6, 'hours').as('seconds'), 'display': moment.duration(6, 'hours').humanize()}
        ]
      };
      params.samplePeriod = $localStorage.Dashboard.samplePeriod;
      if (!params.samplePeriod) params.samplePeriod = defaults.samplePeriod;

      params.chartWindow = $localStorage.Dashboard.chartWindow;
      if (!params.chartWindow) params.chartWindow = defaults.chartWindow;

      params.timezone = $localStorage.Dashboard.timezone;
      if (!params.timezone) params.timezone = defaults.timezone;

      params.timeDisplayFormat = $localStorage.Dashboard.timeDisplayFormat;
      if (!params.timeDisplayFormat) params.timeDisplayFormat = defaults.timeDisplayFormat;

      params.useAdvancedFormat = $localStorage.Dashboard.useAdvancedFormat;
      if (!params.useAdvancedFormat) params.useAdvancedFormat = defaults.useAdvancedFormat;

      params.advTimeDisplayFormat = $localStorage.Dashboard.advTimeDisplayFormat;
      if (!params.advTimeDisplayFormat) params.advTimeDisplayFormat = defaults.advTimeDisplayFormat;

      params.debug = $localStorage.Dashboard.debug;
      if (!params.debug) params.debug = defaults.debug;

      return params;
    }

    dashboard.getSensors = function() {
      // $q is angulars implementation of Promises (async function call handlers), it is supported by IE where as Promises are not,
      // so $q is used thoughout the app
      return $q(function(resolve, reject) {
        // Use 64bit encryption to avoid errors in Cache Routing
        var uri = '/api/dashboard/v3/Sensors?encryption=base64';

        $http({
          method: 'GET',
          url: uri
        }).then(function successCallback(resp) { // successful request and server job callback
            var data;
            if (resp.status === 200) { // 200 is sucess code (with data), get data from respose to return
              data = resp.data;
            } else if (resp.status === 204) { // 204 is sucess code (without data), return empty array
              data = [];
              if (dashboard.meta.debug.rest) {
                $log.warn('No sensors were found on the server');
              }
            } else { // some other code or the functionality above is broken.
              data = [];
              $log.warn('The server was successful, but something went wrong.');
            }
            resolve(data);
          }, function errorCallback(resp) { // unsuccessful request and server job callback
            var data = [];
            if (dashboard.meta.debug.rest) { // server returns an error object. Print it if debug is true
              $log.error(resp.data);
            }
            reject(data);
          });
      });
    };
    dashboard.getSensor = function(namespace, sensor, item) {
      return $q(function(resolve, reject) {
        // Use 64bit encryption, btoa(), to avoid errors in Cache Routing
        var uri = '/api/dashboard/v3/Sensors/' + btoa(sensor) + '/Items/' + btoa(item) + '?namespace=' + btoa(namespace) + '&encryption=base64';

        $http({
          method: 'GET',
          url: uri
        }).then(function successCallback(resp) {
            // If the server responds with success (200) then pass data back
            var data;
            if (resp.status === 200) {
              data = resp.data;
            } else if (resp.status === 204) {
              data = {};
              if (dashboard.meta.debug.rest) {
                $log.warn('The sensor "[' + namespace + '] ' + sensor + ', ' + item + '" was not found on the server');
              }
            } else {
              data = {};
              $log.warn('The server was successful, but something went wrong.');
            }
            resolve(data);
          }, function errorCallback(resp) {
            var data = {};
            if (dashboard.meta.debug.rest) {
              $log.error(resp.data);
            }

            reject(data);
          });
      });
    };

    dashboard.getChartData = function(namespace, sensor, item, startTime, readingInterval) {
      return $q(function(resolve, reject) {
        // If no start time is defined get the whole chart period of data
        if (!startTime) startTime = dashboard.getStartTime(dashboard.meta.chartWindow, readingInterval);
        // If start time is -1 then only get the newest data
        if (startTime === -1) startTime = dashboard.getStartTime(0, readingInterval);
        // default to the defined amount of seconds per sample interval
        var samplePeriod = dashboard.meta.samplePeriod;
        // if the reading interval is selected, then samplePeriod = 0, thus use the sensors reading interval
        if (samplePeriod === '0') samplePeriod = readingInterval;

        // Use 64bit encryption to avoid errors in Cache Routing
        var uri = '/api/dashboard/v3/Sensors/' + btoa(sensor) + '/ChartData/' + btoa(item) + '?namespace=' + btoa(namespace) + '&samplePeriod=' + btoa(samplePeriod) + '&startTime=' + btoa(startTime) + '&encryption=base64';

        $http({
          method: 'GET',
          url: uri
        }).then(function successCallback(resp) {
            var data;
            if (resp.status === 200) {
              data = resp.data;
            } else if (resp.status === 204) {
              data = [];
              if (dashboard.meta.debug.rest) {
                $log.warn('No chart data was found on the server for "[' + namespace + '] ' + sensor + ', ' + item + '"');
              }
            } else {
              data = [];
              $log.warn('The server was successful, but something went wrong.');
            }

            resolve(data);
          }, function errorCallback(resp, status) {
            var data = {data: []};
            if (dashboard.meta.debug.rest) {
              $log.error(resp.data);
            }

            reject(data);
          });
      });
    };

    dashboard.getCalculatedData = function(namespace, sensor, item, startTime, readingInterval) {
      return $q(function(resolve, reject) {
        if (startTime === null) startTime = undefined;
        // If no start time is defined get the whole chart period of data
        if (!startTime) startTime = dashboard.getStartTime(dashboard.meta.chartWindow, readingInterval);
        // If start time is -1 then only get the newest data
        if (startTime === -1) startTime = dashboard.getStartTime(0, readingInterval);

        // Use 64bit encryption to avoid errors in Cache Routing
        var uri = '/api/dashboard/v3/Sensors/' + btoa(sensor) + '/CalculatedData/' + btoa(item) + '?namespace=' + btoa(namespace) + '&startTime=' + btoa(startTime) + '&encryption=base64';
        $http({
          method: 'GET',
          url: uri
        }).then(function successCallback(resp) {
            var data;
            if (resp.status === 200) {
              data = resp.data;
            } else if (resp.status === 204) {
              data = {};
              if (dashboard.meta.debug.rest) {
                $log.warn('No calcuated data was found on the server for "[' + namespace + '] ' + sensor + ', ' + item + '"');
              }
            } else {
              data = {};
              $log.warn('The server was successful, but something went wrong.');
            }

            resolve(data);
          }, function errorCallback(resp, status) {
            var data = {};
            if (dashboard.meta.debug.rest) {
              $log.error(resp.data);
            }

            reject(data);
          });
      });
    };

    // returns the start time for the data returned by the server,
    // subtracts a number of seconds from the current time
    dashboard.getStartTime = function(windowInSeconds, readingInterval) {
      // the interval is the number of seconds between each chart data point (defined by the dashboard api)
      // however, if System Interval is selected, then use the number of seconds between each reading (defined by the backend)
      var interval;
      if (dashboard.meta.samplePeriod === '0' && windowInSeconds === 0) {
        interval = readingInterval;
      } else {
        interval = parseInt(dashboard.meta.samplePeriod);
      }
      // adding 2 sample intervals pushes the start time back past the desired window enough so points can be averaged up to the end of the chart period
      // in reality this shows more than the chart period but the graphs plot based on the newest time so a couple sample intervals of older data need
      // to be averaged to make it look like a whole chart period on the chart.
      var fillChartWindow = parseInt(windowInSeconds) + interval;
      return $filter('toTS')(moment.utc().subtract(fillChartWindow, 'seconds'));
    };
    dashboard.subscribe = function(scope, callback) {
      var handler = $rootScope.$on('dashboardApiTick', function(event, args) {callback(args);});
      scope.$on('destroy', handler);
    };
    dashboard.notify = function(args) {
      $rootScope.$emit('dashboardApiTick', args);
    };
    return dashboard;
  }]);
})();
