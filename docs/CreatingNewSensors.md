# User Defined Sensors
The System Monitor Dashboard provides the functionality and structure for users to create their own sensors. These sensors can be added to the monitoring process, and the data collected by them displayed on the front end of the application.

## Namespaces
The System Monitoring Dashboard's default collection of sensors is defined in the %SYS namespace because it is maintained by InterSystems. Users are *strongly* discouraged from changing the default sensor definitions or creating new sensor definitions in the %SYS namespace. The System Monitor Dashboard can collect data from sensors in any namespace, so users are encouraged to define custom sensors in their own namespace.

## Procedure
1. Create a Sensor Collection Class
  - Must inherit from `%SYS.Monitor.AbstractDashboard`
2. Create the Start Method that calls `CreateSensor()` for each individual sensor you want to define
  - `Method Start() As %Status {...}`, overrides `%SYS.Monitor.AbstractDashboard.Start()` and will be called automatically during the initialization of the System Monitor Dashboard
3.	Create the GetSensors Method calling `SetSensor()` for each individual sensor you want to record data from
  - `Method GetSensors() As %Status {...}`, overrides `%SYS.Monitor.AbstractDashboard.GetSensors()` and will be called automatically during during each sampling period.
4.	Use the the System Monitor Manager (`^%SYSMONMGR`) to add your new Sensor Collection Class to the System Monitor Dashboard

## Example
### Introduction
In order to describe the creation of new user defined sensors more clearly, lets go through a concrete example. We will be creating a small collection of three sensors that monitor the CacheAudit database.

1. TotalAudits
  - The total number of audits in the CacheAudit database.
2. AuditsPerSecond
  - The number of audits added to the Cache Audit database per second.
3. TotalAuditsOfType
  - The total number of audits grouped by type.

These three sensors represent the three types of sensors the System Monitor Dashboard can contain. TotalAudits is a value based sensor, recording the value of a metric at the time it was read. AuditsPerSecond is a delta based sensor, recording the difference in the monitored metrics value since it was last read. TotalAuditsOfType is an example of a sensor with sensor items, recording the total audits, but breaking it down into subcategories.

### Creating the Sensors
#### Sensor Collection Class
The first thing we need to do is create a sensor collection class for the sensors we are going to create.
1. In the USER namespace, create a new Caché Class
  - Package: User.Dashboard.Sensors
  - Class Name: Audit
  - Description: Sensors that monitor the audit database.
2. Click "Next"
3. Select "Extends" and input "%SYS.Monitor.AbstractDashboard"
4. Click "Finish"

Now that the sensor collection class is created, we need to override two methods in %SYS.Monitor.AbstractDashboard: Start() and GetSensors(). We are going to create these methods now and fill in functionality later.

1. Create the Start() Method, this is where the sensors will be created

  ```
  /// Initialize all the sensors
  Method Start() As %Status
  {
  	s ..State="OK"
  	Q $$$OK
  }
  ```

2. Create the GetSensors() Method, this is where the sensor values will be read

  ```
    /// Read data from all the sensors
    Method GetSensors() As %Status
    {
    	Q $$$OK
    }
  ```

#### TotalAudits Sensor
The TotalAudits sensor is the most simple form of sensor so lets start with it.

1. Add a call to CreateSensor() in the Start() Method to create the TotalAudits Sensor

  ```
  Do ..CreateSensor("TotalAudits","","","",0,"",">","The total number of audits in the CacheAudit database.")
  ```

  - From left to right the arguments passed to ..CreateSensor() are
    - Sensor: The name of the sensor to create
    - Item: The sub category of the sensor we are going to create
    - Warning Value: The value at which the sensor is in a unusual state if exceeded
    - Critical Value: The value at which the sensor is in a alert state if exceeded
    - Alert Flag: Boolean flag representing if alerts and warnings should be logged
    - Units: The unit that the sensors metric is measured in
    - Operator: How the sensors value should be compared to Warning and Critical Values (aka if its lower or higher values are worse states)
    - Description: A short explanation of the sensor

2. Add a call to SetSensor() in the GetSensors() Method to populate readings of the TotalAudits Sensor

  ```
  // The global ^["^^cacheaudit"]CacheAuditD stores the total number of audits
  Set TotalAudits = ^["^^cacheaudit"]CacheAuditD

  Do ..SetSensor("TotalAudits", TotalAudits)
  ```

  - From left to right the arguments passed to ..CreateSensor() are
    - Sensor: The name of the sensor
    - Value: The value the sensor is to record

#### AuditsPerSecond Sensor
The AuditsPerSecond sensor builds off the TotalAudits sensor, adding the functionality to compute the change in value of the metric


1. Add two new properties to the sensor collection class, one called "LastReading" and the other "ElapsedSeconds". These will be used to calculate the total time since the last reading of the sensors.

  ```
  /// Time of last reading
  Property LastReading As %Integer;

  /// Elapsed seconds since LastReading at the start of current GetSensors() call
  Property ElapsedSeconds As %Integer;
  ```

