(function() {

  'use strict';
  var tab = angular.module('tabs');

  tab.controller('summaryCtrl', ['$rootScope', '$scope', '$q', '$timeout', '$compile', 'dashboard', function($rootScope, $scope, $q, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [
      {
        'id': 'sumary-cpu',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'CPUusage',
          'item': '-',
          'unit': '%',
          'advanced': {'title': 'CPU Usage'}
        }
      },
      {
        'id': 'sumary-locktable',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'SMHPercentFull',
          'item': 'Lock Table',
          'unit': '%',
          'advanced': {'title': 'SMH Used: Lock Table'}
        }
      },
      {
        'id': 'sumary-cacheefficiency',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'CacheEfficiency',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Cache Efficiency'}
        }
      },
      {
        'id': 'sumary-gloref',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'GloRefPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Global References Per Second'}
        }
      },
      {
        'id': 'sumary-licenseuse',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'LicensePercentUsed',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Percent of Licenses Used'}
        }
      },
      {
        'id': 'sumary-proccount',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ProcessCount',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Number of Active Processes'}
        }
      },
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
        $('.summary-stack').gridstack({
          cellHeight: '48px',
          verticalMargin: 20,
          animate: true,
        });
        resolve($('.summary-stack').data('gridstack'));
      });
    }

    function createWidgets(grid) {
      for (var i = 0; i < _this.widgets.length; i++) {
        var html = '<div><div flex="100" class="grid-stack-item-content hideOverflow" md-whiteframe="1"><smp-static-widget data="summary.widgets[' + i + ']"></smp-static-widget></div></div>';
        var el = $compile(html)($scope);

        // put the widget on the grid
        // addWidget(el, x, y, width, height, autoPos, minWidth, maxWidth, minHeight, maxHeight)
        grid.addWidget(el,  _this.widgets[i].x,  _this.widgets[i].y,  6, 3, true, 4, 12, 3, 3);
      }
    }

    // the tabs themselves are a midway point for the update call
    // this allows only the viz tools that are shown to be updated (reducing lag)
    dashboard.subscribe($scope, update); // subscribe to the dashboard update call
    $scope.$on('renderComplete', function(event, args) {update(args);}); // when visualization tool held in the tab are done rendering they emit this so they will be populated

    // intercept the broadcast, and only update the data if currently selected tab.
    var clearData = false;
    function update(args) {
      clearData = clearData || args.clearData;
      if ($rootScope.curTab === 'summary') {
        $scope.$broadcast('updateData', {'clearData': clearData});
        clearData = false;
      }
    }
  }]);
})();
