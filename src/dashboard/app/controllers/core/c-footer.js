/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var core = angular.module('core');

  core.controller('footerCtrl', ['$scope', function($scope) {
    var _this = this;

    _this.links = [
      {
        display: 'GitHub',
        url: 'https://github.com/intersystems/Polymetric-Dashboard'
      },
      {
        display: 'Documentation',
        url: 'http://docs.intersystems.com/documentation/GPD/GPD.html'
      },
      {
        display: 'Tutorial',
        url: 'http://docs.intersystems.com/documentation/GPD/GPD.html#GPD_user_defined_sensors'
      },
      {
        display: 'Management Portal',
        url: '/csp/sys/%25CSP.Portal.Home.zen'
      }
    ];
  }]);
})();
