# REST API
The System Monitor Dashboard uses a simple REST API to retrieve the data displayed on the front end from the Caché Server.

## Overview
### URL
- **Base Path**
  - The base path of all REST API calls is */api/dashboard/*

- **Versioning**
  - After the base path comes the version of the REST API, this allows for new versions to be created without breaking or removing current functionality.
    - The current version is *v3/*

- **Example**
  - An example call to get all the sensors registered to the System Monitor Dashboard */api/dashboard/v3/Sensors?encryption=none*

### Data
- **Format**
  - All data sent and recieved from the REST API should be formatted as a JSON string.

- **Times**
  - All time stamps sent and recieved from the REST API should be in non-localized UTC format
    - YYYY-MM-DD HH:mm:ss
    - ex: 2016-05-11 09:54:23, or 2016-09-21 15:34:01

## Paths

### Get All Sensors
Response contains an array of objects representing all of the Sensors registered to the dashboard. Each Sensor's identifiers and properties are included within the objects.

#### URL

  /Sensors

#### Method:

  `GET`

#### URL Params

  `none`

#### Query Params

  `encryption=[none | base64]`

#### Success Responses

  - **Code:** 200 <br />
    **Description:** Found Sensors <br />
    **Content:** Array of sensor objects
    ```javascript
    [
      {
        "namespace":	string,
        "sensor":	string,
        "item":	string,
        "criticalValue":	string,
        "warningValue":	string,
        "units":	string,
        "operator":	string,
        "description":	string,
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
    "message": string,
    "fields": string,
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
