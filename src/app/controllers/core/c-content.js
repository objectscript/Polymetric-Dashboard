(function() {
  'use strict';

  var core = angular.module('core');

  core.controller('contentCtrl', ['$scope', '$localStorage', '$timeout', '$window', '$mdDialog', 'dashboard', function($scope, $localStorage, $timeout, $window, $mdDialog, dashboard) {
    // !!! ARRAY TO HOLD ALL OF THE TABS (the reference to their directives) !!!
    // this allows for much easier tracking of their index and if they are shown or not
    $scope.tabs = [
      {id: 'summary', title: 'Summary', content: '<smp-summary ng-if="$index === content.selectedIndex"></smp-summary>', width: 80},
      {id: 'performance', title: 'Performance', content: '<smp-performance ng-if="$index === content.selectedIndex"></smp-performance>', width: 80},
      {id: 'ecp', title: 'ECP', content: '<smp-ecp ng-if="$index === content.selectedIndex"></smp-ecp>', width: 80},
      {id: 'allsensors', title: 'All Sensors', content: '<smp-allsensors ng-if="$index === content.selectedIndex"></smp-allsensors>', width: 80},
      {id: 'playground', title: 'Playground', content: '<smp-playground ng-if="$index === content.selectedIndex"></smp-playground>', width: 80},
      {id: 'showcase', title: 'Showcase', content: '<smp-showcase ng-if="$index === content.selectedIndex"></smp-showcase>', width: 100},
    ];

    this.selectedIndex = initContent();
    function initContent() {
      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};

      // get the saved tab
      var tab = $localStorage.Dashboard.tab;
      if (!tab) tab = 0;

      return tab;
    }

    // on tab changes
    this.selectedIndexChange = function(index) {
      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};

      // save the tab
      $localStorage.Dashboard.tab = index;

      // update the data for the new tab
      dashboard.updateData({clearData: false});
      // update the data for the new tab
      dashboard.updateData({clearData: false});
      $timeout(function() {
        // update the charts so they are interactive again
        dashboard.updateChart();
      }, 0);

      this.toggleFabs();
    };

    // show/hide specific tabs FABs
    // this is necessary because they are removed from their
    // initial dom positon and placed in the body (to make them fixed)
    // but it causes a few issues with scope thus i need to manually toggle them
    this.toggleFabs = function() {
      if (!this.isTab('showcase')) {
        $('#showcaseSideNav').hide();
      } else {
        $('#showcaseSideNav').show();
      }

      if (!this.isTab('playground')) {
        $('#playgroundFAB').hide();
      } else {
        $('#playgroundFAB').show();
      }
    };

    // test for what the current tab is
    this.isTab = function(tab) {
      return $scope.tabs[this.selectedIndex].id === tab;
    };

    // Setting Dialog
    $scope.showSettingsDialog = function(ev) {
      $mdDialog.show({
        controller: 'settingsDialogCtrl as settings',
        templateUrl: 'app/templates/core/t-settingsDialog.html',
        parent: angular.element(document.getElementById('SMPDashbaord')),
        targetEvent: ev,
        clickOutsideToClose: false,
      });
    };

  }]);
})();
