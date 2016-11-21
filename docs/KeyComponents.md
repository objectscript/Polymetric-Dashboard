# Key Components
A more detailed look at some of the key components used by the front end of the Dashboard.

## DashboardApi
The DashboardApi is a service that facilitates quick and easy use of the Dashboard's REST API. It contains Javascript functions that make the necessary HTML requests, and handle the responses from the server. It also stores the settings regarding the data to be retrieved.

### Use
As with all AngularJS services, to use the DashboardApi you must include it within a controller to access it s functionality.

```javascript
angular.module('exampleModule')
  .controller('exampleController', ['$scope', 'dashboard', function($scope, dashboard) {
    // the dashboard var contains all functionality provided by the DashbaordApi service
  });
```

### REST API Abstraction
Each of the four routes provided by the Dashboard's REST API has a corresponding function in the DashboardApi service. This makes getting data from the server as simple as calling a JavaScript function.

1. `dashboard.getSensors()`
  - Gets all of the sensors from the server.
2. `dashboard.getSensor(namespace, sensor, item)`
  - Gets the specified sensor from the server.
3. `dashboard.getChartData(namespace, sensor, item, startTime, sampleInterval)`
  - Gets the specified sensor's readings from the server componsed into data points of length `sampleInterval`, begining at the `startTime` and ending at the current time.
4. `dashboard.getCalculatedData(namespace, sensor, item, startTime)`
  - Gets the specified sensor's calculated data from the server, begining at the `startTime` and ending at the current time.

The [REST API's schema](https://github.com/CDTiernan/SystemMonitorDashboard/blob/master/docs/RestApi.md) is defined in the *docs/RESTApi.md* file.

All dashboard REST API methods return a promise. So to access the response you must define a success callback. You can also set up a error callback to handle any errors.

```JavaScript
dashboard.getSensor(naemspace, sensor, item)
  .then(function(sensorProps) { // success callback
    // ...
  }, function(error) { // success callback
    // ...
  });
```

### Data Settings
The DashboardApi also stores the settings regarding how data should be formatted and the time ranges it should span. These settings are changed using the Settings Dialog.

- `dashboard.meta.chartWindow`
  - The number of seconds defining the maximum age of data to retrive from the server.
- `dashboard.meta.samplePeriod`
  - The number of seconds each data point should represent. This has a minimum value of the server's reading interval (default 30 seconds).
- `dashbaord.meta.timezone`
  - Internally all times are in utc format. When displayed these timestamps on the front end a locale is used to format the times. The dashboardApi guesses a users locale initially; however, any timezone can be specified.
- `dashboard.meta.timeDisplayFormat` and `dashboard.meta.advTimeDisplayFormat`
  - Defines how dates and times will be displayed on the front end. Default is YYYY-MM-DD HH:mma, an example of which is 2016-05-11 9:54am.
- `dashboard.meta.debug.rest`
  - Tells the dashboardApi if non-critical REST Api errors should be printed to the console.

## UpdateProvider
The UpdateProvider is a service that calculates the time to wait before new data is available on the server. It is used by the visualization tools as it allows them to correctly time their update calls to get new data from the server.

### Use
As with all AngularJS services to use the UpdateProvider you must include it within a controller. However, you must instantiate an "updater" to access the functionality.

```javascript
angular.module('exampleModule')
  .controller('exampleController', ['$scope', '$element', 'UpdateProvider', function($scope, $element, UpdateProvider) {
    var updater = UpdateProvider.updater($element, $scope, lastUpdate, callback);
    // the updater variable has all the funcitonality needed to correctly time the update REST calls
  });
```

The updater requires four arguments.
1. `$element`
  - The AngularJS $element service. It is the jQuery object of the component using the updater.
2. `$scope`
  - The AngularJS $scope service. It is the global datastructure of the component.
3. `lastUpdate`
  - The default lastUpdate of the component. This is either `-1` if the component only requires the newest reading from the server, or `undefined` if the component requires a whole chart period of data from the server.
4. `callback`
  - The function within a component that makes the calls to get new data. This function will be called by the updater when new data should be available on the server.

Additionally, the update needs to know the readingInterval of the sensor the visualization tool is displaying.

```JavaScript
dashboard.getSensor(namespace, sensor, item)
  .then(function(sensorProps) { // if the sensor was found this function is called
    updater.readingInterval = sensorProps.readingInterval;
  });
```

Finally, after handling a REST API data response call the updater's delay function passing in the newest datapoints timestamp. The updater will calculate the appropriate delay to wait before it makes the next call to the `callback` function it was initialized with.

```JavaScript
dashboard.getChartData(namespace, sensor, item, startTime, samplePeriod)
  .then(function(data) { // if data was retrieved this function is called
    // do something with the data...

    // the newest data point is the last one of the returned data array
    updater.delay(data[resp.length - 1].timestamp);
  });
```

### Under the Hood
The UpdateProvider contains functionality that reduces the amount of unnecessary REST API calls. Greatly increasing the performance of the application.

- `function isVisible(self) { //... }`
  - The updater will only make the REST call if the component using the updater is currently visible (on the default dashboard front end this means if the component is on the current tab).
- `function needData(self) { //... }`
  - The updater will only make REST calls when the component needs data (aka the shown data does not contain the most recent data on the server).
- `  angular.element($window).on('blur focus', function(e) { //... });`
  - The updater will cancel all delays if the Dashboard loses focus, and reinstate them when focus is regained (aka no calls will be made if the user is not looking at the dashboard).
  - This provides a great boost to efficiency due to [timeout throttling](http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series-using.html) many browers implement.
