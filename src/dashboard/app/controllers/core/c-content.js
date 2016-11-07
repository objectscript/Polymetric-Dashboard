(function() {
  'use strict';

  var core = angular.module('core');

  core.controller('contentCtrl', ['$rootScope', '$scope', '$localStorage', '$mdDialog', 'dashboard', function($rootScope, $scope, $localStorage, $mdDialog, dashboard) {
    var _this = this;

    _this.setTab = setSelectedTab;

    // !!! ARRAY TO HOLD ALL OF THE TABS (the reference to their directives) !!!
    // this allows for much easier tracking of their index and if they are shown or not
    _this.tabs = [
      {id: 'summary', title: 'Summary', content: '<smp-summary></smp-summary>', width: 80},
      {id: 'performance', title: 'Performance', content: '<smp-performance></smp-performance>', width: 80},
      {id: 'ecp', title: 'ECP', content: '<smp-ecp></smp-ecp>', width: 80},
      {id: 'allsensors', title: 'All Sensors', content: '<smp-allsensors></smp-allsensors>', width: 80},
      {id: 'playground', title: 'Playground', content: '<smp-playground></smp-playground>', width: 80},
      {id: 'showcase', title: 'Showcase', content: '<smp-showcase></smp-showcase>', width: 100}
    ];
    // default to the first tab
    _this.curTabIdx = 0;
    // keep the tab id in the rootscope so all elements can test what tab it is
    $rootScope.curTab = _this.tabs[_this.curTabIdx].id;

    initContent();
    function initContent() {
      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};

      // get the saved tab
      var tab = $localStorage.Dashboard.tab;
      if (tab) {
        if (_this.tabs[tab]) {
          _this.curTabIdx = tab;
          $rootScope.curTab = _this.tabs[_this.curTabIdx].id;
        } else {
          _this.curTabIdx = 0;
          $rootScope.curTab = _this.tabs[_this.curTabIdx].id;
        }
      }
    }

    // on tab changes
    function setSelectedTab(index) {
      _this.curTabIdx = index;
      $rootScope.curTab = _this.tabs[_this.curTabIdx].id;

      // if the localstorage object has not be initialized, do so
      if (!angular.isObject($localStorage.Dashboard)) $localStorage.Dashboard = {};

      // save the tab
      $localStorage.Dashboard.tab = index;

      // notify registered components to update data if they need to
      dashboard.notify({clearData: false});
    }

    // Setting Dialog
    $scope.showSettingsDialog = function(ev) {
      $mdDialog.show({
        controller: 'settingsDialogCtrl as settings',
        templateUrl: 'app/templates/core/t-settingsDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      });
    };

  }]);
})();
