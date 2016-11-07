(function() {
  'use strict';

  var dialog = angular.module('overlay');

  dialog.controller('settingsDialogCtrl', ['$scope', '$mdDialog', '$filter', '$localStorage', '$timeout', 'dashboard', function($scope, $mdDialog, $filter, $localStorage, $timeout, dashboard) {

    $scope.validateSamplePeriod = validateSamplePeriod;
    $scope.error = undefined;

    $scope.applyChanges = function() {
      // $scope.error = undefined;
      // update the settings, (test if there were updates)
      var updateData;
      updateData = applyChartProperties() || updateData;
      if (!$scope.error) updateData = applyAdvancedSettings() || updateData;

      // if there are updates broadcast the event
      if ($scope.error) {
        angular.element($($scope.error.item)).triggerHandler('click');
      } else {
        if (updateData) dashboard.notify({clearData: true});
        $scope.closeDialog();
      }
    };

    /* --------------------------------------------------------------------------------------------- */
    /* ----------------------------------CHART SETTINGS--------------------------------------------- */
    /* --------------------------------------------------------------------------------------------- */
    $scope.chartWindows = dashboard.meta.chartWindows;
    $scope.samplePeriods = dashboard.meta.samplePeriods;
    $scope.chartWindow = dashboard.meta.chartWindow;
    $scope.samplePeriod = dashboard.meta.samplePeriod;

    function applyChartProperties() {
      var updateData = false;

      if (validateSamplePeriod()) {
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
      }

      return updateData;
    }

    function validateSamplePeriod() {
      var valid = false;
      if (parseInt($scope.chartWindow) > parseInt($scope.samplePeriod)) {
        $scope.error = undefined;
        valid = true;
      } else {
        $scope.error = {
          'type': 'samplePeriod',
          'msg': 'Please select a valid sample period.',
          'item': '#samplePeriodSelect'
        };
      }

      return valid;
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
    $scope.getTZ = timezoneSearch;
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
          $scope.newTZ = tz;
        }
        if ($scope.searchTimezone) {
          $scope.newTZ = tz;
        }
      }
    }

    function loadAll() {
      // return the name of all possible timezones
      return moment.tz.names();
    }

    /* --------------------------------------------------------------------------------------------- */
    /* ---------------------------------TIME FORMATTING--------------------------------------------- */
    /* --------------------------------------------------------------------------------------------- */
    $scope.updateTimeFormat = updateTimeFormat;

    $scope.formatString = dashboard.meta.timeDisplayFormat;
    $scope.militaryTime = $scope.formatString.indexOf('H') !== -1;
    $scope.showSeconds = $scope.formatString.indexOf('s') !== -1 || $scope.formatString.indexOf('S') !== -1;

    $scope.useAdv = dashboard.meta.useAdvancedFormat;
    $scope.advFormatString = dashboard.meta.advTimeDisplayFormat;

    function updateTimeFormat(type) {
      switch (type) {
        case 'hours':
          if ($scope.militaryTime) {
            $scope.formatString = $scope.formatString.replace('h', 'H');
            $scope.formatString = $scope.formatString.replace('a', '');
          } else {
            $scope.formatString = $scope.formatString.replace('H', 'h');
            $scope.formatString = $scope.formatString + 'a';
          }
          break;
        case 'seconds':
          if ($scope.showSeconds) {
            $scope.formatString = $scope.formatString.replace('mm', 'mm:ss');
          } else {
            $scope.formatString = $scope.formatString.replace(':ss', '');
          }
          break;
      }
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

      if ($scope.newTZ && timezones.indexOf($scope.newTZ) !== -1) {
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

      if (dashboard.meta.timeDisplayFormat !== $scope.formatString) {
        dashboard.meta.timeDisplayFormat = $scope.formatString;

        // if the localstorage object has not be initialized, do so
        if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
        // Update localStorage to remember the user set timezone
        $localStorage.Dashboard.timeDisplayFormat = $scope.formatString;

        // if the basic format string is the one being used then update the displayed times on the app
        if (!$scope.useAdv) updateData = true;
      }

      if (dashboard.meta.advTimeDisplayFormat !== $scope.advFormatString) {
        dashboard.meta.advTimeDisplayFormat = $scope.advFormatString;

        // if the localstorage object has not be initialized, do so
        if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
        // Update localStorage to remember the user set timezone
        $localStorage.Dashboard.advTimeDisplayFormat = $scope.advFormatString;

        // if the advanced format string is the one being used then update the displayed times on the app
        if ($scope.useAdv) updateData = true;
      }

      if (dashboard.meta.useAdvancedFormat !== $scope.useAdv) {
        dashboard.meta.useAdvancedFormat = $scope.useAdv;

        // if the localstorage object has not be initialized, do so
        if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
        // Update localStorage to remember the user set timezone
        $localStorage.Dashboard.useAdvancedFormat = $scope.useAdv;

        // if the advanced and basic formats are different update the diaplayed times on the tapp
        if (dashboard.meta.timeDisplayFormat !== dashboard.meta.advTimeDisplayFormat) updateData = true;
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
