/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('ecpAppCtrl', ['$scope', '$q', '$timeout', '$compile', function($scope, $q, $timeout, $compile) {
    var _this = this;

    _this.widgets = [
      {
        'id': 'ECPAPP-activconn',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPConn',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Active Connections'}
        }
      },
      {
        'id': 'ECPAPP-maxconn',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPConnMax',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Maximum Connections'}
        }
      },
      {
        'id': 'ECPAPP-lglobref',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'GloRefPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Local Global References Per Second'}
        }
      },
      {
        'id': 'ECPAPP-rglobref',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'GloRefRemPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Remote Global References Per Second'}
        }
      },
      {
        'id': 'ECPAPP-lglobupdate',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'GloUpdatePerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Local Global Updates Per Second'}
        }
      },
      {
        'id': 'ECPAPP-rglobupdate',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'GloUpdateRemPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Remote Global Updates Per Second'}
        }
      },
      {
        'id': 'ECPAPP-lrtncall',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'RtnCallLocalPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Local Routine Calls Per Second'}
        }
      },
      {
        'id': 'ECPAPP-rrtncall',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'RtnCallRemotePerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Remote Routine Calls Per Second'}
        }
      },
      {
        'id': 'ECPAPP-globref',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPGloRefPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Global Referenecs Per Second'}
        }
      },
      {
        'id': 'ECPAPP-bytesent',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPByteSentPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Bytes Sent Per Second'}
        }
      },
      {
        'id': 'ECPAPP-byterec',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPByteRcvdPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Bytes Recieved Per Second'}
        }
      },
      {
        'id': 'ECPAPP-blockadd',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPBlockAddPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Blocks Added Per Second'}
        }
      },
      {
        'id': 'ECPAPP-blockpurgeB',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPBlockPurgeBuffPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Blocks Purged By Buffer Per Second'}
        }
      },
      {
        'id': 'ECPAPP-blockpergeS',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPBlockPurgeSvrPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Blocks Purged By Server Per Second'}
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
      // create application server grid
      return $q(function(resolve, reject) {
        // create the grid
        $('.ecp-app-stack').gridstack({
          cellHeight: '48px',
          verticalMargin: 20,
          animate: true
        });
        resolve($('.ecp-app-stack').data('gridstack'));
      });
    }

    function createWidgets(grid) {
      for (var i = 0; i < _this.widgets.length; i++) {
        var html = '<div><div flex="100" class="grid-stack-item-content hideOverflow" md-whiteframe="1"><smp-static-widget data="ecpApp.widgets[' + i + ']"></smp-static-widget></div></div>';
        var el = $compile(html)($scope);

        // put the widget on the grid
        // addWidget(el, x, y, width, height, autoPos, minWidth, maxWidth, minHeight, maxHeight)
        grid.addWidget(el, _this.widgets[i].x, _this.widgets[i].y, 6, 3, true, 4, 12, 3, 3);
      }
    }
  }]);
})();
