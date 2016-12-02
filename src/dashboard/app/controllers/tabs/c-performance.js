/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('performanceCtrl', ['$rootScope', '$scope', '$q', '$timeout', '$compile', 'dashboard', function($rootScope, $scope, $q, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [
      {
        'id': 'performance-lroutref',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'RtnCallLocalPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Local Routine References'}
        }
      },
      {
        'id': 'performance-globupdates',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'GloUpdatePerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Global Sets and Kills'}
        }
      },
      {
        'id': 'performance-lofrec',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'LogReadsPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Logical Requests'}
        }
      },
      {
        'id': 'performance-dreads',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'PhysReadsPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Disk Reads'}
        }
      },
      {
        'id': 'performance-dwrites',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'PhysWritesPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Disk Writes'}
        }
      }
    ];

    init();
    function init() {
      createGrid()
        .then(function(grid) {
          createWidgets(grid);
        });
    }

    function createGrid() {
      return $q(function(resolve, reject) {
        // create the grid
        $('.performance-stack').gridstack({
          cellHeight: '48px',
          verticalMargin: 20,
          animate: true
        });
        resolve($('.performance-stack').data('gridstack'));
      });
    }

    function createWidgets(grid) {
      for (var i = 0; i < _this.widgets.length; i++) {
        var html = '<div><div flex="100" class="grid-stack-item-content hideOverflow" md-whiteframe="1"><smp-static-widget data="performance.widgets[' + i + ']"></smp-static-widget></div></div>';
        var el = $compile(html)($scope);

        // put the widget on the grid
        // addWidget(el, x, y, width, height, autoPos, minWidth, maxWidth, minHeight, maxHeight)
        grid.addWidget(el, _this.widgets[i].x, _this.widgets[i].y, 6, 3, true, 4, 12, 3, 3);
      }
    }

    // the tabs themselves are a midway point for the update call
    // this allows only the viz tools that are shown to be updated (reducing lag)
    dashboard.subscribe($scope, update); // subscribe to the dashboard update call

    // intercept the broadcast, and only update the data if currently selected tab.
    var clearData = false;
    function update(args) {
      clearData = clearData || args.clearData;
      if ($rootScope.curTab === 'performance') {
        $scope.$broadcast('updateData', {'clearData': clearData});
        clearData = false;
      }
    }
  }]);
})();
