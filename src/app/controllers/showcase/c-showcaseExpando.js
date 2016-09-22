/*jshint esnext: true */
(function() {
  'use strict';

  var viz = angular.module('showcase');

  viz.controller('showcaseExpandoCtrl', ['$scope', '$compile', function($scope, $compile) {
    var _this = this;

    // Epando Functionality
    _this.expandoOptions = {
      'expando': {
        'Description': 'A custom angular element directive that has functionality to show and hide its contents by expanding and contracting, the amount of toggles is recorded and made available as $scope.toggles. Must have both an smp-expando-toggle and smp-expando-content directive as its children.',
        'Required': [
          {attr: 'open', type: 'Boolean', desc: 'If the smp-expando will be open or closed initially.', default: 'N/A'},
          {attr: 'target', type: 'String', desc: 'The element that will be expanded and collapsed.', default: 'N/A'},
        ],
        'Optional': [
          {attr: 'elevation', type: 'Integer', desc: 'Describes what level shadow the smp-expando will cast [ 0 ... 12 ].', default: '0'},
        ]
      },
      'smp-expando-toggle': {
        'Description': 'A custom angular attribute directive that has functionality to toggle the shown status of the smp-expando-content.',
        'Required': [
          {attr: 'smp-expando-toggle', type: 'Attribute', desc: 'Binds necessary functionality to the div that allows the toggling of the smp-expando-contents shown status.', default: 'N/A'},
        ],
        'Optional': []
      },
      'smp-expando-content': {
        'Description': 'A custom angular attribute directive that has functionality to expand and contract to show and hide its contents.',
        'Required': [
          {attr: 'smp-expando-content', type: 'Attribute', desc: 'Binds necessary functionality to the div that allows it to show and hide its contents. Additionally identifies itself uniquely so the smp-expando-toggle can trigger the expand shrink functionality appropriately.', default: 'N/A'},
        ],
        'Optional': []
      }
    };
  }]);
})();
