(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.directive('smpEcpApp', function() {
      return {
        restrict: 'E',
        templateUrl: 'app/templates/tabs/t-ecp-app.html',
        controller: 'ecpAppCtrl as ecpApp'
      };
    });
})();
