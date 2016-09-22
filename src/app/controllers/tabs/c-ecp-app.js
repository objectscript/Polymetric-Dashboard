(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('ecpAppCtrl', ['$scope', '$timeout', '$compile', 'dashboard', function($scope, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [];

    init();
    function init() {
      createGrid();
      createWidgets();
    }

    function createGrid() {
      // create application server grid
      $('.ecp-app-stack').gridstack({
        cellHeight: '48px',
        verticalMargin: 20,
        animate: true,
        float: false,
      });
      _this.appGrid = $('.ecp-app-stack').data('gridstack');
    }

    function createWidgets() {
      // create application server widgets
      _this.widgets = [
        {'id': 'APP-activconn', 'title': 'Active Connections', 'namespace': '%SYS', 'sensor': 'ECPConn', 'item': '-'},
        {'id': 'APP-maxconn', 'title': 'Maximum Connections', 'namespace': '%SYS', 'sensor': 'ECPConnMax', 'item': '-'},
        {'id': 'APP-lglobref', 'title': 'Local Global References Per Second', 'namespace': '%SYS', 'sensor': 'GloRefPerSec', 'item': '-'},
        {'id': 'APP-rglobref', 'title': 'Remote Global References Per Second', 'namespace': '%SYS', 'sensor': 'GloRefRemPerSec', 'item': '-'},
        {'id': 'APP-lglobupdate', 'title': 'Local Global Updates Per Second', 'namespace': '%SYS', 'sensor': 'GloUpdatePerSec', 'item': '-'},
        {'id': 'APP-rglobupdate', 'title': 'Remote Global Updates Per Second', 'namespace': '%SYS', 'sensor': 'GloUpdateRemPerSec', 'item': '-'},
        {'id': 'APP-lrtncall', 'title': 'Local Routine Calls Per Second', 'namespace': '%SYS', 'sensor': 'RtnCallLocalPerSec', 'item': '-'},
        {'id': 'APP-rrtncall', 'title': 'Remote Routine Calls Per Second', 'namespace': '%SYS', 'sensor': 'RtnCallRemotePerSec', 'item': '-'},
        {'id': 'APP-globref', 'title': 'Global Referenecs Per Second', 'namespace': '%SYS', 'sensor': 'ECPGloRefPerSec', 'item': '-'},
        {'id': 'APP-bytesent', 'title': 'Bytes Sent Per Second', 'namespace': '%SYS', 'sensor': 'ECPByteSentPerSec', 'item': '-'},
        {'id': 'APP-byterec', 'title': 'Bytes Recieved Per Second', 'namespace': '%SYS', 'sensor': 'ECPByteRcvdPerSec', 'item': '-'},
        {'id': 'APP-blockadd', 'title': 'Blocks Added Per Second', 'namespace': '%SYS', 'sensor': 'ECPBlockAddPerSec', 'item': '-'},
        {'id': 'APP-blockpurgeB', 'title': 'Blocks Purged By Buffer Per Second', 'namespace': '%SYS', 'sensor': 'ECPBlockPurgeBuffPerSec', 'item': '-'},
        {'id': 'APP-blockpergeS', 'title': 'Blocks Purged By Server Per Second', 'namespace': '%SYS', 'sensor': 'ECPBlockPurgeSvrPerSec', 'item': '-'},
      ];

      addWidgets(_this.widgets);
    }

    function addWidgets(widgets) {
      for (var i = 0; i < widgets.length; i++) {
        var html = $('#ecpAppWidget').html();
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
    $('.ecp-app-stack').on('resizestop', function(event, ui) {
      $timeout.cancel(appUpdateResizeListener);

      appUpdateResizeListener = $timeout(function() {
        dashboard.updateChart();
      }, 250);
    });

  }]);
})();
