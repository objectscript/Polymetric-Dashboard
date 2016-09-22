(function() {
  'use strict';

  var app = angular.module('dashboardApi', []);

  /*  Holds all the sensor information */
  app.factory('dashboard', ['$rootScope', '$http', '$q', '$log', '$filter', '$interval', '$localStorage', function($rootScope, $http, $q, $log, $filter, $interval, $localStorage) {
    var dashboard = {};

    // sets up the properties needed for the dashboard
    dashboard.meta = initDashboardProperties();
    function initDashboardProperties() {

      var defaults = {
        chartWindow: moment.duration(1, 'hour').as('seconds'),
        samplePeriod: moment.duration(1, 'minute').as('seconds'), // 1 minute
        timezone: moment.tz.guess(), // method to call if no timezone was set (it guesses where the user is)
        debug: {
          rest: false
        },
      };

      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};

      // pull saved params from local storage, otherwise use the defaults
      var params = {
        // for readability I use moment's duration objects here to
        // define the available chart windows and sample periods.
        // the .as('seconds') call will return an integer value of seconds,
        // allowing for easy comparison and sorting of the values
        chartWindows: [// available chart window options
          moment.duration(1, 'hour').as('seconds'),
          moment.duration(2, 'hours').as('seconds'),
          moment.duration(6, 'hours').as('seconds'),
          moment.duration(12, 'hours').as('seconds'),
          moment.duration(1, 'day').as('seconds'),
          moment.duration(2, 'days').as('seconds'),
          moment.duration(3, 'days').as('seconds'),
          moment.duration(4, 'days').as('seconds')
        ],
        samplePeriods: [// available sample period options
          moment.duration(1, 'minute').as('seconds'),
          moment.duration(5, 'minute').as('seconds'),
          moment.duration(15, 'minute').as('seconds'),
          moment.duration(30, 'minute').as('seconds'),
          moment.duration(1, 'hour').as('seconds'),
          moment.duration(2, 'hours').as('seconds'),
          moment.duration(6, 'hours').as('seconds'),
          moment.duration(12, 'hours').as('seconds'),
          moment.duration(1, 'day').as('seconds')
        ]
      };
      params.samplePeriod = $localStorage.Dashboard.samplePeriod;
      if (!params.samplePeriod) params.samplePeriod = defaults.samplePeriod;

      params.chartWindow = $localStorage.Dashboard.chartWindow;
      if (!params.chartWindow) params.chartWindow = defaults.chartWindow;

      params.timezone = $localStorage.Dashboard.timezone;
      if (!params.timezone) params.timezone = defaults.timezone;

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

    dashboard.getChartData = function(namespace, sensor, item, startTime) {
      return $q(function(resolve, reject) {
        // If no start time is defined get the whole chart window of data
        if (!startTime) startTime = dashboard.getStartTime(dashboard.meta.chartWindow);
        // If start time is -1 then only get the newest data
        if (startTime === -1) startTime = dashboard.getStartTime(0);
        var samplePeriod = dashboard.meta.samplePeriod;

        // Use 64bit encryption to avoid errors in Cache Routing
        var uri = '/api/dashboard/v3/Sensors/' + btoa(sensor) + '/ChartData/' + btoa(item) + '?namespace=' +  btoa(namespace) + '&samplePeriod=' + btoa(samplePeriod) + '&startTime=' + btoa(startTime) + '&encryption=base64'; //

        $http({
          method: 'GET',
          url: uri,
        }).then(function successCallback(resp) {
            var data;
            if (resp.status === 200) {
              data = resp.data;
            } else if (resp.status === 204) {
              data = {data: []};
              if (dashboard.meta.debug.rest) {
                $log.warn('No chart data was found on the server for "[' + namespace + '] ' + sensor + ', ' + item + '"');
              }
            } else {
              data = {data: []};
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

    dashboard.getCalculatedData = function(namespace, sensor, item, startTime) {
      return $q(function(resolve, reject) {
        // If no start time is defined get the whole chart window of data
        if (!startTime) startTime = dashboard.getStartTime(dashboard.meta.chartWindow);
        // If start time is -1 then only get the newest data
        if (startTime === -1) startTime = dashboard.getStartTime(0);

        // Use 64bit encryption to avoid errors in Cache Routing
        var uri = '/api/dashboard/v3/Sensors/' + btoa(sensor) + '/CalculatedData/' + btoa(item) + '?namespace=' + btoa(namespace) + '&startTime=' + btoa(startTime) + '&encryption=base64'; //
        $http({
          method: 'GET',
          url: uri,
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
    dashboard.getStartTime = function(windowInSeconds) {
      // adding 2 sample periods pushes the start time back past the desired window enough so points can be averaged up to the end of the chart window
      // in reality this shows more than the chart window but the graphs plot based on the newest time so a couple sample periods of older data need
      // to be averaged to make it look like a whole chart window on the chart.
      var fillChartWindow = windowInSeconds + dashboard.meta.samplePeriod * 2;
      return $filter('toTS')(moment.utc().subtract(fillChartWindow, 'seconds'));
    };

    // a clock that runs every 30 seconds to broadcast the update call for all visualizations
    // the visualizations themselves have functionality to see if they need data or not
    autoUpdate();
    function autoUpdate() {
      dashboard.meta.updateClock = $interval(function() {
        dashboard.updateData({clearData: false});
      }, 30000);
    }

    // the actual broadcast (this is angular functionality)
    dashboard.updateData = function(args) {
      $rootScope.$broadcast('updateDashboardData', args);
    };
    // another broadcast use to update the charts demensions (does not change data or make rest calls)
    dashboard.updateChart = function() {
      $rootScope.$broadcast('updateChartSize');
    };
    return dashboard;
  }]);
})();
