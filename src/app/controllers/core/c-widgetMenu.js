(function() {
  'use strict';

  var dialog = angular.module('overlay');

  dialog.controller('widgetMenuCtrl', ['$scope', '$mdToast', '$mdDialog', 'mdPanelRef', 'WidgetProvider', 'dashboard', function($scope, $mdToast, $mdDialog, mdPanelRef, WidgetProvider, dashboard) {
    var _this = this;
    // get the correct widget from the widget provider
    _this.widget = WidgetProvider.widget(_this.widgetId);

    // local vars to allow access to functions
    _this.openAdvMenu = openAdvMenu;
    _this.apply = apply;
    _this.validate = validate;
    _this.cancel = closePanel;

    init();
    // function to initialize all the parameters via what is stored in the widget
    function init() {
      _this.types = WidgetProvider.types;
      _this.sensors = WidgetProvider.sensors;

      _this.type = _this.widget.settings.type;
      _this.sensor = _this.widget.settings.sensor;
      _this.namespace = _this.widget.settings.namespace;
      _this.item = _this.widget.settings.item;
      _this.units = _this.widget.settings.unit;
      _this.selectedNamespaceIdx = _this.widget.settings.namespaceIdx;
      _this.selectedSensorIdx = _this.widget.settings.sensorIdx;
      _this.selectedItemIdx = _this.widget.settings.itemIdx;
      _this.locked = _this.widget.locked;
      _this.remove = _this.widget.remove;
    }

    _this.valid = true;
    // validates that widget data is present and correct
    function validate() {
      if (!_this.remove && !_this.type) {
        _this.errorMsg = 'Please Select a Type';
        _this.errorType = 'Type';
        _this.valid = false;
      }else if (_this.type !== 'Text' && !_this.remove && !_this.namespace) {
        _this.errorMsg = 'Please Select a Namespace';
        _this.errorType = 'Namespace';
        _this.valid = false;
      }else if (_this.type !== 'Text' && !_this.remove && !_this.sensor) {
        _this.errorMsg = 'Please Select a Sensor';
        _this.errorType = 'Sensor';
        _this.valid = false;
      }else if (_this.type !== 'Text' && !_this.remove && !_this.item) {
        _this.errorMsg = 'Please Select an Item';
        _this.errorType = 'Item';
        _this.valid = false;
      } else if (_this.type === 'Text' && _this.widget.settings.advanced.text === '') {
        _this.errorMsg = 'Please Click the Advanced Button to Add Text.';
        _this.errorType = 'Text';
        _this.valid = false;
      }else {
        _this.errorMsg = '';
        _this.valid = true;
      }
    }

    function apply() {

      // if there is an ivalid field click on it so it is shown (also show a tooltip)
      if (!_this.valid) {
        var elemToClick = '';
        if (_this.errorType === 'Type') elemToClick = '#widgetMenuTypeSelect';
        if (_this.errorType === 'Namespace') elemToClick = '#widgetMenuNamespaceSelect';
        if (_this.errorType === 'Sensor') elemToClick = '#widgetMenuSensorSelect';
        if (_this.errorType === 'Item') elemToClick = '#widgetMenuItemSelect';
        if (_this.errorType === 'Text') openAdvMenu(); _this.errorType = '';

        angular.element($(elemToClick)).triggerHandler('click');
      } else {
        if (_this.remove) {
          // by setting the widget remove property to true the WidgetProvider will remove the widget when updated
          _this.widget.remove = _this.remove;
        } else {

          // get the widgets data changed value (it might have been altered from a different menu)
          var dataChanged = _this.widget.dataChanged;

          // if the type is not Text (it doesn't have a unit) and it was changed update the widget
          var units = '';
          if (_this.type !== 'Text') {
            units = _this.sensors[_this.namespace][_this.sensor].units;
            if (_this.widget.settings.unit !== units) {
              _this.widget.settings.unit = units;
              dataChanged = true;
            }
          }

          // see if things changed and update the ones that have
          if (_this.widget.settings.type !== _this.type) {
            _this.widget.settings.type = _this.type;
            dataChanged = true;
          }
          if (_this.widget.settings.namespace !== _this.namespace) {
            _this.widget.settings.namespace = _this.namespace;
            dataChanged = true;
          }
          if (_this.widget.settings.sensor !== _this.sensor) {
            _this.widget.settings.sensor = _this.sensor;
            dataChanged = true;
          }
          if (_this.widget.settings.item !== _this.item) {
            _this.widget.settings.item = _this.item;
            dataChanged = true;
          }
          if (_this.widget.settings.namespaceIdx !== _this.selectedNamespaceIdx) {
            _this.widget.settings.namespaceIdx = _this.selectedNamespaceIdx;
            dataChanged = true;
          }
          if (_this.widget.settings.sensorIdx !== _this.selectedSensorIdx) {
            _this.widget.settings.sensorIdx = _this.selectedSensorIdx;
            dataChanged = true;
          }
          if (_this.widget.settings.itemIdx !== _this.selectedItemIdx) {
            _this.widget.settings.itemIdx = _this.selectedItemIdx;
            dataChanged = true;
          }
          if (_this.widget.settings.locked !== _this.locked) {
            WidgetProvider.lockWidget(_this.widget.id, _this.locked);
          }

          // update the widgets datachanged flag so the WidgetProvider knows if it should be update or not
          _this.widget.dataChanged = dataChanged;
        }

        WidgetProvider.updateWidget(_this.widget.id);

        // closes the widgetMenu
        closePanel();
      }
    }

    // closes the widget menu
    function closePanel() {
      if (mdPanelRef) mdPanelRef.close();
    }

    // opens the advanced menu
    function openAdvMenu($event) {
      _this.widget.openAdvMenu($event, _this.type);
    }

  }]);
})();
