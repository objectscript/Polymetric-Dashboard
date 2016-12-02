/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('showcaseCtrl', ['$rootScope', '$scope', '$filter', '$timeout', '$localStorage', '$element', '$mdSidenav', '$mdMedia', 'dashboard', function($rootScope, $scope, $filter, $timeout, $localStorage, $element, $mdSidenav, $mdMedia, dashboard) {
    var _this = this;

    // store one sensors data globally for all showcase sections so they will show the user selected sensor automatically
    _this.activeSensor = {namespace: '%SYS', sensor: 'CPUusage', item: '-', unit: '%'};

    // calls the dashboardApi to get all the sensors
    _this.sensors = {};
    dashboard.getSensors()
      .then(function(data) {
        respHandler(data);
      });

    // takes the returned array of sensor objects and builds a heirachical structure
    function respHandler(data) {
      if (data) {
        var sensors = {};

        var namespace; var sensor; var item; var units;
        for (var i = 0; i < data.length; i++) {
          namespace = data[i].namespace;
          sensor = data[i].sensor;
          item = data[i].item;
          units = data[i].units;

          if (!sensors[namespace]) {
            sensors[namespace] = {};
          }
          if (!sensors[namespace][sensor]) {
            sensors[namespace][sensor] = {};
            sensors[namespace][sensor] = {
              'units': units,
              'items': []
            };
          }
          sensors[namespace][sensor].items.push(item);
        }

        _this.sensors = sensors;
      }
    }

    // SHOWCASE SUBNAVIGATION
    // if the localstorage object has not be initialized, do so
    if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
    // pull data from local storage if exists, otherwise go with defaults
    _this.curShowcaseSection = $localStorage.Dashboard.showcaseSection ? $localStorage.Dashboard.showcaseSection : 'Line';
    _this.open = $mdMedia('gt-sm');

    _this.goToSection = function(section) {
      _this.curShowcaseSection = section;

      _this.toggleSidenav();

      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};
      $localStorage.Dashboard.showcaseSection = this.curShowcaseSection; // store current section in localstorage
    };

    _this.isSidenavOpen = function() {
      return _this.open;
    };

    _this.toggleSidenav = function() {
      $mdSidenav('showcaseSidenav').toggle();
      _this.open = !_this.open;
    };

    // the tabs themselves are a midway point for the update call
    // this allows only the viz tools that are shown to be updated (reducing lag)
    dashboard.subscribe($scope, update); // subscribe to the dashboard update call

    // intercept the broadcast, and only update the data if currently selected tab.
    var clearData = false;
    function update(args) {
      clearData = clearData || args.clearData;
      if ($rootScope.curTab === 'showcase') {
        $scope.$broadcast('updateData', {'clearData': clearData});
        clearData = false;
      }
    }
  }]);

})();
