(function() {
  'use strict';

  var app = angular.module('Widgets', []);

  /*  Holds all the sensor information */
  app.factory('WidgetProvider', ['$filter', '$mdPanel', '$mdDialog', '$localStorage', '$q', 'dashboard', function($filter, $mdPanel, $mdDialog, $localStorage, $q, dashboard) {
    // --------------------------------------------------------------------------------- //
    // ------------------------------ THE WIDGET PROVIDER ------------------------------ //
    // --------------------------------------------------------------------------------- //

    // storage for all widgets, key is their id
    var widgets = {};
    var allSensors = [];

    var WidgetProvider = {
      // function that returns an existing widget if passed a valid id
      // otherwise it returns a new widget
      widget: function(id, data) {
        var w;
        if (id && widgets[id]) {
          // get the existing widget
          w = widgets[id];
        } else {
          w = new Widget(data);

          // store the widget
          widgets[w.id] = w;
        }

        return w;
      },
      // returns all the widgets
      widgets: function() {
        return widgets;
      },
      // function that removes all the widgets
      removeAll: function() {
        // remove all of the widgets from the playground
        var grid = $('.playground-stack').data('gridstack');
        grid.removeAll();

        // remove the pointers to the widget data
        var keys = Object.keys(widgets);
        for (var i = 0; i < keys.length; i++) {
          delete widgets[keys[i]];
        }
      },
      // function that removes a widget
      removeWidget: function(id) {
        // remove a widget from the playground
        var grid = $('.playground-stack').data('gridstack');
        var widget = $('[widget-id="' + id + '"]').parent().parent();
        grid.removeWidget(widget);

        if (id && widgets[id]) delete widgets[id];
      },
      // function to toggle all the widgets' lock status
      lockAll: function(locked) {
        // lock all of the widgets from the playground
        var grid = $('.playground-stack').data('gridstack');
        if (!locked) grid.enable();
        else grid.disable();

        // update the widgets lock status
        var keys = Object.keys(widgets);
        for (var i = 0; i < keys.length; i++) {
          widgets[keys[i]].locked = locked;
        }
      },
      // function to toggle a widget's lock status
      lockWidget: function(id, locked) {
        // remove a widget from the playground
        var grid = $('.playground-stack').data('gridstack');
        var widget = $('[widget-id="' + id + '"]').parent().parent();
        grid.resizable(widget, !locked);
        grid.movable(widget, !locked);

        if (id && widgets[id]) widgets[id].locked = locked;
      },
      allLocked: function() {
        var all = true;
        // update the widgets lock status
        var keys = Object.keys(widgets);
        for (var i = 0; i < keys.length; i++) {
          if (!widgets[keys[i]].locked) {
            all = false;
            break;
          }
        }
        return all && keys.length !== 0;
      },
      // function that calls the update function for a widget
      updateWidget: function(id) {
        if (id && widgets[id]) {
          // if the widget has been set to remove, do so
          if (widgets[id].remove) {
            WidgetProvider.removeWidget(id);
          // if the widgets data has changed
          } else if (widgets[id].dataChanged) {
            // otherwise update the widget and set its flag to not needing updates
            widgets[id].update();
            widgets[id].dataChanged = false;
          }
        }
      },
      // function that calls the update function all widgets that have changed
      updateWidgets: function() {
        var keys = Object.keys(widgets);
        for (var i = 0; i < keys.length; i++) {
          if (widgets[keys[i]].dataChanged) {
            widgets[keys[i]].update();
            widgets[keys[i]].dataChanged = false;
          }
        }
      },
      // function that saves the widgets into localStorage
      saveWidgets: function() {
        var json = angular.toJson(widgets);

        // if the localstorage object has not be initialized, do so
        if (!angular.isObject($localStorage.PlaygroundWidgets)) $localStorage.PlaygroundWidgets = {};
        // store the JSON string of widget data in local storage
        $localStorage.PlaygroundWidgets = json;
      },
      // promise that tries to loads the widgets from localStorage
      loadWidgets: $q(function(resolve, reject) {
        // get the widgets from local storage
        var json = $localStorage.PlaygroundWidgets;
        // if data was found resolve the promise with it
        if (json) {
          resolve(angular.fromJson(json));
        // otherwise reject the promise with no widgets found
        } else {
          reject('No widgets found');
        }
      }),
      // converts the current widget data into a JSON string
      exportWidgets: function() {
        return angular.toJson(widgets);
      },
      // converts widget JSON into an object
      importWidgets: function(json) {
        return angular.fromJson(json);
      },
      // functionality to test if inputed widget JSON is valid before importing them
      validate: function(widget) {
        var valid = false;

        // check top level attributes for existence in imported widgets
        var defaultAttrs = Object.keys(DEFAULTS);
        var widgetAttrs = Object.keys(widget);
        // lodash.js has a function isEqual() that tests if two arrays have the same values within them
        // Thus testing if each set of widget keys are present (as all are needed to build a widget)
        valid = _.isEqual(defaultAttrs.sort(), widgetAttrs.sort());

        // if they are all present
        if (valid) {
          // check mid level attributes for existence in imported widgets
          defaultAttrs = Object.keys(DEFAULTS.settings);
          widgetAttrs =  Object.keys(widget.settings);
          valid = _.isEqual(defaultAttrs.sort(), widgetAttrs.sort());

          // if they are all present
          if (valid) {
            // check low level attributes for existence in imported widgets
            defaultAttrs = Object.keys(DEFAULTS.settings.advanced);
            widgetAttrs =  Object.keys(widget.settings.advanced);
            valid = _.isEqual(defaultAttrs.sort(), widgetAttrs.sort());
          }
        }

        return valid;
      },
      // opens the widget list dialog. This is done as a $mdPanel because AngularMaterial only allows 1 dialog to be
      // open at a time, and causes scope issues if the advanced widget is opened from the list dialog (if it is a dialog as well)
      // by using the panel no scope change is made so the widgets will be rendered correctly
      widgetList: function(e) {

        // the dialog is 80vh, so center it horizontally and give some padding to the top of the app (10vh)
        var position = $mdPanel.newPanelPosition()
          .absolute()
          .top('10vh')
          .left('10vw');

        // this animation makes the dialog expand from and hide to the button it was triggered by
        var animation = $mdPanel.newPanelAnimation()
          .openFrom('.widgetListTarget')
          .closeTo('.widgetListTarget')
          .withAnimation($mdPanel.animation.SCALE);

        var config = {
          attachTo: angular.element(document.body), // make it a child of the document body
          templateUrl: 'app/templates/core/t-widgetListDialog.html',
          controller: 'widgetListDialogCtrl',
          controllerAs: 'widgetList',
          bindToController: true, // bind vars to the controller instead of passing them in
          position: position,
          animation: animation,
          disableParentScroll: true,
          hasBackdrop: true,
          trapFocus: true, // no other elements outside the dialog can be accesed when it is open
          focusOnOpen: true,
          zIndex: 78,
          clickOutsideToClose: false,
          escapeToClose: true,
        };
        var panelRef = $mdPanel.create(config);
        panelRef.open();
      },
      // shows the import export dialog
      widgetIO: function(e) {
        return $mdDialog
          .show({
            'controller': 'widgetIODialogCtrl as widgetIO',
            'templateUrl': 'app/templates/core/t-widgetIODialog.html',
            'parent': angular.element(document.getElementById('SMPDashbaord')),
            'targetEvent': e,
            'clickOutsideToClose': false,
            'bindToController': true,
          });
      },
      // default page to open on the widget list dialog
      widgetListPage: 1,
      // Parameters for widget menu
      types: ['Text', 'Line Chart', 'Sparkline Chart', 'Sensor Display'],
      sensors: allSensors,
      metrics: [
        {display: 'Sensor', value: 'sensor'},
        {display: 'State', value: 'state'},
        {display: 'Value', value: 'value'},
        {display: 'Units', value: 'units'},
        {display: 'Critical value', value: 'criticalValue'},
        {display: 'Warning Value', value: 'warningValue'},
        {display: 'Max', value: 'max'},
        {display: 'Min', value: 'min'},
        {display: 'Standard Deviation', value: 'stdDev'},
        {display: 'Mean', value: 'mean'},
        {display: 'Time Stamp', value: 'timestamp'},
      ],
      numMetrics: $filter('range')(1, 11, 1),
      widths: [
        {display: 'auto', value: ''},
        {display: 5, value: 5},
        {display: 10, value: 10},
        {display: 15, value: 15},
        {display: 20, value: 20},
        {display: 25, value: 25},
        {display: 30, value: 30},
        {display: 33, value: 33},
        {display: 35, value: 35},
        {display: 40, value: 40},
        {display: 45, value: 45},
        {display: 50, value: 50},
        {display: 55, value: 55},
        {display: 60, value: 60},
        {display: 65, value: 65},
        {display: 66, value: 66},
        {display: 70, value: 70},
        {display: 75, value: 75},
        {display: 80, value: 80},
        {display: 85, value: 85},
        {display: 90, value: 90},
        {display: 95, value: 95},
        {display: 100, value: 100}],
      fills: [
        {display: 'Blue', value: 'primary-fill white-text'},
        {display: 'Dark Blue', value: 'primary-hue1-fill white-text'},
        {display: 'White', value: 'white-fill black-text'},
        {display: 'Grey', value: 'background-fill black-text'},
        {display: 'Orange', value: 'accent-fill white-text'},
        {display: 'Red', value: 'warn-fill white-text'},
        {display: 'Black', value: 'black-fill white-text'}
      ],
      lineHeights: $filter('range')(2, 9),
      sparklineHeights: $filter('range')(1, 10),
      classes: [
        {display: 'Header 1', value: 'md-display-4'},
        {display: 'Header 2', value: 'md-display-3'},
        {display: 'Header 3', value: 'md-display-2'},
        {display: 'Header 4', value: 'md-display-1'},
        {display: 'Header 5', value: 'md-headline'},
        {display: 'Header 6', value: 'md-title'},
        {display: 'Sub Header', value: 'md-subhead'},
        {display: 'Body 1', value: 'md-body-1'},
        {display: 'Body 2', value: 'md-body-2'},
        {display: 'Caption', value: 'md-caption'}
      ],
      alignments: [
        {display: 'left', value: 'start center'},
        {display: 'center', value: 'center center'},
        {display: 'right', value: 'end center'}
      ],
    };

    // --------------------------------------------------------------------------------- //
    // ------------------------------- THE WIDGET OBJECT ------------------------------- //
    // --------------------------------------------------------------------------------- //

    // default parameters for the widgets
    var DEFAULTS = {
      id: undefined, // the id of the widget (used to store it within this service)
      x: 0, y: 0, // x and y position on grid
      w: 3, h: 3, // width and height of widget
      autoPos: true, // put the widget in the first place it will fit (disregards x and y)
      locked: false, // if the widget is locked (cannot be moved or resized)
      remove: false, // if the widget should be removed
      dataChanged: false, // if the data of the widget was changed and thus the display needs updating
      settings: {
        type: '', // what type of visualization the widget will have
        namespace: '', // the namespace the sensor that widget is monitoring is in
        namespaceIdx: -1, // the index of the namespace wrt all the namespaces
        sensor: '', // the sensor the widget is monitoring
        sensorIdx: -1, // the index of the sensor wrt all the sensors
        item: '', // the item the widget is monitoring
        itemIdx: -1, // the index of the item wrt all the sensors
        unit: '', // the unit the sensor is mesured in
        advanced: {
          text: '', // what text to show in a text widget
          class: 'md-headline', // how to style the text in a text widget
          alignment: 'center center', // how to align the text in a text widget
          lineChartHeight: 3, // the height of a line chart (measured in cells of the grid which are 3 em tall, so 1 = 3em)
          sparklineChartHeight: 2, // the height of a sparkline chart (measured in cells of the grid which are 3 em tall, so 1 = 3em)
          showTitle: true, // should a chart have a title (displaying sensor information)
          showXAxis: true, // should a chart show the x axis
          showYAxis: true, // should a chart show the y axis
          chartTitle: '', // should a chart show the x axis
          labelXAxis: '', // should a chart show the x axis
          labelYAxis: '', // should a chart show the y axis
          numMetrics: 5, // how many metrics are shown on a sensor display
          metrics: ['state','sensor','max','min','value'], // the metrics shown on the sensor display
          widths: ['','','','',''], // the widths of each metric container (blank or auto means it will be automatically desided to fit)
          fills: ['','primary-fill white-text','','',''], // the style of the metric container and text
          showMetricLabel: true, // label the matrics shown on the sensor display
          sensorDisplayEditOption: 'metric' // default dropdowns to show while editing sensor display
        },
      }
    };

    // constructer for new widget
    function Widget(data) {
      // have to copy the default parameters so each widget has a different location in memory
      var d;
      if (data) {
        d = data;
        d.autoPos = false;
      } else {
        d = jQuery.extend(true, {}, DEFAULTS);
      }

      this.id = moment().valueOf(); // id is number of miliseconds since Unix Epoch
      this.x = d.x;
      this.y = d.y;
      this.w = d.w;
      this.h = d.h;
      this.locked = d.locked;
      this.remove = false;
      this.autoPos = d.autoPos;
      this.settings = d.settings;
      this.dataChanged = false; // if the widget needs to be updated

      // return its id
      return this;
    }

    // function to open a widgets menu
    Widget.prototype.openMenu = function(e) {
      var winWidth = $(window).width();
      var winHeight = $(window).height();

      var position = $mdPanel.newPanelPosition()
        .absolute()
        .centerHorizontally()
        .top((e.clientY - 5) + 'px')
        .left(e.clientX + 'px');

      var animation = $mdPanel.newPanelAnimation()
        .openFrom({
          'top': e.clientY,
          'left': e.clientX
        })
        .closeTo({
          'top': e.clientY,
          'left': e.clientX
        })
        .withAnimation($mdPanel.animation.FADE);

      var config = {
        attachTo: angular.element(document.body),
        templateUrl: 'app/templates/core/t-widgetMenu.html',
        controller: 'widgetMenuCtrl',
        controllerAs: 'widgetMenu',
        locals: {
          'widgetId': this.id,
          'panelClass': 'widgetMenuPanel',
        },
        position: position,
        animation: animation,
        disableParentScroll: true,
        hasBackdrop: true,
        trapFocus: false,
        focusOnOpen: true,
        zIndex: 80,
        clickOutsideToClose: false,
        escapeToClose: true,
      };
      var panelRef = $mdPanel.create(config);
      panelRef.open()
        // finally function is used to reposition the panel if its default position would
        // render some of its contents off screen (very hard to use when buttons are hidden)
        .finally(function() {
          // extract from the panelRef the panel container (fills whole screen) and panel (what users interact with)
          var panelContainer = panelRef._panelContainer;
          var panel = panelRef._panelEl;

          // get the height and width of both elements, as well as the offsets from the top and left
          // the panel is with regard to the container (for calculating where the panel is displayed)
          var contHeight = panelContainer.height();
          var contWidth = panelContainer.width();
          var panelHeight = panel.height();
          var panelWidth = panel.width();
          var panelOffsetT = panel.offset().top;
          var panelOffsetL = panel.offset().left;

          var translateY = 0;
          // if the bottom of the panel is below the last 25px of the container then
          // move it up to be exactly 25px from the contaitners bottom.
          // This is done by calculating the number of pixels up the panel needs to be moved
          if (contHeight - 25 <= panelHeight + panelOffsetT) {
            translateY = (contHeight - panelHeight - 25) - panelOffsetT;
          }
          var translateX = 0;
          // if the right of the panel is right(er) than 25px of the container's right edge then
          // move it up to be exactly 25px from the contaitners right edge.
          // This is done by calculating the number of pixels left the panel needs to be moved
          if (contWidth - 25 <= panelWidth + panelOffsetL) {
            translateX = (contWidth - panelWidth - 25) - panelOffsetL;
          }

          // apply the tranlation in addition to the translateX(-50%) to center the menu on the button clicked
          panel.css('transform', 'translateX(-50%) translate(' + translateX + 'px, ' + translateY + 'px)');
        });
    };

    // opens a widgets advanced menu dialog
    Widget.prototype.openAdvMenu = function(e, t) {
      $mdDialog
        .show({
          'controller': 'widgetAdvMenuCtrl as widgetAdvMenu',
          'bindToController': true,
          'locals': {
            'widgetId': this.id, // the id is important so the widget menu can update the correct widget
            'type': t // the type defines what template will be shown on the advanced menu (text widgets have different settings than line charts)
          },
          'templateUrl': 'app/templates/core/t-widgetAdvancedMenu.html',
          'parent': angular.element(document.getElementById('SMPDashbaord')),
          'targetEvent': e,
          'clickOutsideToClose': false
        });
    };

    // the widgets implement this method to update their data and html.
    Widget.prototype.update = function(e) {
      console.log('widgets must implement Widget.update() for visualizations to be shown.');
    };

    // --------------------------------------------------------------------------------- //
    // ----------------------- DASHBOARD CALL TO GET ALL SENSORS ----------------------- //
    // --------------------------------------------------------------------------------- //

    // calls the dashboardApi to get all the sensors
    dashboard.getSensors()
      .then(function(data) {
        respHandler(data);
      });

    // takes the returned array of sensor objects and builds a heirachical structure
    /*SCHEMA
      sensors = {
          namespace: {
            sensor: {
              units: string,
              items: [
                string,
                ... (more items)
              ]
            },
            ... (more sensors)
          },
          ... (more namespaces)
        }
      }
    */
    function respHandler(data) {
      if (data) {
        var sensors = {};

        var namespace; var sensor; var item; var units;
        for (var i = 0; i < data.length; i++) {
          namespace = data[i].namespace;
          sensor = data[i].sensor;
          item = data[i].item;
          units = data[i].units;

          if (!sensors[namespace]) {
            sensors[namespace] = {};
          }
          if (!sensors[namespace][sensor]) {
            sensors[namespace][sensor] = {};
            sensors[namespace][sensor] = {
              'units': units,
              'items': []
            };
          }
          sensors[namespace][sensor].items.push(item);
        }

        WidgetProvider.sensors = sensors;
      }
    }
    return WidgetProvider;
  }]);
})();
