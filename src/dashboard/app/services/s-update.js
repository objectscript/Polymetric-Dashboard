/*
Author: Carter DeCew Tiernan
*/

(function() {
  'use strict';

  var app = angular.module('Update', []);

  /*  Handles updating the visualization tools */
  app.factory('UpdateProvider', ['$timeout', '$filter', '$window', 'dashboard', function($timeout, $filter, $window, dashboard) {
    // --------------------------------------------------------------------------------- //
    // ------------------------------ THE UPDATE PROVIDER ------------------------------ //
    // --------------------------------------------------------------------------------- //
    var delays = {};

    var UpdateProvider = {
      updater: function(el, sc, lu, cb) {
        return new Updater(el, sc, lu, cb);
      }
    };

    function Updater(el, scope, lu, cb) {
      var self = this;

      self.element = el;
      self.initialUpdate = lu;
      self.lastUpdate = lu; // the initial last update of the component
      self.callBack = cb; // the callback to call when the component needs to be updated
      self.readingInterval = undefined;
      self.delay = function(lU) {
        delay(self, lU);
      };

      update(self, {clearData: false}); // if the component is visible update (this will initialize and update data).
      // on a tab or data setting change, this event is broadcasted
      scope.$on('updateData', function(event, args) {
        args.force = true; // if the update call comes from the dashboard broadcast, force an update
        update(self, args); // when tabs change update (this will initialize (if not done already) and update data).
      });
      scope.$on('$destroy', function(event) {
        $timeout.cancel(self.lastDelay);
        delete this;
        self = undefined;
      });
      return this;
    }

    // functionality that delays the update call of the compnent
    function delay(self, lU) {
      // cancel the lastDelay to keep multiple requests from being sent to the sever at a time
      $timeout.cancel(self.lastDelay);

      var delay = getUpdateDelay(self, lU);
      self.lastUpdate = lU; // update the comonents last update

      // sets up the timeout to the next update call
      self.lastDelay = $timeout(function() {
        update(self, {clearData: false}); // update call
      }, delay);

      delays[self.lastDelay.$$timeoutId] = self.lastDelay;
      self.lastDelay
        .then(function(e) {
          delete delays[self.lastDelay.$$timeoutId];
        }, function() {
          delete delays[self.lastDelay.$$timeoutId];
        });
    };

    // calculates how many miliseconds to wait before making the next update call
    function getUpdateDelay(self, lU) {
      var delay;
      // the interval is the number of seconds defined by the dashboard api
      // however, if System Interval is selected, then use the number of seconds between each reading (defined by the backend)
      var interval = dashboard.meta.samplePeriod === '0' ? self.readingInterval : dashboard.meta.samplePeriod;
      // no data was aquired this request
      if ((!self.lastUpdate || self.lastUpdate === -1) && (!lU || lU === -1)) {
        delay = interval * 1000; // if the delay is negative wait a full sample period (multiply by 1000 to convert senconds into miliseconds)
      // data was aquired this request
      } else {
        var nextReadingTime = $filter('TStoUnix')(lU) + interval * 1000; // next reading time is the last update time plus one sample interval (multiply by 1000 to convert senconds into miliseconds)
        var now = moment.utc().valueOf();
        delay = nextReadingTime - now;
        if (delay <= 0) {
          delay = interval * 1000; // if the delay is negative wait a full sample interval (multiply by 1000 to convert senconds into miliseconds)
        }
      }
      // Always add 2 seconds to the delay to make sure that the data is ready on the server
      // This also makes the sensor display try to get new data in 2 seconds if it previously got data, but no data was retrieved in the last call
      return delay + 2000;
    }

    function update(self, args) {
      if (args.clearData === true) self.lastUpdate = self.initialUpdate;

      if (args.force || isVisible(self)) {
        if (needData(self)) {
          self.callBack(args);
        } else {
          delay(self, self.lastUpdate);
        }
      }
    }

    function isVisible(self) {
      return self.element.css('visibility') === 'visible';
    };

    // Tests if the current data is out-of-date (needs to update it)
    function needData(self) {
      var prev = $filter('TStoUnix')(self.lastUpdate);
      var sampInt = dashboard.meta.samplePeriod === '0' ? self.readingInterval : dashboard.meta.samplePeriod;
      var now = moment.utc().subtract(sampInt, 'seconds').valueOf();
      return prev < now;
    };

    // hooks into the blur and focus events of the browser to set a flag based on if the user is currently viewing the dashboard or doing something else
    angular.element($window).on('blur focus', function(e) {
      switch (e.type) {
        case 'blur':
          // cancel all delays to keep requests from being sent when the tab is not active
          var delayKeys = Object.keys(delays);
          for (var i = 0; i < delayKeys.length; i++) {
            $timeout.cancel(delays[delayKeys[i]]);
            delete delays[delayKeys[i]];
          }
          break;
        case 'focus':
          // when the tab regains focus, make the update call so charts will get new data
          dashboard.notify({clearData: false});
          break;
      }
    });

    return UpdateProvider;
  }]);
})();
