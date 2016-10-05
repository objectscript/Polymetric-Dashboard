(function() {
  'use strict';

  var dialog = angular.module('overlay');

  dialog.controller('settingsDialogCtrl', ['$scope', '$mdDialog', '$filter', '$localStorage', 'dashboard', function($scope, $mdDialog, $filter, $localStorage, dashboard) {
    $scope.applyChanges = function() {
      // update the settings, (test if there were updates)
      var updateData;
      updateData = applyChartProperties() || updateData;
      updateData = applyAdvancedSettings() || updateData;

      // if there are updates broadcast the event
      if (updateData) dashboard.notify({clearData: true});

      $scope.closeDialog();
    };

    /* --------------------------------------------------------------------------------------------- */
    /* ----------------------------------CHART SETTINGS--------------------------------------------- */
    /* --------------------------------------------------------------------------------------------- */
    $scope.chartWindows = dashboard.meta.chartWindows;
    $scope.samplePeriods = dashboard.meta.samplePeriods;
    $scope.chartWindow = dashboard.meta.chartWindow;
    $scope.samplePeriod = dashboard.meta.samplePeriod;

    // extracts a reasonable subset of the available sample intervals.
    // this is done because having a minute sample interval for a 30 day chart period
    // does not preform well and gives way to much information than is really visible.
    // Additionally having a larger sample intervals than chart period would just be silly.
    $scope.getAvailableSamplePeriods = function() {
      var availSP = [];
      var minLim;
      var maxLim;
      // set the sample interval limits based on the chart period
      switch (true) {
        // if the chart period is below 12 hours sample intervals 1 minute -> 30 minutes
        case ($scope.chartWindow <= moment.duration(12, 'hours').as('seconds')):
          minLim = moment.duration(1, 'minute').as('seconds');
          maxLim = moment.duration(30, 'minutes').as('seconds');
          break;
        // if the chart period is below 4 hours sample intervals 30 minutes -> 6 hourss
        case ($scope.chartWindow <= moment.duration(4, 'days').as('seconds')):
          minLim = moment.duration(30, 'minutes').as('seconds');
          maxLim = moment.duration(6, 'hours').as('seconds');
          break;
        //else the sample intervals 6 hours -> 1 day
        default:
          minLim = moment.duration(6, 'hours').as('seconds');
          maxLim = moment.duration(1, 'day').as('seconds');
      }

      // extract the sample intervals that are inside the limits set above
      for (var i = 0; i < $scope.samplePeriods.length; i++) {
        if ($scope.samplePeriods[i].val >= minLim && $scope.samplePeriods[i].val <= maxLim) {
          availSP.push($scope.samplePeriods[i]);
        }
      }

      // if the current sample interval is less than the available minimum set it to the avail min
      if ($scope.samplePeriod < availSP[0].val) {
        $scope.samplePeriod = availSP[0].val;
      // else if the current sample interval is greater than the available maximum set it to the avail max
      } else if ($scope.samplePeriod > availSP[availSP.length - 1]) {
        $scope.samplePeriod = availSP[availSP.length - 1];
      }
      return availSP;
    };

    // get the avaiblable sample intervals for the current chart window
    $scope.updateAvailableSamplePeriods = function() {
      $scope.availableSamplePeriods = $scope.getAvailableSamplePeriods();
    };
    $scope.updateAvailableSamplePeriods();

    function applyChartProperties() {
      var updateData = false;

      if ($scope.samplePeriod !== dashboard.meta.samplePeriod) {
        // update the dashboard param
        dashboard.meta.samplePeriod = $scope.samplePeriod;
        updateData = true;

        // if the localstorage object has not be initialized, do so
        if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
        // Update localStorage to remember the current sample interval
        $localStorage.Dashboard.samplePeriod = $scope.samplePeriod;
      }
      if ($scope.chartWindow !== dashboard.meta.chartWindow) {
        // update the dashboard param
        dashboard.meta.chartWindow = $scope.chartWindow;
        updateData = true;

        // if the localstorage object has not be initialized, do so
        if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
        // Update localStorage to remember the current sample interval
        $localStorage.Dashboard.chartWindow = $scope.chartWindow;
      }

      return updateData;
    }

    /* --------------------------------------------------------------------------------------------- */
    /* -------------------------------------TIMEZONE------------------------------------------------ */
    /* --------------------------------------------------------------------------------------------- */

    // load all timezones
    var timezones = loadAll();
    // a place to store all the results of the users search
    var results;
    // get current timezone
    $scope.selectedTimezone = dashboard.meta.timezone;
    // add to the scope the functions used in the search
    $scope.getTZ   = timezoneSearch;
    $scope.selectedTimezoneChange = timezoneChange;

    function timezoneSearch(query) {
      // filter the timezones or return the whole set if no query is present
      results = query ? timezones.filter(createFilterFor(query)) : timezones;

      return results;
    }

    function createFilterFor(query) {
      // lowercase so case insensitive
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(tz) {
        var lowerTZ = angular.lowercase(tz);
        // if any substring of the timezone matches return it
        return (lowerTZ.indexOf(lowercaseQuery) !== -1);
      };
    }

    // handles the form submit (hitting enter, clicking a result)
    // sets the selected timezone appropriately
    function timezoneChange(tz, event) {
      $scope.newTZ = undefined;
      if (results) {
        if (event && event.type === 'submit') {
          tz = results[0];
          $scope.searchTimezone = tz;
        }
        if ($scope.searchTimezone) {
          $scope.searchTimezone = tz;
          $scope.newTZ = tz;
        }
      }
    }

    function loadAll() {
      // return the name of all possible timezones
      return moment.tz.names();
    }

    /* --------------------------------------------------------------------------------------------- */
    /* --------------------------------------DEBUG-------------------------------------------------- */
    /* --------------------------------------------------------------------------------------------- */

    // object to hold all possible debug flags
    $scope.debug = {
      'rest': dashboard.meta.debug.rest
    };

    // toggles an element of the debug object as to keep the type boolean
    $scope.toggleDebug = function(type) {
      $scope.debug[type] = !$scope.debug[type];
    };

    function applyAdvancedSettings() {
      var updateData = false;

      // update the debug status of the dashboard and store in localStorage
      dashboard.meta.debug = $scope.debug;

      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
      $localStorage.Dashboard.debug = $scope.debug;

      if ($scope.newTZ) {
        // if the timezone was changed
        if (dashboard.meta.timezone !== $scope.newTZ) {
          dashboard.meta.timezone = $scope.newTZ;

          // if the localstorage object has not be initialized, do so
          if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
          // Update localStorage to remember the user set timezone
          $localStorage.Dashboard.timezone = $scope.newTZ;

          updateData = true;
        }
      }

      return updateData;
    }

    /* --------------------------------------------------------------------------------------------- */
    /* -----------------------------------MODAL FUNCTS---------------------------------------------- */
    /* --------------------------------------------------------------------------------------------- */

    $scope.closeDialog = function() {
      $mdDialog.cancel();
    };

  }]);
})();
