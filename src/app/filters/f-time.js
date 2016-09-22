(function() {
  'use strict';

  var filter = angular.module('filters');

  var TSFORMAT = 'YYYY-MM-DD HH:mm:ss';

  // converts a moment into a Timestamp formatted string
  filter.filter('toTS', function() {
    return function(moment) {
      return moment.format(TSFORMAT);
    };
  });

  // converts a Timestamp string into the number of miliseconds since the Unix Epoch
  filter.filter('TStoUnix', function() {
    return function(timestamp) {
      var utc = moment.utc(timestamp, TSFORMAT);
      return utc.valueOf();
    };
  });

  // converts the number of miliseconds since the Unix Epoch into a local string (timezones are accounted for, format of string is passed to function)
  filter.filter('UnixtoLocal', ['dashboard', function(dashboard) {
    return function(unixMilisecs, format) {
      var m = moment.utc(unixMilisecs);

      var tz = dashboard.meta.timezone;

      return moment.tz(m, tz).format(format);
    };
  }]);

  // converts a Timestamp string into a local string (timezones are accounted for, format of string is passed to function)
  filter.filter('TStoLocal', ['dashboard' ,function(dashboard) {
    return function(timestamp, format) {
      var utc = moment.utc(timestamp, TSFORMAT);
      //TODO: MAKE IT MORE THAN GUESS TIMEZONE
      var tz = dashboard.meta.timezone;

      return moment.tz(utc, tz).format(format);
    };
  }]);
})();
