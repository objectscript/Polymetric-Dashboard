(function() {
  'use strict';

  var core = angular.module('core');

  core.controller('widgetCtrl', ['$scope', '$element', '$compile', '$timeout', 'WidgetProvider', 'dashboard', function($scope, $element, $compile, $timeout, WidgetProvider, dashboard) {
    var _this = this;
    // get the correct widget from the widget provider
    _this.widget = $scope.widget = WidgetProvider.widget($scope.widgetId);

    // local vars to allow access to functions
    _this.openMenu = openMenu;

    // use the widget to open the correct menu
    function openMenu($event) {
      _this.widget.openMenu($event);
    }

    _this.widget.update = function() {
      drawWidget();
    };
    _this.widget.update();

    function drawWidget() {
      // get the span container for all content
      var holder = angular.element($element.find('span')).first();

      // get the visualizers html
      var html = getVizHtml();

      // put the element into the span holder
      holder.html(html);

      // compile it so angular stuff works
      $compile(holder)($scope);

    }

    // on resizestop the widgets should be saved so their positions are kept
    $('.playground-stack').on('resizestop', function(event, ui) {
      if (_this.widget.settings.type.indexOf('Chart') !== -1) {
        $scope.$broadcast('updateChartSize');
      }
      updateWidgetDems();
    });

    // on dragstop, the widgets should be saved so their positions are kept
    $('.playground-stack').on('dragstop', function(event, ui) {
      updateWidgetPos();
    });

    // updates the widget's position in the playgrounds data
    function updateWidgetPos() {
      $timeout(function() {
        // the acutal gridstack item is 2 levels above the widget directive.
        var gridItem = $element.parent().parent();

        _this.widget.x = gridItem.attr('data-gs-x');
        _this.widget.y = gridItem.attr('data-gs-y');
      }, 0);
    }

    // updates the widget's demensions in the playgrounds data
    function updateWidgetDems() {
      $timeout(function() {
        // the acutal gridstack item is 2 levels above the widget directive.
        var gridItem = $element.parent().parent();

        _this.widget.w = gridItem.attr('data-gs-width');
        _this.widget.h = gridItem.attr('data-gs-height');
      }, 0);
    }

    // updates the widget's position and demensions in the playgrounds data
    function updateWidgetPosDems() {
      updateWidgetPos();
      updateWidgetDems();
    }

    // watches the scope var of the widget to update the position of the widget when it is placed (autoPos will most likely place it somewhere other than 0,0)
    $scope.$watch('widget', function(nV, oV) {
      updateWidgetPosDems();
    });

    // builds the string needed to show the widgets visulization
    function getVizHtml() {
      var rString = '';
      // used to convert the grid cell based height in the widget advanced menu into pixels that the charts can understand
      // each grid cell is 3em tall so 3 * em per px = 1 cell
      var gridCellToPx = 48;
      // Any widget >1 grid tall must also include the margin between the grid cells in its height.
      var gridMargin = 20;
      var height;
      var title;
      switch (_this.widget.settings.type) {
        case 'Text':
          var tAlign = _this.widget.settings.advanced.alignment === 'start center' ? 'left' : _this.widget.settings.advanced.alignment === 'end center' ? 'right' : 'center';
          rString = '<div flex="100" layout="row" layout-align="' + _this.widget.settings.advanced.alignment + '" style="height:100%;">' +
                      '<p class="' + _this.widget.settings.advanced.class + '" style="text-align:' + tAlign + ';">' +
                        _this.widget.settings.advanced.text +
                      '</p>' +
                    '</div>';
          break;
        case 'Line Chart':
          var marginBottom = (_this.widget.settings.advanced.labelXAxis ? 40 : 0);
          var marginTop = 10;
          // add the total cell height plus the height of the margins also covered by the widget, minus all margins around the chart
          height = (_this.widget.settings.advanced.lineChartHeight * gridCellToPx) + ((_this.widget.settings.advanced.lineChartHeight - 1) * gridMargin) - marginTop - marginBottom;
          // make the chart title (either the text entered by the user or the sensor name etc)
          if (_this.widget.settings.advanced.showTitle) {
            if (_this.widget.settings.advanced.chartTitle) {
              title = _this.widget.settings.advanced.chartTitle;
            } else {
              title = '[' + _this.widget.settings.namespace + '] ' + _this.widget.settings.sensor + ', ' + _this.widget.settings.item;
            }

            // adjust height of chart to accomodate the title
            height -= 40;
          }
          rString = '<div>' +
                      '<h4 ng-if="' + _this.widget.settings.advanced.showTitle + '" flex="100" class="md-title no-margin blend-text doesAction" style="text-align:center;" layout-padding>' +
                        title +
                        '<smp-metadata ' +
                          'namespace="' + _this.widget.settings.namespace + '" ' +
                          'sensor="' + _this.widget.settings.sensor + '" ' +
                          'item="' + _this.widget.settings.item + '" ' +
                        '</smp-metadata>' +
                      '</h4>' +
                      '<smp-nvd3-chart ' +
                        'id="LineChart' + _this.widget.id + '" ' +
                        'type="lineChart" ' +
                        'namespace="' + _this.widget.settings.namespace + '" ' +
                        'sensor="' + _this.widget.settings.sensor + '" ' +
                        'item="' + _this.widget.settings.item + '" ' +
                        'units = "' + _this.widget.settings.unit + '" ' +
                        'height="' + height + '" ' +
                        'xaxis-visible="' + _this.widget.settings.advanced.showXAxis + '" ' +
                        'yaxis-visible="' + _this.widget.settings.advanced.showYAxis + '" ' +
                        'xaxis-label="' + _this.widget.settings.advanced.labelXAxis + '" ' +
                        'yaxis-label="' + _this.widget.settings.advanced.labelYAxis + '" ' +
                        'margin-left="' + 60 + '" ' +
                        'margin-bottom="' + (_this.widget.settings.advanced.labelXAxis ? 40 : 20) + '" ' +
                        'margin-right="' + 60 + '" ' +
                        'margin-top="' + 10 + '">' +
                      '</smp-nvd3-chart>' +
                    '</div>';
          break;
        case 'Sparkline Chart':
          // add the total cell height plus the height of the margins also covered by the widget
          height = (_this.widget.settings.advanced.sparklineChartHeight * gridCellToPx) + ((_this.widget.settings.advanced.sparklineChartHeight - 1) * gridMargin);
          // make the chart title (either the text entered by the user or the sensor name etc)
          if (_this.widget.settings.advanced.showTitle) {
            if (_this.widget.settings.advanced.chartTitle) {
              title = _this.widget.settings.advanced.chartTitle;
            } else {
              title = '[' + _this.widget.settings.namespace + '] ' + _this.widget.settings.sensor + ', ' + _this.widget.settings.item;
            }

            // adjust height of chart to accomodate the title
            height -= 40;
          }
          rString = '<div>' +
                      '<h4 ng-if="' + _this.widget.settings.advanced.showTitle + '" flex="100" class="md-title no-margin blend-text doesAction" style="text-align:center;" layout-padding>' +
                        title +
                        '<smp-metadata ' +
                          'namespace="' + _this.widget.settings.namespace + '" ' +
                          'sensor="' + _this.widget.settings.sensor + '" ' +
                          'item="' + _this.widget.settings.item + '" ' +
                        '</smp-metadata>' +
                      '</h4>' +
                      '<smp-nvd3-chart ' +
                        'id="SparklineChart' + _this.widget.id + '" ' +
                        'type="sparklineChart" ' +
                        'namespace="' + _this.widget.settings.namespace + '" ' +
                        'sensor="' + _this.widget.settings.sensor + '" ' +
                        'item="' + _this.widget.settings.item + '" ' +
                        'units = "' + _this.widget.settings.unit + '" ' +
                        'height="' + height + '" ' +
                        'margin-left="' + 0 + '" ' +
                        'margin-bottom="' + 0 + '" ' +
                        'margin-right="' + 0 + '" ' +
                        'margin-top="' + 0 + '">' +
                      '</smp-nvd3-chart>' +
                    '</div>';
          break;
        case 'Sensor Display':
          rString = '<div style="width:100%;height:100%;">' +
                      '<smp-sensor-display ' +
                        'namespace="' + _this.widget.settings.namespace + '" ' +
                        'sensor="' + _this.widget.settings.sensor + '" ' +
                        'item="' + _this.widget.settings.item + '" ' +
                        'units = "' + _this.widget.settings.unit + '" ' +
                        'metrics="' + _this.widget.settings.advanced.metrics.toString() + '" ' +
                        'widths="' + _this.widget.settings.advanced.widths.toString() + '" ' +
                        'classes="' + _this.widget.settings.advanced.fills.toString() + '"  ' +
                        'show-label="' + _this.widget.settings.advanced.showMetricLabel + '" ' +
                        'icon-class="stateBarContainer">' +
                      '</smp-sensor-display>' +
                    '</div>';
          break;
      }

      return rString;
    }
  }]);
})();
