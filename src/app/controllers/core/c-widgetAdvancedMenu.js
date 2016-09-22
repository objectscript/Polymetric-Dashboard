(function() {
  'use strict';

  var dialog = angular.module('overlay');

  dialog.controller('widgetAdvMenuCtrl', ['$scope', '$compile', '$filter', '$mdToast', '$mdDialog', 'WidgetProvider', function($scope, $compile, $filter, $mdToast, $mdDialog, WidgetProvider) {
    var _this = this;
    // get the correct widget from the widget provider
    _this.widget = WidgetProvider.widget(_this.widgetId);

    // local vars to allow access to functions
    _this.apply = apply;
    _this.validate = validate;
    _this.cancel = closeDialog;
    _this.getTemplate = getTemplate;

    init();
    // function to initialize all the parameters via what is stored in the widget
    function init() {
      // Initialize the options for all the types of widgets
      _this.numMetricsOptions = WidgetProvider.numMetrics;
      _this.metricOptions = WidgetProvider.metrics;
      _this.widthOptions = WidgetProvider.widths;
      _this.fillOptions = WidgetProvider.fills;
      _this.lineHeights = WidgetProvider.lineHeights;
      _this.sparklineHeights = WidgetProvider.sparklineHeights;
      _this.classes = WidgetProvider.classes;
      _this.alignments = WidgetProvider.alignments;

      // Initialize the values of all the options
      _this.text = _this.widget.settings.advanced.text;
      _this.class = _this.widget.settings.advanced.class;
      _this.alignment = _this.widget.settings.advanced.alignment;
      _this.lineChartHeight = _this.widget.settings.advanced.lineChartHeight;
      _this.sparklineChartHeight = _this.widget.settings.advanced.sparklineChartHeight;
      _this.showTitle = _this.widget.settings.advanced.showTitle;
      _this.showXAxis = _this.widget.settings.advanced.showXAxis;
      _this.showYAxis = _this.widget.settings.advanced.showYAxis;
      _this.chartTitle = _this.widget.settings.advanced.chartTitle;
      _this.labelXAxis = _this.widget.settings.advanced.labelXAxis;
      _this.labelYAxis = _this.widget.settings.advanced.labelYAxis;
      _this.numMetrics = _this.widget.settings.advanced.numMetrics;
      _this.metrics = _this.widget.settings.advanced.metrics;
      _this.widths = _this.widget.settings.advanced.widths;
      _this.fills = _this.widget.settings.advanced.fills;
      _this.showMetricLabel = _this.widget.settings.advanced.showMetricLabel;
      _this.sensorDisplayEditOption = _this.widget.settings.advanced.sensorDisplayEditOption;
    }

    // show the corrent settings based on the type of the widget
    function getTemplate() {
      var tmplt = '';
      switch (_this.type) {
        case 'Text':
          tmplt = '/textAdvMenu.html';
          break;
        case 'Sparkline Chart':
          tmplt = '/sparklineAdvMenu.html';
          break;
        case 'Line Chart':
          tmplt = '/lineAdvMenu.html';
          break;
        case 'Sensor Display':
          tmplt = '/sensorDisplayAdvMenu.html';
          break;
      }
      return tmplt;
    }

    // validates the settings, making sure all needed information is given
    _this.valid = true;
    function validate() {
      if (_this.type === 'Text' && _this.text === '') { // a text widget must have text to show
        _this.errorMsg = 'Please Input Text to Display.';
        _this.errorType = 'Text';
        _this.valid = false;
      } else if (_this.type === 'Sensor Display' && (_this.metrics.length < _this.numMetrics)) { // sensor displays cannot have empty cells
        _this.errorMsg = 'Please Make sure all Metrics are defined....';
        _this.errorType = 'Metric';
        _this.valid = false;
      } else if (_this.type === 'Sensor Display') {
        for (var i = 0; i < _this.metrics.length; i++) { // sensor displays cannot have empty cells
          if (_this.metrics[i] === undefined) {
            _this.errorMsg = 'Please Make Sure all Metrics are defined.';
            _this.errorType = 'Metric';
            _this.valid = false;
            break;
          } else {
            _this.errorMsg = '';
            _this.errorType = '';
            _this.valid = true;
          }
        }
      } else {
        _this.errorMsg = '';
        _this.errorType = '';
        _this.valid = true;
      }

    }

    // checks to see if any of the options have changed then updates them if so
    function apply() {
      // if it is not valid, show a popup next to the item that needs to be fixes and focus on it
      if (!_this.valid) {
        var elemToClick = '';
        if (_this.errorType === 'Text') { // focus on the input to add text (making it active)
          elemToClick = '#widgetAdvMenuTextInput';

          angular.element($(elemToClick)).focus();
        }
        if (_this.errorType === 'Metric') { // for all cells in a sensor display
          var i = 0;
          for (i = 0; i < _this.metrics.length; i++) { // if one is undefined, break the loop rememvering its index
            if (_this.metrics[i] === undefined) {
              break;
            }
          }

          elemToClick = '#widgetAdvMenuMetricSelect' + (i + 1);
          angular.element($(elemToClick)).triggerHandler('click');  // simulate a click on the metric menu so it opens
        }
      // if everything is valid
      } else {
        // get the widgets data changed value (it might have been altered from a different menu)
        var dataChanged = _this.widget.dataChanged;

        // go through all the settings, only updating the ones that have changed and pertain to the type of widget
        // text settings
        if (_this.type === 'Text') {
          if (_this.widget.settings.advanced.text !== _this.text) {
            _this.widget.settings.advanced.text  = _this.text;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.class !== _this.class) {
            _this.widget.settings.advanced.class = _this.class;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.alignment !== _this.alignment) {
            _this.widget.settings.advanced.alignment = _this.alignment;
            dataChanged = true;
          }
        // line chart settings
        } else if (_this.type === 'Line Chart') {
          if (_this.widget.settings.advanced.lineChartHeight !== _this.lineChartHeight) {
            _this.widget.settings.advanced.lineChartHeight = _this.lineChartHeight;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showTitle !== _this.showTitle) {
            _this.widget.settings.advanced.showTitle = _this.showTitle;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showXAxis !== _this.showXAxis) {
            _this.widget.settings.advanced.showXAxis = _this.showXAxis;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showYAxis !== _this.showYAxis) {
            _this.widget.settings.advanced.showYAxis = _this.showYAxis;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.chartTitle !== _this.chartTitle) {
            // if (_this.chartTitle === '') {
            //   _this.chartTitle = '[' + _this.widget.setings.namespace + '] ' + _this.widget.setings.sensor + ', ' + _this.widget.setings.item;
            // }
            _this.widget.settings.advanced.chartTitle = _this.chartTitle;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.labelXAxis !== _this.labelXAxis) {
            _this.widget.settings.advanced.labelXAxis = _this.labelXAxis;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.labelYAxis !== _this.labelYAxis) {
            _this.widget.settings.advanced.labelYAxis = _this.labelYAxis;
            dataChanged = true;
          }
        // sparkline chart settings
        } else if (_this.type === 'Sparkline Chart') {
          if (_this.widget.settings.advanced.sparklineChartHeight !== _this.lineChartHeight) {
            _this.widget.settings.advanced.sparklineChartHeight = _this.sparklineChartHeight;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showTitle !== _this.showTitle) {
            _this.widget.settings.advanced.showTitle = _this.showTitle;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showXAxis !== _this.showXAxis) {
            _this.widget.settings.advanced.showXAxis = _this.showXAxis;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showYAxis !== _this.showYAxis) {
            _this.widget.settings.advanced.showYAxis = _this.showYAxis;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.chartTitle !== _this.chartTitle) {
            // if (_this.chartTitle === '') {
            //   _this.chartTitle = '[' + _this.widget.setings.namespace + '] ' + _this.widget.setings.sensor + ', ' + _this.widget.setings.item;
            // }
            _this.widget.settings.advanced.chartTitle = _this.chartTitle;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.labelXAxis !== _this.labelXAxis) {
            _this.widget.settings.advanced.labelXAxis = _this.labelXAxis;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.labelYAxis !== _this.labelYAxis) {
            _this.widget.settings.advanced.labelYAxis = _this.labelYAxis;
            dataChanged = true;
          }
        // sensor display settings
        } else if (_this.type === 'Sensor Display') {
          if (_this.widget.settings.advanced.numMetrics !== _this.numMetrics) {
            _this.widget.settings.advanced.numMetrics = _this.numMetrics;
            dataChanged = true;
          }
          var usedmetrics = _this.metrics.splice(0, _this.numMetrics);
          if (_this.widget.settings.advanced.metrics !== usedmetrics) {
            _this.widget.settings.advanced.metrics = usedmetrics;
            dataChanged = true;
          }
          var usedwidths = _this.widths.splice(0, _this.numMetrics);
          if (_this.widget.settings.advanced.widths !== usedwidths) {
            _this.widget.settings.advanced.widths = usedwidths;
            dataChanged = true;
          }
          var usedfills = _this.fills.splice(0, _this.numMetrics);
          if (_this.widget.settings.advanced.fills !== usedfills) {
            _this.widget.settings.advanced.fills = usedfills;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.showMetricLabel !== _this.showMetricLabel) {
            _this.widget.settings.advanced.showMetricLabel = _this.showMetricLabel;
            dataChanged = true;
          }
          if (_this.widget.settings.advanced.sensorDisplayEditOption !== _this.sensorDisplayEditOption) {
            _this.widget.settings.advanced.sensorDisplayEditOption = _this.sensorDisplayEditOption;
            dataChanged = true;
          }
        }

        // set the widgets flag to if it was changed or not (used so widgest wont be rerendered if they have not changed)
        _this.widget.dataChanged = dataChanged;

        closeDialog();
      }
    }

    // closes the dialog
    function closeDialog() {
      $mdDialog.cancel();
    }
  }]);
})();
