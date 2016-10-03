(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('playgroundCtrl', ['$rootScope', '$scope', '$timeout', '$interval', '$compile', 'dashboard', 'WidgetProvider', function($rootScope, $scope, $timeout, $interval, $compile, dashboard, WidgetProvider) {
    var _this = this;

    _this.widgets = WidgetProvider.widgets();
    // create the grid
    $('.playground-stack').gridstack({
      cellHeight: '48px',
      verticalMargin: 20,
      animate: true,
      float: true,
      'data-gs-min-width': 2,
      'data-gs-min-height': 1
    });
    _this.grid = $('.playground-stack').data('gridstack');

    // local vars allowing access to functions
    _this.fabAction = fabAction;
    _this.isLocked = isLocked;

    _this.saveStatus = 0; //0: not saved, 1: sucessfully saved, -1: error saving, 2: saving
    _this.clearGridPercent = 0;
    _this.lockedGrid = isLocked();

    init();
    // tries to load saved widgets from sessionStorage to populate the playground with
    function init() {
      WidgetProvider.loadWidgets.then(
        function(widgets) {
          var widget;
          var keys = Object.keys(widgets);
          for (var i = 0; i < keys.length; i++) {
            widget = addWidget(widgets[keys[i]]);
          }
        }, function(msg) {
          // if there are no widgets put a blank one up
          addWidget();
        }
      );

    }

    // handles all the actions possible via the Playgroud FAB
    function fabAction($event, type) {
      switch (type) {
        case 'add':
          addWidget();
          break;
        case 'startClear':
          startClearTimer();
          break;
        case 'cancelClear':
          cancelClearTimer();
          break;
        case 'lock':
          lockWidgets();
          break;
        case 'save':
          saveWidgets($event);
          break;
        case 'io':
          ioWidgets($event);
          break;
        case 'list':
          openWidgetList($event);
          break;
        case 'enter':
          fabHandler('enter');
          break;
        case 'leave':
          fabHandler('leave');
          break;
      }

      _this.lockedGrid = isLocked();
      // stop propogation of events so FAB stays open
      $event.stopImmediatePropagation();
    }

    // function to create and add new widgets to the playground
    function addWidget(data) {
      // create a new widget
      var widget = WidgetProvider.widget(undefined, data);
      var html = '<div><div flex="100" class="grid-stack-item-content hideOverflow" md-whiteframe="1"><smp-widget widget-id="' + widget.id + '"></smp-widget></div></div>';
      var el = $compile(html)($scope);

      // put the widget on the playground
      _this.grid.addWidget(el, widget.x, widget.y, widget.w, widget.h, widget.autoPos);

      // lock the widget if it has the lock flag = true
      WidgetProvider.lockWidget(widget.id, widget.locked);

      return widget;
    }

    // var to hold the interval ref
    var clearTimer;
    function startClearTimer() {
      // cancel any clear timer active (up or down)
      $interval.cancel(clearTimer);
      // cancel the timeout for delaying the reset
      $timeout.cancel(resetTimeout);

      // always incremeny by 10 initialy to show that something is going on
      _this.clearGridPercent += 10;

      // start the incrementing clearTimer (progress made for clear)
      clearTimer = $interval(function() {
        // increment by 20 every 100 ms (max 1/2 second hold)
        _this.clearGridPercent += 20;
        // when the timer reaches 100 clear the grid, reset the timer, and cancel the interaval
        if (_this.clearGridPercent >= 100) {
          cancelClearTimer();
          removeWidgets();
        }
      }, 100);
    }

    var resetTimeout;
    // resets the timer, and cancels the interval
    function cancelClearTimer() {
      // cancel any clear timer active (up or down)
      $interval.cancel(clearTimer);
      // cancel the timeout for delaying the reset
      $timeout.cancel(resetTimeout);

      resetTimeout = $timeout(function() {
        clearTimer = $interval(function() {
          // decrementing by 20 every 100 ms (max 1/2 second reset)
          _this.clearGridPercent -= 20;
          // when the timer reaches 0 reset the timer, and cancel the interaval
          if (_this.clearGridPercent < 0) {
            $interval.cancel(clearTimer);
            _this.clearGridPercent = 0;
          }
        }, 100);
      }, 50);
    }
    // function to remove all widgets from the playground
    function removeWidgets() {
      WidgetProvider.removeAll();
    }

    function lockWidgets() {
      WidgetProvider.lockAll(!_this.lockedGrid);
    }

    function isLocked() {
      console.log('lcoleas');
      return WidgetProvider.allLocked();
    }

    function openWidgetList($event) {
      WidgetProvider.widgetList($event);
    }

    // saves the widgets locally
    function saveWidgets() {
      _this.saveStatus = 2;

      // this is almost instantanious but...
      WidgetProvider.saveWidgets();

      // ... simulate a saving time so the user knows something is going on and doesn't spam the button
      $timeout(function() {
        _this.saveStatus = 1;

        $timeout(function() {
          _this.saveStatus = 0;
        }, 1000);
      }, 1000);
    }

    // opens the save widet dialog. Also handles the response if the user imported widgets
    function ioWidgets($event) {
      var ioPromise = WidgetProvider.widgetIO($event)
        .then(function(widgets) {
          // if the user imported widgets
          if (widgets) {
            // remove the current widgets
            removeWidgets();

            // loop through all the imported ones adding them to the playground
            var widgetIds = Object.keys(widgets);
            for (var i = 0; i < widgetIds.length; i++) {
              addWidget(widgets[widgetIds[i]]);
            }
          }
        });
    }

    // when the user moves the mouse away from the playground FAB do not close it immidiately
    var mouseLeaveListener;
    function fabHandler(type) {
      if (type === 'enter') {
        $timeout.cancel(mouseLeaveListener);
        _this.fabOpen = true;
      } else {
        mouseLeaveListener = $timeout(function() {
          _this.fabOpen = false;
        }, 1500);
      }
    }

    // the tabs themselves are a midway point for the update call
    // this allows only the viz tools that are shown to be updated (reducing lag)
    dashboard.subscribe($scope, update); // subscribe to the dashboard update call
    $scope.$on('renderComplete', function(event, args) {update(args);}); // when visualization tool held in the tab are done rendering they emit this so they will be populated

    // intercept the broadcast, and only update the data if currently selected tab.
    var clearData = false;
    function update(args) {
      clearData = clearData || args.clearData;
      if ($rootScope.curTab === 'playground') {
        $scope.$broadcast('updateData', {'clearData': clearData});
        clearData = false;
      }
    }
  }]);
})();
