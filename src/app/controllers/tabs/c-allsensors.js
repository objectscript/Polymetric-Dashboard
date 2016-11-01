(function() {
  'use strict';

  var tab = angular.module('tabs');

  tab.controller('allsensorsCtrl', ['$rootScope', '$scope', '$mdDialog', 'dashboard', function($rootScope, $scope, $mdDialog, dashboard) {
    var _this = this;
    var queryText = '';

    // Get all the sensors from the DB
    dashboard.getSensors() // Get all the sensors from the DB
      .then(function(data) {
        initSearch(data);
      });

    function initSearch(data) {
      _this.allSensors = data;
      _this.resultSensors = _this.querySearch(undefined, false);
    }

    // pinned searches are put here, allowing for the creating of unions of multiple filtered sensor sets
    _this.filters = [];

    // save the current page of the list of all sensors
    _this.curPage = 1;

    // arrays to hold the sensors
    _this.allSensors = []; // all the sensors in the DB
    _this.filteredSensors = []; // the sensors that passed the filters inputted by the user (the search results)
    _this.resultSensors = []; // the sensors that are displayed as sensor rows

    // vars used by the search functionality
    _this.searchText = ''; // the text in the search bar
    _this.selectedSensor = ''; // the selected item set when clicking a search result in the dropdown of the search bar

    // setting local functions to vars allows them to be called from the html
    _this.querySearch = querySearch;
    _this.selectedSensorChange = selectedSensorChange;
    _this.filterChange = filterChange;

    // returns the filtered se of all the sensors
    function querySearch(queryText, queryFuzzy) {
      // if no results autcomplete suggestions should return all the sensors
      var noFilter = false;
      // there are two search terms, the sensor and the item.
      // If either are present, or there are filters appilied, filter the sensors otherwise return all the sensors
      _this.filteredSensors = (queryText || _this.filters.length !== 0) ? _this.allSensors.filter(createFilterFor(queryText)) : noFilter = true;

      // query search only returns the sensors that match the query text because the suggestions should not reflect
      // the sensors returned via filters.
      var returnSensors;
      if (!noFilter) {
        if (queryText !== undefined) {
          returnSensors = [];
          for (var i = 0; i < _this.filteredSensors.length; i++) {
            if (_this.filteredSensors[i].matchType === 'query') returnSensors.push(_this.filteredSensors[i]);
          }
        } else {
          returnSensors = _this.filteredSensors;
        }
      } else {
        returnSensors = _this.allSensors;
      }
      return returnSensors;
    }

    // filters all the sensors based on the search terms (sensor and item)
    function createFilterFor(queryText) {
      var filters = [];
      var lowercaseQueryText;

      // this long test only puts the current query on the filter list if it is currently being typed
      // allowing for the autocomplete to suggest things while the displayed rows are static through
      // typing, removing of filters, and on page load
      if (queryText || queryText === '') {
        // lowercase the search terms so the search is case in-sensitive
        lowercaseQueryText = angular.lowercase(queryText);
        // put the current query onto the filters array
        filters.push({'text': lowercaseQueryText, 'type': 'query'});
      }

      // add all the current filters to the filters array
      var filterText;
      for (var i = 0; i < _this.filters.length; i++) {
        // extract the current filters search terms
        filterText = _this.filters[i];
        // lowercase the search terms so the search is case in-sensitive
        lowercaseQueryText = angular.lowercase(filterText);
        filters.push({'text': lowercaseQueryText, type: 'filter'});
      }
      return function filterFn(sensor) {
        // lowercase the sensor data so the search is case in-sensitive
        var sensorText = angular.lowercase(_this.getSensorText(sensor)); //sensor.namespace + '' + sensor.sensor + '' + sensor.item);

        // test all filters to see if the sensor is a match
        var match;
        for (var j = 0; j < filters.length; j++) {
          match = false;
          if (sensorText.indexOf(filters[j].text) !== -1) {
            match = true;
          }
          // matchType functions to differenciate which sensors were returned from the query terms or the fileters
          // as only the ones returned by the query terms should appear in the searchbox dropdown
          sensor.matchType = filters[j].type;
          if (match) return sensor;
        }
      };
    }

    // called when the form is submitted (either by clicking a result or hitting enter)
    function selectedSensorChange(sensor) {
      // ignore undefined selections
      if (sensor) {
        if (typeof sensor === 'object') {
          var sensorText = _this.getSensorText(sensor);
          _this.querySearch(sensorText, false);
        } else if (typeof sensor === 'string') {
          // hides the autocomplete when enter is pressd
          var autoChild = document.getElementById('allsensorsSearchBar').firstElementChild;
          var el = angular.element(autoChild);
          el.scope().$mdAutocompleteCtrl.hidden = true;
        }
        // update the displayed sensor rows with the currently filtered sensors
        _this.resultSensors = _this.filteredSensors;
        // save the current searchText (used for pinning searches for unions) if it is unique
        _this.filterChange(_this.searchText, 'add');

        // reset the search box to a blank string
        _this.searchText = '';
        queryText = '';
      }
    }

    // Function to transform sensor obj into a string
    _this.getSensorText = function(sensor) {
      return '[' + sensor.namespace + '] ' + sensor.sensor + ', ' + sensor.item;
    };

    // handles the removing and adding of filters
    function filterChange(filter, type) {
      if (filter && type) {
        // try and find the filter
        var idx = _this.filters.indexOf(filter);

        // add only if it doesn't already exist
        if (type === 'add' && idx === -1) {
          // add the filter (searchText)
          _this.filters.push(filter);
        // remove only if it does exist
        } else if (type === 'remove' && idx !== -1) {
          // remove one item at the found index
          _this.filters.splice(idx, 1);
          // redo query without filter (undefined disregards search term)
          _this.resultSensors = _this.querySearch(undefined, false);

          // reset the search box to a blank string
          _this.searchText = '';
          queryText = '';
        }
      }
    }

    // the tabs themselves are a midway point for the update call
    // this allows only the viz tools that are shown to be updated (reducing lag)
    dashboard.subscribe($scope, update); // subscribe to the dashboard update call

    // intercept the broadcast, and only update the data if currently selected tab.
    var clearData = false;
    function update(args) {
      clearData = clearData || args.clearData;
      if ($rootScope.curTab === 'allsensors') {
        $scope.$broadcast('updateData', {'clearData': clearData});
        clearData = false;
      }
    }
  }]);
})();
