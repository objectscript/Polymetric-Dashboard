(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('performanceCtrl', ['$scope', '$timeout', '$compile', 'dashboard', function($scope, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [];

    init();
    function init() {
      createGrid();
      createWidgets();
    }

    function createGrid() {
      // create the grid
      $('.performance-stack').gridstack({
        cellHeight: '48px',
        verticalMargin: 20,
        animate: true,
        float: false,
      });
      _this.grid = $('.performance-stack').data('gridstack');
    }

    function createWidgets() {
      _this.widgets = [
        {'id': 'lroutref', 'title': 'Local Routine References', 'namespace': '%SYS', 'sensor': 'RtnCallLocalPerSec', 'item': '-', 'unit': ''},
        {'id': 'globupdates', 'title': 'Global Sets and Kills', 'namespace': '%SYS', 'sensor': 'GloUpdatePerSec', 'item': '-', 'unit': ''},
        {'id': 'lofrec', 'title': 'Logical Requests', 'namespace': '%SYS', 'sensor': 'LogReadsPerSec', 'item': '-', 'unit': ''},
        {'id': 'dreads', 'title': 'Disk Reads', 'namespace': '%SYS', 'sensor': 'PhysReadsPerSec', 'item': '-', 'unit': ''},
        {'id': 'dwrites', 'title': 'Disk Writes', 'namespace': '%SYS', 'sensor': 'PhysWritesPerSec', 'item': '-', 'unit': ''},
      ];
      for (var i = 0; i < _this.widgets.length; i++) {
        var html = $('#performanceWidget').html();
        // replace the holder _ with the correct index for the data;
        html = html.replace(new RegExp(/[_]/, 'g'), i);
        var el = $compile(html)($scope);

        // put the widget on the playground
        //                   el, x, y, width, height, autoPos, minWidth, minHeight
        _this.grid.addWidget(el, 0, 0, 6, 3, true, 1, 12, 3, 3);
      }
    }

    var updateResizeListener;
    // on resize the widgets should be saved so their positions are kept
    $('.performance-stack').on('resizestop', function(event, ui) {
      $timeout.cancel(updateResizeListener);

      updateResizeListener = $timeout(function() {
        dashboard.updateChart();
      }, 250);
    });
  }]);
})();
