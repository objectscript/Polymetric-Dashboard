(function() {
  'use strict';

  var dialog = angular.module('overlay');

  dialog.controller('widgetListDialogCtrl', ['$scope', 'mdPanelRef', '$filter', '$mdToast', '$compile', 'WidgetProvider', function($scope, mdPanelRef, $filter, $mdToast, $compile, WidgetProvider) {
    var _this = this;

    // get the pointer to the grid so widgets data can be set/get
    _this.grid = $('.grid-stack').data('gridstack');

    // local vars allowing access to functions
    _this.apply = apply;
    _this.cancel = closeDialog;
    _this.addWidget = addWidget;
    _this.openAdvMenu = openAdvMenu;

    // vars used by the pagination of the list
    _this.numWidgets = 0;
    _this.numWidgetsPerPage = 5;
    _this.curPage = WidgetProvider.widgetListPage;

    // vars used to populate the dropdowns of the sensors
    _this.types = WidgetProvider.types;
    _this.sensors = WidgetProvider.sensors;
    _this.items = WidgetProvider.items;

    init();
    function init() {
      // get all the widgets from the widget service
      var widgetsObj =  WidgetProvider.widgets();

      // for all the widgets in the widgetObject (an object containing widget objects)
      var keys = Object.keys(widgetsObj);
      var tmpArr = [];
      for (var i = 0; i < keys.length; i++) {
        // make a deep copy of the widget (so its data can be chagned without messing up the existing widgets)
        tmpArr.push(jQuery.extend(true, {}, widgetsObj[keys[i]])); // push it onto a temp array
      }
      _this.widgets = tmpArr; // store the temp array
      _this.numWidgets = Object.keys(_this.widgets).length; // update the amount of widgets displayed for pagination
    }

    function apply() {
      // reset the curpage so it does not mess up if widgets are removed
      WidgetProvider.widgetListPage = 1;

      // get the widgets data changed value (it might have been altered from a different menu)
      var dataChanged;
      // if some widgets have invalid data (no sensor, item, name space for widgets other than Text)
      var validWidgets = true;
      var error = {'fields': []};
      // loops through all the sensors, updating the ones that have been changed
      for (var i = 0; i < _this.widgets.length; i++) {

        var listWidget = _this.widgets[i];
        var id = listWidget.id;

        var savedWidget = WidgetProvider.widget(id);
        // if the advanced menu changed the widget this will be true
        dataChanged = savedWidget.dataChanged;

        if (listWidget.remove) {
          // by setting the widget remove property to true the WidgetProvider will remove the widget when updated
          savedWidget.remove = listWidget.remove;

          dataChanged = true;
        } else {
          // lock the widget if requested (this does not have to do with type so done before type check)
          if (savedWidget.locked !== listWidget.locked) {
            WidgetProvider.lockWidget(listWidget.id, listWidget.locked);
            dataChanged = true;
          }

          // set the widgets data changed flag so it knows if it needs to be updated
          savedWidget.dataChanged = dataChanged;

          if (listWidget.settings.type) {
            // always change the widgets type
            if (savedWidget.settings.type !== listWidget.settings.type) {
              savedWidget.settings.type = listWidget.settings.type;
              dataChanged = true;
            }

            // if the type is not Text (it doesn't have a unit) and it was changed update the widget
            var units = '';
            if (listWidget.settings.namespace && listWidget.settings.sensor && listWidget.settings.item) {
              units = _this.sensors[listWidget.settings.namespace][listWidget.settings.sensor].units;
              if (savedWidget.settings.unit !== units) {
                savedWidget.settings.unit = units;
                dataChanged = true;
              }

              if (savedWidget.settings.namespace !== listWidget.settings.namespace) {
                savedWidget.settings.namespace = listWidget.settings.namespace;
                savedWidget.settings.namespaceIdx = listWidget.settings.namespaceIdx;
                dataChanged = true;
              }
              if (savedWidget.settings.sensor !== listWidget.settings.sensor) {
                savedWidget.settings.sensor = listWidget.settings.sensor;
                savedWidget.settings.sensorIdx = listWidget.settings.sensorIdx;
                dataChanged = true;
              }
              if (savedWidget.settings.item !== listWidget.settings.item) {
                savedWidget.settings.item = listWidget.settings.item;
                savedWidget.settings.itemIdx = listWidget.settings.itemIdx;

                savedWidget.settings.sensorIdx = listWidget.settings.sensorIdx;
                dataChanged = true;
              }
              if (savedWidget.settings.sensorIdx !== listWidget.settings.sensorIdx) {
                savedWidget.settings.sensorIdx = listWidget.settings.sensorIdx;
                dataChanged = true;
              }
              if (savedWidget.settings.itemIdx !== listWidget.settings.itemIdx) {
                savedWidget.settings.itemIdx = listWidget.settings.itemIdx;
                dataChanged = true;
              }
            } else if (listWidget.settings.type !== 'Text') {
              validWidgets = false;
              error.row = i + 1;
              error.type = listWidget.settings.type;
              if (!listWidget.settings.namespace) error.fields.push('namespace');
              if (!listWidget.settings.sensor) error.fields.push('sensor');
              if (!listWidget.settings.item) error.fields.push('item');
              break;
            }

          }
          // update the widgets datachanged flag so the WidgetProvider knows if it should be update or not
          savedWidget.dataChanged = dataChanged;
        }
        // update the widget
        WidgetProvider.updateWidget(id);
      }

      if (validWidgets) {
        closeDialog();
      } else {
        var fields = error.fields.toString().replace(/,(?=\w)/g, ', ');

        var msg = '<md-toast><div flex="100" layout="column"><p class="md-body-1 warn-text"><b>Invalid Widget on Row ' + error.row + '</b></p><p class="md-body-1">Missing: <i>' + fields + '</i>.</p></div></md-toast>';
        var toast = {
          template: msg,
          position: 'bottom right',
          hideDelay: '3000',
          parent: mdPanelRef._panelEl,
        };

        $mdToast.show(toast);
      }
    }

    function addWidget() {
      // create a new widget
      var widget = WidgetProvider.widget(undefined, undefined);
      var html = '<div><div flex="100" class="grid-stack-item-content hideOverflow" md-whiteframe="1"><smp-widget widget-id="' + widget.id + '"></smp-widget></div></div>';
      var el = $compile(html)($scope);

      // put the widget on the playground
      _this.grid.addWidget(el, widget.x, widget.y, widget.w, widget.h, widget.autoPos);

      // update the locally stored widget data
      var tmpWidget = jQuery.extend(true, {}, widget);
      _this.widgets.push(tmpWidget);
      _this.numWidgets += _this.widgets.length;

      return widget;
    }

    // closes the dialog
    function closeDialog() {
      if (mdPanelRef) mdPanelRef.close();
    }

    // opens the advanced menu
    function openAdvMenu($event, widget) {
      // save the current page so when advanced settings are done it is restored
      WidgetProvider.widgetListPage = _this.curPage;
      widget.openAdvMenu($event, widget.settings.type);
    }

  }]);
})();
