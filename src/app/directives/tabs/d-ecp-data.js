(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpEcpData', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-ecp-data.html',
        controller: 'ecpDataCtrl as ecpData'
      };
    });
})();
