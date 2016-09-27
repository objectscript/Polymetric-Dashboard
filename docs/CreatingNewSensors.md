# User Defined Sensors
The System Monitor Dashboard provides users with the functionality to create their own sensors. Custom user defined sensors can be registered to the System Monitor Dashboard, and the data they collect will automatically be displayed on the front end of the application.

**Table of Contents**
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Namespaces](#namespaces)
- [Procedure](#procedure)
- [Example - Adding Sensors](#example-adding-sensors)
	- [Introduction](#introduction)
	- [Enabling Auditing](#enabling-auditing)
	- [Creating the Sensors](#creating-the-sensors)
		- [Sensor Collection Class](#sensor-collection-class)
		- [TotalAudits Sensor](#totalaudits-sensor)
		- [AuditsPerSecond Sensor](#auditspersecond-sensor)
		- [TotalAuditsOfType Sensor](#totalauditsoftype-sensor)
	- [Registering the Sensors](#registering-the-sensors)
	- [Registering the Namespace](#registering-the-namespace)
- [Removing Sensors](#example-removing-sensors)
	- [Introduction](#introduction)
	- [Deregistering Sensors](#deregistering-sensors)
	- [Deregistering Namespaces](#deregistering-namespaces)

<!-- /TOC -->

## Namespaces
The System Monitoring Dashboard's default collection of sensors is defined in the %SYS namespace because it is maintained by InterSystems. Users are *strongly* discouraged from changing the default sensor definitions or creating new sensor definitions in the %SYS namespace. The System Monitor Dashboard can collect data from sensors in any namespace, so users are encouraged to define custom sensors in their own namespace.

## Procedure
1. Create a Sensor Collection Class
  - Must inherit from `%SYS.Monitor.AbstractDashboard`
2. Create the Start Method that calls `CreateSensor()` for each individual sensor you want to define
  - `Method Start() As %Status {...}`, overrides `%SYS.Monitor.AbstractDashboard.Start()` and will be called automatically during the initialization of the System Monitor Dashboard
3. Create the GetSensors Method calling `SetSensor()` for each individual sensor you want to record data from
  - `Method GetSensors() As %Status {...}`, overrides `%SYS.Monitor.AbstractDashboard.GetSensors()` and will be called automatically during during each sampling period.
4. Use the the System Monitor Manager (`^%SYSMONMGR`) to register your new sensor collection class to the System Monitor Dashboard
  - The System Monitor Manager can also be used to deregister sensor collection classes.

## Example - Adding Sensors
### Introduction
In order to describe the creation of new user defined sensors more clearly, lets go through a concrete example. We will be creating a small collection of three sensors that monitor the CacheAudit database.

1. TotalAudits
  - The total number of audits in the CacheAudit database.
2. AuditsPerSecond
  - The number of audits added to the CacheAudit database per second.
3. TotalAuditsOfType
  - The total number of audits in the CacheAudit database grouped by type.

These sensors represent the three types of sensors that are used within the System Monitor Dashboard. TotalAudits is a value based sensor; recording the value of a metric during the sampling period. AuditsPerSecond is a delta based sensor; recording the change of a metric's value since previous sampling period. TotalAuditsOfType is a sensor with multiple items; instead of the sensor recording a single value, each of its items represent one type of audit and records the total number of audits of that type during the sampling period.

### Enabling Auditing
In order for the audit sensors to function properly auditing must be enabled on your Cache System. This can be done using the Sytsem Managment Portal

1. From the main page of the System Management Portal select "System Administration"
2. Select "Security"
3. Select "Auditing"
4. Select "Enable Auditing"
5. Select "Perform Action Now"

### Creating the Sensors
#### Sensor Collection Class
The first thing we need to do is create a sensor collection class for the sensors we are going to create.

1. In the USER namespace, create a new Caché Class
  - Package: User.Dashboard.Sensors
  - Class Name: Audit
  - Description: Sensors that monitor the CacheAudit database.
2. Click "Next"
3. Select "Extends" and input "%SYS.Monitor.AbstractDashboard"
4. Click "Finish"

Now that the sensor collection class is created, we need to override two methods in %SYS.Monitor.AbstractDashboard: Start() and GetSensors(). We are going to create these methods now and fill in their functionality later.

1. Create the Start() Method, this is where the sensors will be created

  ```
  /// Initialize all the sensors
  Method Start() As %Status
  {
  	Set ..State="OK"
  	Quit $$$OK
  }
  ```

2. Create the GetSensors() Method, this is where the sensor values will be read. It is **important to note that all the functionality should be placed inside a try-catch statement**, this is because if errors occur during the GetSensors() method call they **should not be thrown** because this will halt the entire System Monitoring process. Instead set the sensor collection class's state using the ..Sate Property.

  ```
    /// Read data from all the sensors
    Method GetSensors() As %Status
    {
			Try {
				// Functionality to get metrics recorded by sensors will go here
			} Catch {
				// Set the sensor collection class's state to "ERROR", but do not throw any errors
				Set ..State="ERROR"
			}

			// Always Quite $$$OK as to not halt the System Monitor Dashboard
    	Quit $$$OK
    }
  ```

#### TotalAudits Sensor
The TotalAudits sensor is the most simple form of sensor so lets start with it.

1. Add a call to CreateSensor() in the Start() Method to create the TotalAudits Sensor

  ```
  Do ..CreateSensor("TotalAudits","","","",0,"",">","The total number of audits in the CacheAudit database")
  ```

  - From left to right the arguments passed to ..CreateSensor() are
    - Sensor: The name of the sensor to create
    - Item: The sub category of the sensor we are going to create, by inputing "" no items are created
    - Warning Value: The value at which the sensor is in a unusual state if exceeded, by inputing "" no warning value is set and the sensor will never reach a warning state
    - Critical Value: The value at which the sensor is in a alert state if exceeded, by inputing "" no critical value is set and the sensor will never reach a critical state
    - Alert Flag: Boolean flag representing if alerts and warnings should be logged to the cconsole.log
    - Units: The unit that the sensors metric is measured in
    - Operator: How the sensors value should be compared to Warning and Critical Values (aka if low ("<") or high (">") values are worse)
    - Description: A short explanation of the sensor

2. Call SetSensor() in the GetSensors() Method to populate readings of the TotalAudits Sensor

  ```
  // The global ^["^^cacheaudit"]CacheAuditD stores the total number of audits
  Set NumberOfAudits = ^["^^cacheaudit"]CacheAuditD

	// Record the value
  Do ..SetSensor("TotalAudits", NumberOfAudits)
  ```

  - From left to right the arguments passed to ..CreateSensor() are
    - Sensor: The name of the sensor
    - Value: The value the sensor is to record

#### AuditsPerSecond Sensor
The AuditsPerSecond sensor builds off the TotalAudits sensor, adding functionality to compute the change in value of the metric


1. Add two new properties to the sensor collection class, one called "PrevReadingTime" and the other "ElapsedSeconds". These will be used to calculate the total time since the last reading of the sensors.

  ```
	// Time of previous sampling period (Initialize to -1 to indicate the initial sampling period)
	Property PrevReadingTime As %Integer [ InitialExpression = -1 ];

  /// Elapsed seconds since the last sampling period
  Property ElapsedSeconds As %Integer;
  ```

2. Add a new property to the sensor collection class called "PrevNumberOfAudits", this will store the last value so it can be compared to the current value

  ```
  /// Value of NumberOfAudits during the last GetSensors() call
  Property PrevNumberOfAudits As %Integer [InitialExpression = 0];
  ```

3. In the Start() Method, add a call to CreateSensor() to create the AuditsPerSecond Sensor

  ```
  Do ..CreateSensor("AuditsPerSecond","","","",0,"",">","The number of audits added to the CacheAudit database per second")
  ```

4. In the GetSensors() Method and afterthe TotalAudits functionality created before, get the current time

	```
	Set CurReadingTime = $PIECE($ZHOROLOG, ".", 1)
	```

5. Add an `if` statement to test that the current sampling period is not the first one. This is necessary because in order to calcuate the difference in a metric's value a previous reading has to have been taken.

	```
	// A previous reading must have been taken for change to be calculated
	If (..PrevReadingTime '= -1) {
		// Delta calculations will be completed here
	}

	```

6. In the new `if` statement, Calculate the total time since the last sampling period

  ```
  // Calculate the difference between the time of the last sampling period and the current time
  Set ..ElapsedSeconds = (CurReadingTime - ..PrevReadingTime)

  ```

7. Calculate the difference between the current number of audits and the previous number of audits in the GetSensors() Method

  ```
	// Calculate the difference between the total number of audits during the current and last sampling period
	Set DeltaAudits = NumberOfAudits - ..PrevNumberOfAuditss
  ```

8. Calculate the change in number of audits per second

  ```
  Set NumberOfAuditsPerSecond = DeltaAudits / ..ElapsedSeconds
  ```

9. Set the AuditsPerSecond sensor to the calcuated reading

  ```
	// Record the value
  Do ..SetSensor("AuditsPerSecond", NumberOfAuditsPerSecond)
  ```
10. Outside and after the `if` statement, store this readings total audits and the current time to be used during the next sampling period.

  ```
    // Store the current number of audits
    Set ..PrevNumberOfAudits = NumberOfAudits

    // Store the current time
    Set ..PrevReadingTime = CurReadingTime
  ```

#### TotalAuditsOfType Sensor
The TotalAuditsOfType sensor is similar to the TotalAudits sensor as it records total values not deltas; however, it utilizes items record the total number of audits grouped by type.

1. Add a call to CreateSensor() in the Start() Method to create the AuditsPerSecond Sensor

  ```
  Do ..CreateSensor("TotalAuditsOfType","","","",0,"",">","The total number of audits in the CacheAudit database grouped by type")
  ```

2. Add a new property to the sensor collection class called "TotalAuditsOfType", this will be used as temporary storage of audit counts by type.

	```
	/// Temp storage for Total Audits of Type
	Property TotalAuditsOfType [ MultiDimensional ];
	```

2. In the GetSensors() Method, add a loop that parses through all the audits in the CahceAudit database and the number of each disticnt type of audit.

  ```
  // Get the first pointer in the Audit Global
	Set node = $QUERY(^["^^cacheaudit"]CacheAuditD)
	// Loop through all of the audits
	While (node '= "") {
		// Extract the 5th element of the entry (type of audit)
		Set auditType = $LIST(@node,5)

		// Add to counts, use $GET to start at 0 for novel types
		Set ..TotalAuditsOfType(auditType) = $GET(..TotalAuditsOfType(auditType), 0) + 1

		// Get the next pointer
		Set node = $QUERY(@node)
	}
  ```

3. After the counting loop add another loop that call SetSensor() for each audit type, recording the count of each type of audit.

  ```
  // Iteration begins at the empty string
	Set item = ""
	For {
		// Get the next item held in the multidimensional property
		Set item = $ORDER(..TotalAuditsOfType(item)) Quit:item=""

		// Set the sensor's item which is dynamically created if it does not exist
		Do ..SetSensor("TotalAuditsOfType",..TotalAuditsOfType(item), item)

		// Reset the counts to 0 after recording it
		Set ..TotalAuditsOfType(item) = 0
	}
  ```

  - We are using the third argument of SetSensor() in this case (something that was not done in either of the other two sensors). This is because we need to define an item for each group of audits. By passing in this third parameter the System Monitor Dashboard knows to create a new sensor item if it does not exist, then increment that item's count.

### Registering the Sensors

1. Using the Caché Terminal from the USER namespace run the System Monitor Manager Routine
  - `Do ^%SYSMONMGR`

2. The System Monitor Manager provides a list of functionality, to add sensors you will want to **input 3** for "Confirgure System Monitor Classes"

3. **Input 1** for "Configure System Monitor Components"

4. **Input 2** for "Add Class"

5. **Input "User.Dashboard.Sensors.Audit"** as the class

6. **Input "Sensors that monitor the audit database"** as the description

7. Exit back to the main menu by **inputting 4** then **2**

8. **Input 1** for "Start/Stop System Monitor"

9. **Input 2** to stop the system monitor

10. **Input 1** to start the system monitor


### Registering the Namespace
The System Monitor Dashbaord only runs in namespaces it has been told to do so, thus if you are creating sensors in a namespace that has not been registered by the System Montior you must do for the System Monitor Dashboard to record data from your sensors.

1. Using the Caché Terminal switch to the %SYS namespace
  - `zn "%SYS"`

2. Using the Caché Terminal from the USER namespace run the System Monitor Manager Routine
  - `Do ^%SYSMONMGR`

3. The System Monitor Manager provides a list of functionality, to Register a namespace you will want to **input 3** for "Confirgure System Monitor Classes"

4. **Input 2** for "Configure Startup Namespaces"

5. **Input 2** for "Add Namespace"

6. **Input "USER"** for the namespace

7. Exit back to the main menu by **inputting 4** then **3**

8. **Input 1** for "Start/Stop System Monitor"

9. **Input 2** to stop the system monitor

10. **Input 1** to start the system monitor

The new sensors are now registered and should show up on the System Monitor Dashboard front end! It takes a few seconds to gather data to display, but they will be shown on the All Sensors tab.

## Removing Sensors
### Introduction
It is also possible to remove sensors from the System Monitor Dashboard. This is done by "deregistering" a sensor collection class.

### Deregistering Sensors

1. Using the Caché Terminal from the USER namespace run the System Monitor Manager Routine
  - `Do ^%SYSMONMGR`

2. The System Monitor Manager provides a list of functionality, to add sensors you will want to **input 3** for "Confirgure System Monitor Components"

3. **Input 1** for "Configure System Monitor Components"

4. **Input 3** for "Remove Class"

5. **Input "SENSOR COLLECTION CLASS"** as the class, where SENSOR COLLECTION CLASS is the name of the sensor collection class

6. Exit back to the main menu by **inputting 4** then **2**

7. **Input 1** for "Start/Stop System Monitor"

8. **Input 2** to stop the system monitor

9. **Input 1** to start the system monitor


### Deregistering Namespaces
The System Monitor Dashbaord only runs in namespaces it has been told to do so. Thus if to limit CPU usage of the System Monitor Dashboard, namespaces that do not have any registered sensors collection clases should be deregistered from the System Monitor.

1. Using the Caché Terminal switch to the %SYS namespace
  - `zn "%SYS"`

2. Using the Caché Terminal from the USER namespace run the System Monitor Manager Routine
  - `Do ^%SYSMONMGR`

3. The System Monitor Manager provides a list of functionality, to Register a namespace you will want to **input 3** for "Confirgure System Monitor Components"

4. **Input 2** for "Configure Startup Namespaces"

5. **Input 3** for "Delete Namespace"

6. **Input "NAMESPACE"** for the namespace, where NAMEPACE is the name of the namepsace

7. Exit back to the main menu by **inputting 4** then **2**

8. **Input 1** for "Start/Stop System Monitor"

9. **Input 2** to stop the system monitor

10. **Input 1** to start the system monitor
