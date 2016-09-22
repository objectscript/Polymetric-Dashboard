(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('ecpDataCtrl', ['$scope', '$timeout', '$compile', 'dashboard', function($scope, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [];

    init();
    function init() {
      createGrid();
      createWidgets();
    }

    function createGrid() {
      // create application server grid
      $('.ecp-data-stack').gridstack({
        cellHeight: '48px',
        verticalMargin: 20,
        animate: true,
        float: false,
      });
      _this.appGrid = $('.ecp-data-stack').data('gridstack');
    }

    function createWidgets() {
      // create application server widgets
      _this.widgets = [
        {'id': 'DATA-activconn', 'title': 'Active Connections', 'namespace': '%SYS', 'sensor': 'ECPSConn', 'item': '-'},
        {'id': 'DATA-maxconn', 'title': 'Maximum Connections', 'namespace': '%SYS', 'sensor': 'ECPSConnMax', 'item': '-'},
        {'id': 'DATA-globref', 'title': 'Global Referenecs Per Second', 'namespace': '%SYS', 'sensor': 'ECPSGloRefPerSec', 'item': '-'},
        {'id': 'DATA-globupdates', 'title': 'Global Updates Per Second', 'namespace': '%SYS', 'sensor': 'ECPSGloUpdatePerSec', 'item': '-'},
        {'id': 'DATA-reqrec', 'title': 'Request Recieved Per Second', 'namespace': '%SYS', 'sensor': 'ECPSReqRcvdPerSec', 'item': '-'},
        {'id': 'DATA-reqbuffproc', 'title': 'Request Buffers Processed Per Second', 'namespace': '%SYS', 'sensor': 'ECPSReqBuffPerSec', 'item': '-'},
        {'id': 'DATA-blocksent', 'title': 'Blocks Sent Per Second', 'namespace': '%SYS', 'sensor': 'ECPSBlockSentPerSec', 'item': '-'},
        {'id': 'DATA-lockgrant', 'title': 'Lock Grant Per Second', 'namespace': '%SYS', 'sensor': 'ECPSLockGrantPerSec', 'item': '-'},
        {'id': 'DATA-lockfail', 'title': 'Lock Fail Per Second', 'namespace': '%SYS', 'sensor': 'ECPSLockFailPerSec', 'item': '-'},
        {'id': 'DATA-lockqgrant', 'title': 'Lock Que Grant Per Second', 'namespace': '%SYS', 'sensor': 'ECPSLockQueGrantPerSec', 'item': '-'},
        {'id': 'DATA-lockqfail', 'title': 'Lock Que Fail Per Second', 'namespace': '%SYS', 'sensor': 'ECPSLockQueFailPerSec', 'item': '-'},
        {'id': 'DATA-bytesent', 'title': 'Bytes Sent Per Second', 'namespace': '%SYS', 'sensor': 'ECPSByteSentPerSec', 'item': '-'},
        {'id': 'DATA-byterec', 'title': 'Bytes Recieved Per Second', 'namespace': '%SYS', 'sensor': 'ECPSByteRcvdPerSec', 'item': '-'},
        {'id': 'DATA-blockpurge', 'title': 'Blocks Purged By Server Per Second', 'namespace': '%SYS', 'sensor': 'ECPSSvrBlockPurgePerSec', 'item': '-'},
        {'id': 'DATA-rtnpurge', 'title': 'Routines Purged Per Second', 'namespace': '%SYS', 'sensor': 'ECPSRoutinePurgePerSec', 'item': '-'},
        {'id': 'DATA-bigkill', 'title': 'Big Kill Per Second', 'namespace': '%SYS', 'sensor': 'ECPSBigKillPerSec', 'item': '-'},
        {'id': 'DATA-bigstring', 'title': 'Big String Per Second', 'namespace': '%SYS', 'sensor': 'ECPSBigStringPerSec', 'item': '-'}
      ];

      addWidgets(_this.widgets);
    }

    function addWidgets(widgets) {
      for (var i = 0; i < widgets.length; i++) {
        var html = $('#ecpDataWidget').html();
        // replace the holder _ with the correct index for the data;
        html = html.replace(new RegExp(/[_]/, 'g'), i);
        var el = $compile(html)($scope);

        // put the widget on the data grid
        //                   el, x, y, width, height, autoPos, minWidth, minHeight
        _this.appGrid.addWidget(el, 0, 0, 6, 3, true, 1, 12, 3, 3);
      }
    }

    var appUpdateResizeListener;
    // on resize the widgets should be saved so their positions are kept
    $('.ecp-data-stack').on('resizestop', function(event, ui) {
      $timeout.cancel(appUpdateResizeListener);

      appUpdateResizeListener = $timeout(function() {
        dashboard.updateChart();
      }, 250);
    });

  }]);
})();
