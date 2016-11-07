(function() {
  'use strict';

  var dialog = angular.module('overlay');

  dialog.controller('widgetIODialogCtrl', ['$scope', '$mdDialog', '$timeout', 'WidgetProvider', function($scope, $mdDialog, $timeout, WidgetProvider) {
    var _this = this;

    _this.close = closeDialog;
    _this.import = importJSON;
    _this.export = exportJSON;
    _this.inputJSON = inputJSON;

    init();
    function init() {
      // populates the text field with the exported widgets when the dialog is opened
      exportJSON();
    }

    function inputJSON(event) {
      // set max length high to allow pasting
      var textarea = angular.element($('.IODialogTextArea'));
      textarea.attr('maxlength', '100000');

      // timeout to allow all calls to be completed
      $timeout(function() {
        // set the value manually (issues with keeping max length at 0)
        _this.JSON = textarea.val();
        // set the maxlength back to 0 so no typing is possible
        textarea.attr('maxlength', '0');
      }, 0);
    }

    function importJSON() {
      _this.$error = {};

      // validate that the JSON being imported is not null or an empty object (just clear the grid)
      if (!_this.JSON || _this.JSON === '{}') {
        _this.$error.empty = true;
      } else {
        _this.$error.empty = false;
      }

      var widgets;
      // try importing the JSON, will throw an error if JSON syntax is invalid
      if (!_this.$error.empty) {
        try {
          _this.$error.invalidJson = false;
          widgets = WidgetProvider.importWidgets(_this.JSON);
        } catch (e) {
          console.error(e);
          _this.$error.invalidJson = true;
        }
      }

      //  validate that the Widget JSON has all the attributes of a widget, if not error.
      if (!_this.$error.empty && !_this.$error.invalidJson) {
        _this.$error.invalidWidget = false;

        var widgetIds = Object.keys(widgets);
        for (var i = 0; i < widgetIds.length; i++) {
          if (!WidgetProvider.validate(widgets[widgetIds[i]])) {
            _this.$error.invalidWidget = true;
            break;
          }
        }
      }
      // finally, if all checks out hide the widget passing the data back through the promise for the playground to show the data
      if (!_this.$error.empty && !_this.$error.invalidJson && !_this.$error.invalidWidget) {
        $mdDialog.hide(widgets);
      }
    }

    // sets the local var used to display the JSON data to the current widgets data
    function exportJSON() {
      _this.JSON = WidgetProvider.exportWidgets();
    }

    // closes the dialog
    function closeDialog() {
      $mdDialog.cancel();
    }

  }]);
})();
