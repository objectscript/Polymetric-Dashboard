# REST API
The System Monitor Dashboard uses a simple REST API to retrieve data from the Caché environment.

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [REST API](#rest-api)
	- [Overview](#overview)
		- [URL](#url)
		- [Data](#data)
	- [Paths](#paths)
		- [Get All Sensors](#get-all-sensors)
			- [URL](#url)
			- [Method](#method)
			- [URL Params](#url-params)
			- [Query Params](#query-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Success Responses](#success-responses)
			- [Error Responses](#error-responses)
			- [Sample Call](#sample-call)
		- [Get a Sensor](#get-a-sensor)
			- [URL](#url)
			- [Method](#method)
			- [URL Params](#url-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Query Params](#query-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Success Responses](#success-responses)
			- [Error Responses](#error-responses)
			- [Sample Call](#sample-call)
		- [Get A Sensor's Chart Data](#get-a-sensors-chart-data)
			- [URL](#url)
			- [Method](#method)
			- [URL Params](#url-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Query Params](#query-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Success Responses](#success-responses)
			- [Error Responses](#error-responses)
			- [Sample Call](#sample-call)
		- [Get A Sensor's Calculated Data](#get-a-sensors-calculated-data)
			- [URL](#url)
			- [Method](#method)
			- [URL Params](#url-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Query Params](#query-params)
				- [Required](#required)
				- [Optional](#optional)
			- [Success Responses](#success-responses)
			- [Error Responses](#error-responses)
			- [Sample Call](#sample-call)

<!-- /TOC -->

## Overview
### URL
- **Base Path**
  - The base path of all REST API calls is */api/dashboard/*

- **Versioning**
  - After the base path comes the version of the REST API, this allows for new versions to be created without breaking or removing current functionality.
    - The current version is *v3/*

### Data
- **Format**
  - All data sent and recieved from the REST API should be formatted as a JSON string.

- **Times**
  - All timestamps sent and recieved from the REST API should be in non-localized UTC format
    - YYYY-MM-DD HH:mm:ss
    - ex: 2016-05-11 09:54:23, or 2016-09-21 15:34:01

## Paths

### Get All Sensors
Response contains an array of objects representing all of the Sensors registered to the dashboard. Each Sensor's identifiers and properties are included within the objects.

#### URL
`/Sensors`

#### Method
`GET`

#### URL Params
`none`

#### Query Params
##### Required
`encryption=['none' | 'base64']`

- The type of encryption the URL and query parameters are encoded in

##### Optional
`none`

#### Success Responses
- **Code:** 200 <br />
  **Description:** Found Sensors <br />
  **Content:** An Array of Sensor Objects
  ```javascript
  [
    {
      "namespace": string,
      "sensor" string,
      "item": string,
      "criticalValue": string,
      "warningValue": string,
      "units": string,
      "operator": string,
      "description": string,
    }
  ]
  ```

- **Code:** 204 <br />
  **Description:** Did Not Find Sensors <br />
  **Content:** Empty Array
  ```javascript
  []
  ```

#### Error Responses
- **Code:** 400 <br />
  **Description:** Invalid Query Parameters <br />
  **Content:** Error Object
  ```javascript
  {
    "code": integer,
    "error": [
      string,
    ],
    "message": tring,
  }
  ```

- **Code:** 500 <br />
  **Description:** Internal Server Error <br />
  **Content:** N/A

#### Sample Call
```javascript
$http({
  method: "GET",
  url: "/api/dashboard/v3/Sensors?encryption=none"
}).then(function successCallback(resp) {
    console.log(resp);
});

```

---

### Get a Sensor
Response contains one object representing a single Sensor registered within the dashboard. Only the Sensor's properties are included within the object as the identifiers must be known already to make this call.

#### URL
`/Sensors/:sensor/Items/:item`

#### Method
`GET`

#### URL Params
##### Required
`sensor=[string]`

- The name of the sensor to get

`item=[string]`

- The name of the sensor's item to get. If the sensor has no item, use the default item: -

##### Optional
`none`

#### Query Params
##### Required
`namespace=[string]`

- The namespace the sensor is stored in

`encryption=['none' | 'base64']`

- The type of encryption the URL and query parameters are encoded in

##### Optional
`none`

#### Success Responses
- **Code:** 200 <br />
  **Description:** Found the Sensor <br />
  **Content:** A Sensor Object
  ```javascript
  [
    {
      "criticalValue": string,
      "warningValue": string,
      "units": string,
      "operator": string,
      "description": string,
    }
  ]
  ```

- **Code:** 204 <br />
  **Description:** Did Not Find the Sensor <br />
  **Content:** Empty Array
  ```javascript
  []
  ```

#### Error Responses
- **Code:** 400 <br />
  **Description:** Invalid Query Parameters <br />
  **Content:** Error Object
  ```javascript
  {
    "code": integer,
    "error": [
      string,
    ],
    "message": string,
  }
  ```

- **Code:** 500 <br />
  **Description:** Internal Server Error <br />
  **Content:** N/A

#### Sample Call
```javascript
$http({
  method: "GET",
  url: "/api/dashboard/v3/Sensors/CPUusage/Items/-?encryption=none&namespace=%SYS"
}).then(function successCallback(resp) {
    console.log(resp);
});

```

---

### Get A Sensor's Chart Data
Response contains an array of objects representing a single Sensor's readings, starting from the current time and ending at a specified time in the past. Each object contains the time and value of the reading.

#### URL
`/Sensors/:sensor/ChartData/:item`

#### Method
`GET`

#### URL Params
##### Required
`sensor=[string]`

- The name of the sensor to get

`item=[string]`

- The name of the sensor's item to get. If the sensor has no item, use the default item: -

##### Optional
`none`

#### Query Params
##### Required
`namespace=[string]`

- The namespace the sensor is stored in

`samplePeriod=[integer]`

- The amount of seconds each data point should represent

`encryption=['none' | 'base64']`

- The type of encryption the URL and query parameters are encoded in

##### Optional
`startTime=[string]`

- A timestamp representing the oldest possible data point to retrieve

#### Success Responses
- **Code:** 200 <br />
  **Description:** Found Chart Data <br />
  **Content:** An Array of Chart Data Objects
  ```javascript
  [
    {
      "timestamp": string,
      "value": number,
    }
  ]
  ```

- **Code:** 204 <br />
  **Description:** Did Not Find Chart Data <br />
  **Content:** Empty Array
  ```javascript
  []
  ```

#### Error Responses
- **Code:** 400 <br />
  **Description:** Invalid Query Parameters <br />
  **Content:** Error Object
  ```javascript
  {
    "code": integer,
    "error": [
      string,
    ],
    "message": string,
  }
  ```

- **Code:** 500 <br />
  **Description:** Internal Server Error <br />
  **Content:** N/A

#### Sample Call
```javascript
$http({
  method: "GET",
  url: "/api/dashboard/v3/Sensors/CPUusage/ChartData/-?encryption=none&namespace=%SYS&startTime=2016-5-11 08:30:12&samplePeriod=60"
}).then(function successCallback(resp) {
    console.log(resp);
});

```

---

### Get A Sensor's Calculated Data
Response contains one object representing a single Sensor's calculated data, starting from the current time and ending at a specified time in the past. The object contains the Sensor's state, max value, min value, mean value, and standard deviation.

#### URL
`/Sensors/:sensor/CalculatedData/:item`

#### Method
`GET`

#### URL Params
##### Required
`sensor=[string]`

- The name of the sensor to get

`item=[string]`

- The name of the sensor's item to get. If the sensor has no item, use the default item: -

##### Optional
`none`

#### Query Params
##### Required
`namespace=[string]`

- The namespace the sensor is stored in

`encryption=['none' | 'base64']`

- The type of encryption the URL and query parameters are encoded in

##### Optional
`startTime=[string]`

- A timestamp representing the oldest possible data point to retrieve

#### Success Responses
- **Code:** 200 <br />
  **Description:** Found Chart Data <br />
  **Content:** A Calculated Data Object
  ```javascript
  [
    {
      "state": integer,
      "min": number,
      "max": number,
      "mean": number,
      "stdDev": number,
    }
  ]
  ```

- **Code:** 204 <br />
  **Description:** Did Not Find Calculated Data <br />
  **Content:** Empty Array
  ```javascript
  []
  ```

#### Error Responses
- **Code:** 400 <br />
  **Description:** Invalid Query Parameters <br />
  **Content:** Error Object
  ```javascript
  {
    "code": integer,
    "error": [
      string,
    ],
    "message": string,
  }
  ```

- **Code:** 500 <br />
  **Description:** Internal Server Error <br />
  **Content:** N/A

#### Sample Call
```javascript
$http({
  method: "GET",
  url: "/api/dashboard/v3/Sensors/CPUusage/ChartData/-?encryption=none&namespace=%SYS&startTime=2016-5-11 08:30:12"
}).then(function successCallback(resp) {
    console.log(resp);
});

```
