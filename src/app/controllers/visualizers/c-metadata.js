(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('metadataCtrl', ['$scope', '$element', '$document', '$window', '$timeout', '$q', 'dashboard', function($scope, $element, $document, $window, $timeout, $q, dashboard) {
    var pElem = $element.parent();
    var tabElem = $element.parents('md-tab-content');

    var elem = $element.detach();
    elem.appendTo('body');

    var overListener;
    var outListener;
    var visible = false;
    var gotData = false;

    // default position (although it will never been shown in this position)
    $scope.pos = {left:  0, top: 0};

    pElem.on('mouseover', function(event) {
      // Cancel mouseout
      $timeout.cancel(outListener);
      outListener = undefined;

      if (!visible) {
        // using timouts and listeners I can make the popup show after hovering for x amount of time (1 second here)
        // it is important to set the timeout to a var as when the mouse if moved and does not hover over this
        // element the popup shold not show so the timeout needs to be canceled $timeout.cancel(overListener)
        // this also makes it so REST calls are only made when the popup shows instead of the instant a mouse over
        // event is triggered (that would be A LOT of useless REST calls)
        overListener = $timeout(function() {
          // Get the meda data, and chain the promises so only after the data was retieved will the data be parsed, and only after that the popup will be shown
          if (!gotData) {
            dashboard.getSensor($scope.namespace, $scope.sensor, $scope.item)
              .then(function(data) {
                populateMetadata(data)
                  .then(function() {
                    showMetadata(event);
                    gotData = true;
                  });
              });
          } else {
            showMetadata(event);
          }
        }, 1000);
      }
    });

    // when leaving the parent element hide the metadata popup
    pElem.on('mouseout', function(event) {
      hideMetadata();
    });

    // when hovering over the metadata popup keep it open
    $scope.hoverMeta = false;
    $element.on('mouseover', function(event) {
      $scope.hoverMeta = true;
    });
    // when leaving the popup menu close it.
    $element.on('mouseout', function(event) {
      $scope.hoverMeta = false;
      hideMetadata();
    });

    function hideMetadata() {
      // cancel mouseover
      $timeout.cancel(overListener);
      overListener = undefined;
      if (visible) {
        // similar functionality to mouseover
        outListener = $timeout(function() {
          if (!$scope.hoverMeta) {
            // hide the popup
            $element
              .removeClass('visible')
              .addClass('hidden');

            visible = false;
          }
        }, 250);
      }
    }

    function showMetadata(event) {
      // insert the metadata popup's DOM element into the DOM, However it is still "hidden" (opacity = 0), this is changed once the position is set
      visible = true;

      // timeout for 0 miliseconds simply puts the function onto the queue for being called, thus the popup will be inserted into the DOM
      // before this is called (because the insertion is already in the queue due to the visible = tue above).
      // This allows for calls such as clientWidth and height() to be accurate so I can place the popup in the right spot.
      $timeout(function() {
        // ALL MEASURED IN PX
        var winW = $window.innerWidth; // width of the browser window (including scrollbar width)
        var winH = $window.innerHeight; // height of the iframe (toolbar down to bottom of browser window)
        var scrollW = tabElem.innerWidth() - tabElem.prop('scrollWidth'); // width of the vertical scrollbar
        var scrollX = tabElem.scrollLeft(); // distance the user has scrolled from the absolute left of the page
        var scrollY = tabElem.scrollTop();  // distance the user has scrolled from the absolute top of the iframe
        //var toolbarHeight = $('md-tabs-wrapper').height(); // height of the toolbar
        var elemW = $element[0].clientWidth; // width of the metadata popup
        var elemH = $element[0].clientHeight; // height of the metadata popup
        var sidePad = 10; // amount of padding I want when placing the metadata popup on the edge of the screen

        // get the position of the mouse when the event was fired.
        // Move it up and left 5 pixels so the mouse is slightly over the top left corner of the popup
        var elemX = event.clientX - 5;
        // position is relative to bottom of toolbar but event is based from top of toolbar, so account for that
        var elemY = event.clientY - 5;

        // check to see if the right most of the elemet is off the window's right edge
        if (elemX + elemW + scrollW > winW) {
          // if so move it left so the right most of the elment is 10 pixels to the left of the vertical scrollbar
          elemX = scrollX + winW - elemW - scrollW - sidePad;
        }
        // check to see if the bottom of the element is off the window's bottom edge
        if (elemY + elemH > winH) {
          // if so move it up so the bottom of the element is 10 pixels above the bottom of the window
          elemY = scrollY + winH - elemH - sidePad;
        }

        // put the position vars into the scope so the template can use them
        $scope.pos = {left: elemX, top: elemY};

        // make the popup visible
        $element
          .removeClass('hidden')
          .addClass('visible');
      }, 0);
    }

    // parses the returned data from the server putting it into the scope so the DOM can display it
    function populateMetadata(data) {
      // use promises so drawing of the popup only happens after retrieval of the data
      return $q(function(resolve, reject) {
        if (data) {
          // if there is data and the data is defined take that value, otherwise set the value to "Not Set"
          if (data.criticalValue === '' || data.criticalValue === undefined) {
            $scope.critVal = 'Not Set';
          } else {
            $scope.critVal = data.criticalValue + '' + data.units;
          }

          if (data.warningValue === '' || data.warningValue === undefined) {
            $scope.warnVal = 'Not Set';
          } else {
            $scope.warnVal = data.warningValue + '' + data.units;
          }

          if (data.description === '' || data.description === undefined) {
            $scope.desc = 'This sensor does not have a description.';
          } else {
            $scope.desc = data.description;
          }
          resolve('got data');
        } else {
          reject('no data');
        }
      });
    }
  }]);
})();
