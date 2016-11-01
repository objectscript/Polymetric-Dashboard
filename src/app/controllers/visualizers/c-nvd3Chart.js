(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('nvd3ChartCtrl', ['$scope', '$filter', '$element', '$timeout', '$interval', '$q', '$window', '$log', 'dashboard', function($scope, $filter, $element, $timeout, $interval, $q, $window, $log, dashboard) {
    var chart;
    var chartSVG;
    var chartData = [{
      'key': $scope.namespace + ', ' + $scope.sensor + ', ' + $scope.item,
      'values': []
    }];
    var chartColors = ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E'];
    var chartForceY = null;
    var sensorProps;
    var lastUpdate;
    var updateClock;
    var calculatedDataReady;
    var chartDataReady;
    var setupChartReady;

    // This is the main workflow director of the charts. It is called initially (if the chart is visible) and during any tab changes or update ticks from the dashboard
    // it will initialize the chart (if not already done so) otherwise it will just get new data
    $scope.$on('updateData', function(event, args) {control(args);});
    if ($element.css('visibility') === 'visible') control({clearData: false});
    function control(args) {
      // chart will be undefined if the chart has not been initialized
      if (!chart) {
        init() // initialize the chart if it has not been done yet
          .then(function() {
            requestData(undefined)
              .then(function(lU) {
                delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
              });
          });
      // Otherwise the chart has already been initialized
      } else {
        if (args.clearData) {
          lastUpdate = undefined; // set lastUpdate to -1 so a whole chart period of data will be requested

          removeData() // passing no arguments removes all data
            .then(function() {
              requestData(lastUpdate)
                .then(function(lU) {
                  delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
                });
            });
        } else {
          requestData(lastUpdate)
            .then(function(lU) {
              delayedUpdate(lU); // calculates the appropriate delay and waits until such time has passed to make the next control call to get data
            });
        }
      }
    }

    // initialized the DOM element and gets data
    function init() {
      return $q(function(resolve, reject) {
        // initial REST call to get static properties of the sensor (also tests if the sensor exists so charts are not created for unknown sensors)
        getSensorProps()
          .then(function(p) {
            sensorProps = p;
            setupChart(); // sets up the charts DOM element

            // only updates the DOM, does not request data
            $scope.$on('updateChartSize', function(event) { drawChart();});

            resolve(); // once the sensor has been confirmed to exist on the server, resolve so the chart can request data from the server
          }, function(e) {
            $log.error(e);
            reject();
          });
      });
    }

    function delayedUpdate(lU) {
      return $q(function(resolve, reject) {
        // cancel and clear the update clock to keep multiple requests from being sent to the sever at a time
        $timeout.cancel(updateClock);
        updateClock = undefined;

        lastUpdate = lU; // update the lastUpdate global
        var delay = getUpdateDelay(lU);
        updateClock = $timeout(function() { // $timeout waits the amount of miliseconds returned from getUpdateDelay(lU) before calling control() to get more data
          // only continue to get data if the component is visible
          if ($element.css('visibility') === 'visible') control({clearData: false}); // update call
        }, delay);

        resolve();
      });
    }

    // calculates the amount of time to wait until the next set of data is ready on the server
    function getUpdateDelay(lU) {
      var delay;
      // the interval is the number of seconds defined by the dashboard api
      // however, if System Interval is selected, then use the number of seconds between each reading (defined by the backend)
      var interval = dashboard.meta.samplePeriod === '0' ? sensorProps.readingInterval : dashboard.meta.samplePeriod;
      // data was aquired this request
      if (!lastUpdate && !lU) {
        delay = interval * 1000; // if the delay is negative wait a full sample period (multiply by 1000 to convert senconds into miliseconds)
      // no data was aquired this request
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

    // gets the sensors properties (state, critical value, warning value and units)
    function getSensorProps(lU) {
      return $q(function(resolve, reject) {
        // get the units, warning value and critical value as well as the System Interval (how many seconds between each reading) of the sensor
        dashboard.getSensor($scope.namespace, $scope.sensor, $scope.item)
          .then(function(p) { // if the sensor was found resolve its props
            if (p) {
              resolve(p);
            } else { // otherwise reject (no reason to do anything else if the sensor does not exist)
              reject('The chart was not created because the sensor "[' + $scope.namespace + '] ' + $scope.sensor + ', ' + $scope.item + '" was not found.');
            }
          });
      });
    }

    // request data makes two seperate REST calls, getting calculated data first, then chart data.
    // The order is important as calculated data determines how the chart data should be dipslayed
    function requestData(lU) {
      return $q(function(resolve, reject) {

        // only make the rest calls if the chart needs new data
        if (!lU || needNewData(lU)) {
          calculatedDataReady = false;
          chartDataReady = false;

          dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined, sensorProps.readingInterval)
            .then(function(resp) {
              calculatedDataResponseHandler(resp) // determined the charts color, y axis range based of state, max and min values
                .then(function() {
                  calculatedDataReady = true;
                  // if the chart has been initialized (it may not be if the initialization process has not finished, the calls are async) update the charts view
                  if (chart) drawChart();
                });
            });

          dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, lU, sensorProps.readingInterval)
            .then(function(resp) { // SUCCESS CALLBACK: if call was successful (response could have or not have data)
              chartDataResponseHandler(resp) // stores the new data and records the newest points timestamp (so it knows when new data is needed in the future)
                .then(function(newLU) {
                  var oldestPoint; // the oldest possible point that shold be shown on the chart
                  // if newLU is not the same as lU then the server responded with data
                  if (newLU !== lU) {
                    // calculates the time in the past that is the oldest time data should be displayed on the chart (based off newest point on chart)
                    var unix = $filter('TStoUnix')(newLU);
                    oldestPoint = moment.utc(unix).subtract(dashboard.meta.chartWindow, 'seconds').valueOf();
                  // otherwise the server did not respond with data
                  } else {
                    // calculates the time in the past that is the oldest time data should be displayed on the chart (based off current time)
                    oldestPoint = moment.utc().subtract(dashboard.meta.chartWindow, 'seconds').valueOf();
                  }
                  // removes data that is older than the current chart period
                  removeData(oldestPoint)
                   .then(function() {
                      chartDataReady = true;
                      // if the chart has been initialized (it may not be if the initialization process has not finished, the calls are async) update the charts view
                      if (chart) drawChart();
                    });

                  resolve(newLU);
                });
            }, function(errro) { // FAILURE CALLBACK: if there was an internal server error or incorrect uri
              resolve(lU);
            });
        } else {
          resolve(lU);
        }
      });
    }

    // test to see if new data is needed (last update is more than a sample interval in the past)
    function needNewData(lU) {
      var prev = $filter('TStoUnix')(lU);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();
      return (prev < now);
    }

    function calculatedDataResponseHandler(resp) {
      return $q(function(resolve, reject) {
        var area = false; // should the area beneith the line be shadded
        var colorIdx = 3; // what color should the line be displayed in
        // sensorProps.state = resp.state; //what is the state of the
        switch (resp.state) {
          case 2: // alert
            area = true;
            colorIdx = 2; // red
            break;
          case 1: // warn
            area = false;
            colorIdx = 1; // yellow
            break;
          case 0: // normal
            area = false;
            colorIdx = 0; // green
            break;
        }
        chartData[0].color = chartColors[colorIdx]; // sets the color of the line
        chartData[0].area = area; // sets if the line should be shaded or not

        // formats the Y axis limits when all data points have the same y value
        if (resp.max === resp.min) {
          if (resp.max === 0) { // if all data has a value of 0
            chartForceY = [0, 1]; // y axis range 0 to 1
          } else { // otherwise show 0 to the max value
            chartForceY = [0, resp.max];
          }
        // otherwise let nvd3 do it automatically
        } else {
          chartForceY = null;
        }

        //toggleStateLims(resp.state);
        sensorProps.state = resp.state;
        resolve();
      });
    }

    function chartDataResponseHandler(resp) {
      return $q(function(resolve, reject) {
        var newLU = lastUpdate;
        if (resp) {
          // if data was returned
          if (resp && resp.length !== 0) {
            // store the last readings timestamp as the last update as it is the newest data point
            newLU = resp[resp.length - 1].timestamp;
            // add the new data to the current data
            chartData[0].values = chartData[0].values.concat(resp);
          }
        }
        resolve(newLU);
      });
    }

    function removeData(oldestPoint) {
      return $q(function(resolve, reject) {
        // if an oldest point was provided only remove data that is older than it
        if (oldestPoint) {
          var curData = chartData[0].values;

          // walk through the chart data oldest->newest (this should mean less itterations) and when a
          // point in the chart is found to be newes than the oldest point break (this is where the data should be split)
          // now = 4
          // chartData = [0,1,2,3,4,5,6,7]
          //       i = 4 -------->
          // [0,1,2,3,4,5,6,7].splice(i, chartData.length) = [4,5,6,7]
          for (var i = 0; i < curData.length; i++) {
            if ($filter('TStoUnix')(curData[i].timestamp) > oldestPoint) break;
          }

          // splice the data to get return the array without the old data
          chartData[0].values.splice(0, i - 1);
        // otherwise clear all the data
        } else {
          chartData[0].values = [];
        }

        resolve();
      });
    }

    function setupChart() {
      setupChartReady = false;
      // parses the attributes that the user specifies, selecting defaults if an option was not defined
      getParams()
        .then(function(params) {
          // creates the chart, and defines its functionality using the sensor properties and visual parameters
          createChart(params)
            .then(function() {
              setupChartReady = true;
              drawChart(); // once the chart has been set up draw it (this shows the data)
            }, function(e) {
              $log.error(e);
            });
        }, function(e) {
          $log.error(e);
        });
    }

    function getParams() {
      return $q(function(resolve, reject) {
        // gets the default parameters for the type of chart
        var params = getDefaultParams($scope.type);
        if (params) {
          // overwrite defaults with user suplied options (if available)
          // margin
          if (!isNaN(parseInt($scope.marginLeft))) params.margin.left = parseInt($scope.marginLeft);
          if (!isNaN(parseInt($scope.marginRight))) params.margin.right = parseInt($scope.marginRight);
          if (!isNaN(parseInt($scope.marginTop))) params.margin.top = parseInt($scope.marginTop);
          if (!isNaN(parseInt($scope.marginBottom))) params.margin.bottom = parseInt($scope.marginBottom);

          // height
          if (!isNaN(parseInt($scope.height))) params.height = parseInt($scope.height);

          // x axis
          if (['true', 'false'].indexOf($scope.xaxisVisible) !== -1) params.xAxis.visible = ($scope.xaxisVisible === 'true');
          if ($scope.xaxisLabel !== '') params.xAxis.label = $scope.xaxisLabel;

          // y axis
          if (['true', 'false'].indexOf($scope.yaxisVisible) !== -1) params.yAxis.visible = ($scope.yaxisVisible === 'true');
          if ($scope.yaxisLabel !== '') params.yAxis.label = $scope.yaxisLabel;

          resolve(params);
        } else {
          reject('Chart type "' + $scope.type + '" is not recognized.');
        }
      });
    }

    function getDefaultParams(type) {
      var defaults;

      switch (type) {
        case 'lineChart':
          defaults = {
            margin: {left: 60, top: 20, right: 60, bottom: 40},
            height: 144,
            xAxis: {
              visible: true,
              label: ''
            },
            yAxis: {
              visible: true,
              label: ''
            }
          };
          break;
        case 'sparklineChart':
          defaults = {
            margin: {left: 0, top: 10, right: 0, bottom: 4},
            height: 48,
            xAxis: {
              visible: true,
              label: ''
            },
            yAxis: {
              visible: true,
              label: ''
            }
          };
          break;
      }

      return defaults;
    }

    function createChart(params) {
      return $q(function(resolve, reject) {
        chart = nv.models.lineChart();

        // DOM element settings
        chart.margin(params.margin); // Margins applied to the outside of the chart
        chart.height(params.height); // Height of the chart

        // chart Y data settings (round to 1 decimel or 0 if value is integer)
        chart.y(function(d) { return Number($filter('number')(d.value, 1).replace('.0', '').replace(',', '')); });
        // yAxis settings
        chart.showYAxis(params.yAxis.visible); // Show/hide the y-axis
        chart.yAxis.axisLabel(params.yAxis.label); // the label its self
        chart.yAxis.axisLabelDistance(-20); // where to horizontally place the y axis label
        chart.yAxis.tickFormat(function(d) { // how to format the ticks on the y axis
          return d + sensorProps.units; // concat the units of the sensor
        });

        // chart X data settings (format the timestamps into unix values)
        chart.x(function(d) { return $filter('TStoUnix')(d.timestamp); });
        // xAxis settings
        chart.showXAxis(params.xAxis.visible); // Show/hide the x-axis
        chart.xAxis.axisLabel(params.xAxis.label); // the label its self
        chart.xAxis.tickFormat(function(d) { // how to format the ticks on the y axis
          return $filter('UnixtoLocal')(d); // convert the unix time (measured in ms) to the local time (format: Jul 13, 1:04pm)
        });

        // tooltip definition
        chart.tooltip.contentGenerator(function(data) {
          var time = $filter('UnixtoLocal')(data.point.x); // convert the unix time (measured in ms) to the local time (format: Jul 13, 1:04pm)
          var val = data.point.y; //$filter('number')(data.point.y, 1).replace('.0', ''); // round to 1 decimel or whole number (if value is an integer)
          // return a string defining the html element of the tooltip
          return '<h3 class="primary-fill white-text" style="border-radius:0;"><span style="opacity:.82;">[' + $scope.namespace + ']</span> <span style="margin: 0 1em 0 1em;">' + $scope.sensor + ',</span> ' + $scope.item + '</h3>' + '<p>' + val + '' + sensorProps.units + ' on ' + time + '</p>';
        });

        // data settings
        chart.showLegend(false); // Always hide the legend, only one series of data is shown per graph making it redundant
        chart.noData('no data'); // when the chart has no data to display show this string
        chart.duration(350); // when the chart has no data to display show this string

        // what function to call when the window is resized;
        nv.utils.windowResize(drawChart);

        resolve();
      });
    }

    // renders the chart
    function drawChart() {
      // flags are set to true when data is ready, only draw when all data is ready
      if (calculatedDataReady && chartDataReady && setupChartReady) {
        // if the chart is not defined to have shaded region below the line remove it
        if (!chartData[0].area) {
          var area = $element.get(0).querySelector('.nv-area');
          if (area) area.parentNode.removeChild(area);
        }

        // if the reference to the svg does not exist find it
        if (!chartSVG) chartSVG = d3.select('#' + $scope.id);

        chart.forceY(chartForceY); // before rendering the chart, force the Y axis to show normal values

        chartSVG
          .datum(chartData)
          .transition()
          .duration(chart.duration())
          .call(chart);

        // if there is chart data, the test if state limit lines should be shown
        if (chartData[0].values.length) toggleStateLims(sensorProps.state); // show the warning and critical values as horizontal lines on the graph (if thecurrent value exceeds them)
      }
    }

    // vars to hold references to the lines
    var warnLine;
    var alertLine;
    // draw horizontal lines at the warning and critical value if the max value of the sensor is in a warning or critical range
    function toggleStateLims(state) {
      // only add lines if the chart has data
      var width = parseInt($element.find('rect').first().attr('width'));
      // if in an alert state: draw a horizonal line at the alert value
      // if state is undefined, the chart width has changed and the line needs to be updated
      if (state === 2) {
        alertLine = drawFixedLine(alertLine, width, sensorProps.criticalValue, chartColors[2]);
      // otherwise remove the line if the line exists remove it
      } else {
        if (alertLine) alertLine = removeFixedLine(alertLine);
      }
      // if in a warning or alert state: draw horizonal line at the warning value
      // if state is undefined, the chart width has changed and the line needs to be updated
      if (state === 1 || state === 2) {
        warnLine = drawFixedLine(warnLine, width, sensorProps.warningValue, chartColors[1]);
      // otherwise remove the line if the line exists remove it
      } else {
        if (warnLine) warnLine = removeFixedLine(warnLine);
      }
    }

    // adds (or updates) a fixed horizontal line to the chart
    // returns the reference to the newly created (or updated) line
    function drawFixedLine(line, width, yValue, color) {
      var yValueScale = chart.yAxis.scale();
      var margin = chart.margin();

      // if the line does not exist create it
      if (!line) {
        var el = chartSVG.append('line')
          .style('stroke', color)
          .style('stroke-width', '2px')
          .style('stroke-linecap', 'round')
          .style('stroke-dasharray', '2,4')
          .style('stroke-opacity', '0.75');

        // create the reference as an object
        line = {'el': el};
      }

      // if the width of the line is different than the current width of the chart or unset set its width
      if (line && (width !== line.width)) {
        line.el
          .attr('x1', margin.left)
          .attr('y1', yValueScale(yValue) + margin.top)
          .attr('x2', width + margin.left)
          .attr('y2', yValueScale(yValue) + margin.top);

        // update the reference object
        line.width = width;
      }

      // return the reference
      return line;
    }

    // removes an element (in this case a fixed horizontal line) from the chart
    // returns the undedined so chart knows the line does not exist anymore
    function removeFixedLine(line) {
      line.el.remove();
      return undefined;
    }
  }]);
})();
