(function() {

  'use strict';
  var tab = angular.module('tabs');

  tab.controller('summaryCtrl', ['$scope', '$timeout', '$compile', 'dashboard', function($scope, $timeout, $compile, dashboard) {
    var _this = this;

    _this.widgets = [];

    init();
    function init() {
      createGrid();
      createWidgets();
    }

    function createGrid() {
      // create the grid
      $('.summary-stack').gridstack({
        cellHeight: '48px',
        verticalMargin: 20,
        animate: true,
        float: false,
      });
      _this.grid = $('.summary-stack').data('gridstack');
    }

    function createWidgets() {
      _this.widgets = [
        {'id': 'cpu', 'title': 'CPU Usage', 'namespace': '%SYS', 'sensor': 'CPUusage', 'item': '-', 'unit': '%'},
        {'id': 'locktable', 'title': 'SMH Used: Lock Table', 'namespace': '%SYS', 'sensor': 'SMHPercentFull', 'item': 'Lock Table', 'unit': '%'},
        {'id': 'cacheefficiency', 'title': 'Cache Efficiency', 'namespace': '%SYS', 'sensor': 'CacheEfficiency', 'item': '-', 'unit': ''},
        {'id': 'gloref', 'title': 'Global References Per Second', 'namespace': '%SYS', 'sensor': 'GloRefPerSec', 'item': '-', 'unit': ''},
        {'id': 'licenseuse', 'title': 'Percent of Licenses Used', 'namespace': '%SYS', 'sensor': 'LicensePercentUsed', 'item': '-', 'unit': ''},
        {'id': 'proccount', 'title': 'Number of Active Processes', 'namespace': '%SYS', 'sensor': 'ProcessCount', 'item': '-', 'unit': ''},
      ];
      for (var i = 0; i < _this.widgets.length; i++) {
        var html = $('#summaryWidget').html();
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
    $('.summary-stack').on('resizestop', function(event, ui) {
      $timeout.cancel(updateResizeListener);

      updateResizeListener = $timeout(function() {
        dashboard.updateChart();
      }, 250);
    });
  }]);
})();
