(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('sensorRowCtrl', ['$scope', '$mdMedia', function($scope, $mdMedia) {
    var _this = this;

    _this.bigScreen = false;
    $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(big) {
      _this.bigScreen = big;
    });

  }]);
})();