2. Add a new property to the sensor collection class called "PrevTotalAudits", this will store the last value so it can be compared to the current value

  ```
  /// Value of TotalAudits during the last GetSensors() call
  Property PrevTotalAudits As %Integer [InitialExpression = 0];
  ```

3. Add a call to CreateSensor() in the Start() Method to create the AuditsPerSecond Sensor

  ```
  Do ..CreateSensor("AuditsPerSecond","","","",0,"",">","The number of audits added to the Cache Audit database per second.")
  ```

4. Calculate the total time since the last GetSensors() call

  ```
  // Get the Current time
  Set CurReading = $p($zh,".",1)

  // Calculate the difference between the last reading time and the current time
  Set ..ElapsedSeconds = (time-..LastReading)

  // Store the current time for the next GetSensors() call
  Set ..LastReading = CurReading
  ```

5. Calculate the difference between the current number of audits and the previous number of audits in the GetSensors() Method

  ```
  Set TotalAudits = ^["^^cacheaudit"]CacheAuditD
  // Calculate the difference between the current and last reading's total audits
  Set DeltaAudits = TotalAudits - ..PrevTotalAudits
  ```

6. Calculate the change in number of audits per second

  ```
  Set AuditsPerSecond = DeltaAudits / ..ElapsedSeconds
  ```

7. Set the AuditsPerSecond sensor to the calcuated reading

  ```
  Do ..SetSensor("AuditsPerSecond", AuditsPerSecond)
  ```
8. Store this readings total audits for the next GetSenors() call

  ```
    Set ..PrevTotalAudits = TotalAudits
  ```

#### TotalAuditsOfType Sensor
The TotalAuditsOfType sensor builds is similar to the TotalAudits sensor as it records total values not deltas; however, it utilized items to categorize the counts into subgroups of the total value

1. Add a call to CreateSensor() in the Start() Method to create the AuditsPerSecond Sensor

  ```
  Do ..CreateSensor("TotalAuditsOfType","","","",0,"",">","The total number of audits grouped by type.")
  ```

2. In the GetSensors() Method, add a loop that parses through all the audits in the CahceAudit database and counts them by type

  ```
  // Get the first pointer in the Audit Global
	Set node = $QUERY(^["^^cacheaudit"]CacheAuditD)
	// Loop through all of the audits
	While (node '= "") {
		// Extract the 5th element of the entry (type of audit)
		Set auditType = $LIST(@node,5)

		// Add to counts, use dollar get to avoid errors of undefined types
		Set ..TotalAuditsOfType(auditType) = $GET(..TotalAuditsOfType(auditType), 0) + 1

		// Get the next pointer
		Set node = $QUERY(@node)
	}
  ```

3. After the counting loop, add another that call SetSensor() for each group found in the counting loop

  ```
  // Iteration begins at the empty string
	Set item = ""
	For {
		// Get the next item held in the multidimensional property
		Set item = $ORDER(..TotalAuditsOfType(item)) Quit:item=""

		// Set the sensor, defining the item so the subcategory will be used (or created then used)
		Do ..SetSensor("TotalAuditsOfType",..TotalAuditsOfType(item), item)

		// Reset the counts to 0
		Set ..TotalAuditsOfType(item) = 0
	}
  ```

  - We are using the third argument of SetSensor() in this case (something that was not done in either of the other two sensors). This is because we need to define an item for each group of audits. By passing in this third parameter the System Monitor Dashboard knows to create a new sensor item if it does not exist, then increment that items count not the parent sensors.

### Registering the Sensors

1. Using the Caché Terminal from the USER namespace run the System Monitor Manager Routine
  - `Do ^%SYSMONMGR`

2. The System Monitor Manager provides a list of functionality, to add sensors you will want to input 3 for "Confirgure System Monitor Components"

3. Input 1 for "Configure System Monitor Components"

4. Input 2 for "Add Class"

5. Input "USER.Dashboard.Sensors.Audit" as the class

6. Input "Sensors that monitor the audit database" as the description

7. Exit back to the main menu by inputting "4" then "2"

8. Input 1 for "Start/Stop System Monitor"

9. Input 2 to stop the system monitor

10 Input 1 to start the system monitor


### Registering the USER Namespace
The System Monitor Dashbaord only runs in namespaces it has been told to do so, thus if you are creating sensors in a namespace that has not been registered by the System Montior you must do so for the sensors to be seen.

1. Using the Caché Terminal switch to the %SYS namespace
  - `zn "%SYS"`

2. Using the Caché Terminal from the USER namespace run the System Monitor Manager Routine
  - `Do ^%SYSMONMGR`

3. The System Monitor Manager provides a list of functionality, to Register a namespace you will want to input 3 for "Confirgure System Monitor Components"

4. Input 2 for "Configure Startup Namespaces"

5. Input 2 for "Add Namespace"

6. Input "USER" for the namespace

7. Exit back to the main menu by inputting "4" then "2"

8. Input 1 for "Start/Stop System Monitor"

9. Input 2 to stop the system monitor

10 Input 1 to start the system monitor

# Done
The new sensors are now registered and should show up on the System Monitor Dashboard front end! It takes a few seconds to gather data to display, but they will be shown on the All Sensors tab.
