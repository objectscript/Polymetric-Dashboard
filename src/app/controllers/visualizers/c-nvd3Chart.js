(function() {
  'use strict';

  var viz = angular.module('visualizers');

  viz.controller('nvd3ChartCtrl', ['$scope', '$http', '$filter', '$element', '$timeout', '$q', 'dashboard', function($scope, $http, $filter, $element, $timeout, $q, dashboard) {
    var resizeListener;

    // colors displayed on the chart
    $scope.chartColors = {
      'alert': '#F44336',
      'warn': '#FFC107',
      'normal': '#4CAF50',
      'unknown': '#9E9E9E',
    };

    // scope vars to hold data and meta (aka last update)
    $scope.data = [
      {
        'key': $scope.namespace + ', ' + $scope.sensor + ', ' + $scope.item,
        'values': [],
        'color': $scope.chartColors.unknown,
        'area': true,
      }
    ];

    $scope.lastUpdate = undefined;

    // validate the charts options
    validateOptions()
      .then(function(options) {
        // build the chart with the validated options
        buildGraph(options)
          .then(function(options) {
            // Once the chart has been built then add listeners
            // update data listener
            $scope.$on('updateData', function(event, args) {dashboardUpdate(event, args);});
            // update charts size listener (for instance when a widget is resized)
            $scope.$on('updateChartSize', function(event) {update();});

            // emit the render complete event which tells the tab to update its contents data
            $scope.$emit('renderComplete', {clearData: false});

            // if the units have not been defined (passed to the chart), request for them from the server
            if ($scope.units === undefined) {
              dashboard.getSensor($scope.namespace, $scope.sensor, $scope.item)
                .then(function(data) {
                  // extract the units and store
                  if (data) {
                    $scope.units = data.units;
                  }
                });
            }
          });
      });

    // parses the attrs set on the nvd3-component, puts defaults where necessary but prioritizes user configures settings
    function validateOptions() {
      return $q(function(resolve, reject) {
        var o = {};

        var defaults;
        if ($scope.type === 'lineChart') {
          defaults =  {
            margin: {left: 60, top: 20, right: 60, bottom: 40},
            height: 144,
            transition: 350,
            showLegend: false,
            xAxis: {
              visible: true,
              label: '',
            },
            yAxis: {
              visible: true,
              label: '',
            },
          };
        } else if ($scope.type === 'sparklineChart') {
          defaults =  {
            margin: {left: 0, top: 10, right: 0, bottom: 4},
            height: 48,
            transition: 350,
            showLegend: false,
            xAxis: {
              visible: false,
              label: '',
            },
            yAxis: {
              visible: false,
              label: '',
            },
          };
        }

        // Validate margin object
        var margin = {
          left: (isNaN(parseInt($scope.marginLeft)) ? defaults.margin.left : parseInt($scope.marginLeft)),
          right: (isNaN(parseInt($scope.marginRight)) ? defaults.margin.right : parseInt($scope.marginRight)),
          top: (isNaN(parseInt($scope.marginTop)) ? defaults.margin.top : parseInt($scope.marginTop)),
          bottom: (isNaN(parseInt($scope.marginBottom)) ? defaults.margin.bottom : parseInt($scope.marginBottom)),
        };
        o.margin = margin;

        // Validate height
        o.height = (!Number($scope.height) ? defaults.height : Number($scope.height));

        // Validate transitions
        o.transition = (!Number($scope.transition) ? defaults.transition : Number($scope.transition));

        // always hide guideline
        o.guideline = false;
        // Validate legend flag
        o.showLegend = (['true', 'false'].indexOf($scope.showLegend) === -1 ? defaults.showLegend : $scope.showLegend === 'true');

        o.xAxis = {};
        // Validate xAxis flag
        o.xAxis.visible = (['true', 'false'].indexOf($scope.xaxisVisible) === -1 ? defaults.xAxis.visible : $scope.xaxisVisible === 'true');
        // Validate xAxis flag
        o.xAxis.label = (!$scope.xaxisLabel ? defaults.xAxis.label : $scope.xaxisLabel);

        o.yAxis = {};
        // Validate yAxis flag
        o.yAxis.visible = (['true', 'false'].indexOf($scope.yaxisVisible) === -1 ? defaults.yAxis.visible : $scope.yaxisVisible === 'true');
        // Validate yAxis label
        o.yAxis.label = (!$scope.yaxisLabel ? defaults.yAxis.label : $scope.yaxisLabel);
        o.yAxis.distance = -20;

        resolve(o);
        // return o;
      });
    }

    // javascript necessary to set up the nvd3 chart and place it on the DOM
    function buildGraph(options) {
      return $q(function(resolve, reject) {
        nv.addGraph(function() {
          $scope.chart = nv.models.lineChart()
            .margin(options.margin)  //Adjust chart margins to give the x-axis some breathing room.
            .height(options.height)  //Adjust chart margins to give the x-axis some breathing room.
            .showLegend(options.showLegend)       //Show the legend, allowing users to turn on/off line series.
            .showYAxis(options.yAxis.visible)        //Show the y-axis
            .showXAxis(options.xAxis.visible)        //Show the x-axis
            .options({
              duration: options.transition, //how fast do you want the lines to transition?
            })
          ;

          $scope.chart.noData('no data');

          // yAxis settings
          $scope.chart.yAxis.axisLabel(options.yAxis.label);
          $scope.chart.yAxis.axisLabelDistance(options.yAxis.distance);
          $scope.chart.yAxis.tickFormat(function(d) {
            var tick = $filter('number')(d, 1).replace('.0', '');
            var unit = '';
            if ($scope.units) unit = $scope.units;
            return tick + unit;
          });

          // xAxis settings
          $scope.chart.xAxis.axisLabel(options.xAxis.label);
          $scope.chart.xAxis.tickFormat(function(d) {
            var format = 'MMM D, h:mma'; // ex: Jul 13, 1:04pm
            var tick = $filter('UnixtoLocal')(d, format);

            return tick;
          });

          // custom tooltip content
          $scope.chart.tooltip.contentGenerator(function(data) {
            var format = 'MMM D, h:mma'; // ex: Jul 13, 1:04pm
            var time = $filter('UnixtoLocal')(data.point.x, format);
            var val = $filter('number')(data.point.y, 1).replace('.0', '');

            var sensorStr = data.series[data.seriesIndex].key;
            var sensorArr = sensorStr.split(',');
            var namespace = sensorArr[0].trim();
            var sensor = sensorArr[1].trim();
            var item = sensorArr[2].trim();

            return '<h3 id="' + $scope.id + 'Tooltip" class="primary-fill white-text" style="border-radius:0;"><span style="opacity:.82;">[' + namespace + ']</span> <span style="margin: 0 1em 0 1em;">' + sensor + ',</span> ' + item + '</h3>' + '<p>' + val + '' + $scope.units + ' on ' + time + '</p>';
          });

          // Add the pointer to the chart data (although it is empty until the REST resp is recieved)
          $scope.chartData = d3.select('#' + $scope.id).datum($scope.data); // The svg that has the data

          //Update the chart when window resizes.
          nv.utils.windowResize(update);

          resolve($scope.chart);
        });
      });
    }

    function update(fill) {
      // Update the SVG with the new data and call chart
      if ($scope.chartData) {
        $scope.chartData.datum($scope.data).transition().duration(500).call($scope.chart);

        // show/remove the fill below the line based on return from calculatedDataRespHandler
        var area = $element.find('path[class=nv-area]');
        area.css('fill-opacity', fill);
      }
    }

    function dashboardUpdate(event, args) {
      if (args.clearData) { // if new chart periods/sample intervals are defined remove all existing data from the chart
        clearChart()
          .then(function() {
            getNewData();
          });
      } else {
        getNewData(); // otherwise get new data to add to the chart
      }
    }

    // get the data needed to display on the chart (async)
    function getNewData() {
      var needsData = needNewData();
      // if new data is needed (or its the initial call) get data
      if (needsData) {
        // get the (x,y) pairs of data shown on the chart, using $scope.lastUpdate to only get the necessary time period (the whole chart period intitially
        // but subsiquent calls only get the small set of data needed to update the chart )
        dashboard.getChartData($scope.namespace, $scope.sensor, $scope.item, $scope.lastUpdate)
          .then(function(data) {
            chartDataRespHandler(data)
              .then(function(data) {
                // get the calculated data used to change the style of the chart, use undefined as last update so it will always get a full chart periods data. This is done
                // because the state needs to be based off the entire chart period not just the newest set of data
                dashboard.getCalculatedData($scope.namespace, $scope.sensor, $scope.item, undefined)
                  .then(function(data) {
                    calculatedDataRespHandler(data)
                      .then(function(data) {
                        var fill = data;
                        // parse out the worst state so the chart styling represents the worst of the chart period
                        removeOldData()
                          .then(function() {
                            // update the chart to show new data
                            update(fill);
                          });
                      });
                  });
              });
          });

        // if a call was made but no response recieved, set the last update to null so it is known not to make another call
        if ($scope.lastUpdate === undefined) $scope.lastUpdate = null;
      }
    }

    // test to see if new data is needed (last update is more than a sample interval in the past)
    // returns true if $scope.lastUpdate is undefined, but false if $scope.lastUpdate=null
    function needNewData() {
      var lastUpdate = $filter('TStoUnix')($scope.lastUpdate);
      var now = moment.utc().subtract(dashboard.meta.samplePeriod, 'seconds').valueOf();
      return (lastUpdate < now);
    }

    // parses the response and updates the charts style based on the state of the sensor
    function calculatedDataRespHandler(data) {
      return $q(function(resolve, reject) {
        if (data) {
          // select the chart to change the colors
          var chart = d3.select('#' + $scope.id);
          // hide the area
          var fill = 0;

          var state = data.state;
          // if the sate is normal
          if (state === 0) {
            // change the color to green
            $scope.data[0].color = $scope.chartColors.normal;
            // long dash, short hole, short dash, short hole
            chart.style('stroke-dasharray', ('20, 3, 2, 3'));
            $scope.showArea = 0;
          // if the sate is warning
          } else if (state === 1) {
            // change the color to yellow
            $scope.data[0].color = $scope.chartColors.warn;
            // solid line
            chart.style('stroke-dasharray', ('1,'));
          // if the sate is alert
          } else if (state === 2) {
            // change the color to red
            $scope.data[0].color = $scope.chartColors.alert;
            // show the area
            fill = 0.5;
            // solid line
            chart.style('stroke-dasharray', ('1,0'));
          // if the sate is unkown
          } else {
            // change the color to grey
            $scope.data[0].color = $scope.chartColors.unknown;
            // solid line
            chart.style('stroke-dasharray', ('0, 1'));
          }

          // formats charts with all data points having same y value
          if (data.max === data.min) {
            if (data.max === 0) {
              $scope.chart.forceY([0, 1]);
            } else {
              $scope.chart.forceY([0, data.max]);
            }
          } else {
            $scope.chart.forceY(null);
          }

          resolve(fill);
        }
      });
    }

    // parses the response and adds the data to the chart
    function chartDataRespHandler(data) {
      return $q(function(resolve, reject) {
        if (data) {
          $timeout(function() {
            var chart = d3.select('#' + $scope.id);

            var unix;
            var val;
            var state;
            var dataArray = [];

            for (var i = 0; i < data.length; i++) {
              // the first point is the newest (hence unshift not push) so store its time stamp as the last update or start time of next call
              if (i === 0) $scope.lastUpdate = data[0].timestamp;

              // convert the time stamp into a moment object and then unix milliseconds for graph to place points in correct order
              unix = $filter('TStoUnix')(data[i].timestamp);
              val = data[i].value;
              dataArray.unshift({x: unix, y: val});
            }
            // if the first data response has no data, $scope.lastUpdate will be remain null and no new data will
            // even be retrieved. By setting $scope.lastupdate back to undefined new data will be requested for (even if it does not exist)
            if ($scope.lastUpdate === null) {
              $scope.lastUpdate = undefined;
            }
            $scope.data[0].values = $scope.data[0].values.concat(dataArray);

            resolve();
          }, 0);
        }
      });
    }

    function removeOldData() {
      return $q(function(resolve, reject) {
        // calculate the time frame the chart should display
        var unix = $filter('TStoUnix')($scope.lastUpdate);
        var oldestPoint = moment.utc(unix).subtract(dashboard.meta.chartWindow, 'seconds').valueOf();
        var curData = $scope.data[0].values;

        // if the chart has more than the desired number of points, then remove old data
        var desiredNumPoints = dashboard.meta.chartWindow / dashboard.meta.samplePeriod;
        var totalPoints = curData.length;
        if (desiredNumPoints < totalPoints) {
          // walk through the chart data oldest->newest (this should mean less itterations) and when a
          // point in the chart is found to be newers than the oldest point break (this is where the data should be split)
          // now = 4
          // chartData = [0,1,2,3,4,5,6,7]
          //                      <------- i = 4
          // [0,1,2,3,4,5,6,7].splice(i, chartData.length) = [4,5,6,7]
          for (var i = curData.length - 1; i >= 0; i--) {
            if (curData[i].x < oldestPoint) break;
          }

          // splice the data to get return the array without the old data
          $scope.data[0].values = curData.splice(i, curData.length);
        }
        resolve();
      });
    }

    // removes all data from the chart
    function clearChart() {
      return $q(function(resolve, reject) {

        // reset the charts data and last update var
        $scope.data[0].values = [];
        $scope.lastUpdate = undefined;

        // must use d3 here to select all the svg data in the charts DOM elem
        d3.selectAll('.nvd3Compoenent > *').remove();

        resolve();
      });
    }
  }]);
})();
