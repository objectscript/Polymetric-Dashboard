(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('ecpDataCtrl', ['$scope', '$q', '$timeout', '$compile', 'dashboard', function($scope, $q, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [
      {
        'id': 'ECPDATA-activconn',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSConn',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Active Connections'}
        }
      },
      {
        'id': 'ECPDATA-maxconn',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSConnMax',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Maximum Connections'}
        }
      },
      {
        'id': 'ECPDATA-globref',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSGloRefPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Global Referenecs Per Second'}
        }
      },
      {
        'id': 'ECPDATA-globupdates',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSGloUpdatePerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Global Updates Per Second'}
        }
      },
      {
        'id': 'ECPDATA-reqrec',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSReqRcvdPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Request Recieved Per Second'}
        }
      },
      {
        'id': 'ECPDATA-reqbuffproc',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSReqBuffPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Request Buffers Processed Per Second'}
        }
      },
      {
        'id': 'ECPDATA-blocksent',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSBlockSentPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Blocks Sent Per Second'}
        }
      },
      {
        'id': 'ECPDATA-lockgrant',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSLockGrantPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Lock Grant Per Second'}
        }
      },
      {
        'id': 'ECPDATA-lockfail',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSLockFailPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Lock Fail Per Second'}
        }
      },
      {
        'id': 'ECPDATA-lockqgrant',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSLockQueGrantPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Lock Que Grant Per Second'}
        }
      },
      {
        'id': 'ECPDATA-lockqfail',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSLockQueFailPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Lock Que Fail Per Second'}
        }
      },
      {
        'id': 'ECPDATA-bytesent',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSByteSentPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Bytes Sent Per Second'}
        }
      },
      {
        'id': 'ECPDATA-byterec',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSByteRcvdPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Bytes Recieved Per Second'}
        }
      },
      {
        'id': 'ECPDATA-blockpurge',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSSvrBlockPurgePerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Blocks Purged By Server Per Second'}
        }
      },
      {
        'id': 'ECPDATA-rtnpurge',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSRoutinePurgePerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Routines Purged Per Second'}
        }
      },
      {
        'id': 'ECPDATA-bigkill',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSBigKillPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Big Kill Per Second'}
        }
      },
      {
        'id': 'ECPDATA-bigstring',
        'settings': {
          'type': 'Line Chart',
          'namespace': '%SYS',
          'sensor': 'ECPSBigStringPerSec',
          'item': '-',
          'unit': '',
          'advanced': {'title': 'Big String Per Second'}
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
        $('.ecp-data-stack').gridstack({
          cellHeight: '48px',
          verticalMargin: 20,
          animate: true
        });
        resolve($('.ecp-data-stack').data('gridstack'));
      });
    }

    function createWidgets(grid) {
      for (var i = 0; i < _this.widgets.length; i++) {
        var html = '<div><div flex="100" class="grid-stack-item-content hideOverflow" md-whiteframe="1"><smp-static-widget data="ecpData.widgets[' + i + ']"></smp-static-widget></div></div>';
        var el = $compile(html)($scope);

        // put the widget on the grid
        // addWidget(el, x, y, width, height, autoPos, minWidth, maxWidth, minHeight, maxHeight)
        grid.addWidget(el, _this.widgets[i].x, _this.widgets[i].y, 6, 3, true, 4, 12, 3, 3);
      }
    }
  }]);
})();
