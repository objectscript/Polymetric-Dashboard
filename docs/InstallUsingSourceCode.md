# Installation Using the Source Code
Installation of the Dashboard can be compeleted without the use of the [quick start kit](https://github.com/CDTiernan/SystemMonitorDashboard/tree/master/dist). This approach is more technical but provides an overview of the components and functionality of the Dashboard. It is suggested that users who want to extend and customize the Dashboard follow these instructions so they can get a better idea of how and where metrics are collected and displayed.

## Download the Source Code
The source code is contained within the [*/src*](https://github.com/CDTiernan/SystemMonitorDashboard/tree/master/src) directory of the GitHub repo. To download the source code, you can either clone the repository or download the source code a specific version Dashboard by viewing the [realeases](https://github.com/CDTiernan/SystemMonitorDashboard/releases).

## Installation
The installation of the Dashboard requires changes and additions to multiple aspects of the Cache environment; however, these changes are isolated and should not cause issues with existing functionality.

###	Front End
1. Move the */src/dashboard* directory into the */CSP/sys* sub-directory of the Cache install directory.
 - An example of where to put */src/dashboard* is *C:/InterSystems/Cache/CSP/sys*
 - This directory is suggested, but anywhere on the file system will work, it is important to remember the path to the *dashboard* directory as the bankend will need to be told where to find it.
2. Install the dependencies using [node package manager](https://www.npmjs.com/)
 - From the command line navigate to the */src/dashboard* in the Cache install directory and run the command `npm install`

###	Back End
1. Import the back end supporting code contained within DashboardSupport.xml.
 - DashboardSupport.xml contains following files:
    - **NEW** %SYS.Monitor.AbstractSensor.CLS
    - **NEW** %SYS.Monitor.ComponentClass.CLS
    - **UPDATED** %SYS.Monitor.Control.CLS
    - **UPDATED** %SYS.Monitor.CLS
    - **NEW** %SYS.Monitor.AbstractDashboard.CLS
    - **NEW** %SYS.Monitor.Sensor.CLS
    - **NEW** %SYS.Monitor.Reading.CLS
    - **NEW** SYS.Monitor.DashboardSensors.CLS
    - **NEW** %Dashboard.REST.CLS
    - **NEW** %Api.Dashboard.CLS
    - **NEW** %Api.Dashboard.v3.CLS
    - **UPDATED** %SYSMONMGR.MAC
    - **UPDATED** /csp/sys/op/UtilDashboard.CSP
    - **NEW** /csp/sys/dashboard/Dashboard.CSP
2. Set up the necessary web applications.
 1. From the System Management Portal select *System Adimistration -> Security -> Applications -> Web Applications*
 2. **/api/dashboard/** the REST API
    1. Click "Create New Web Application"
    2. Set up the appropriate properties.
       - Name: /api/dashboard/
       - Description: Dashboard REST API
       - Namespace: %SYS
          - Do not select "Namespace Default Application"
       - Enable only "Application", "CSP/ZEN", and "Inbound Web Services"
       - Leave Permitted Classes blank
       - Do not change Securtiy Settings
       - Set Session Settings to
           - Session Timeout: 3600
           - Leave Event Class blank
           - Use Cookie for session: "Always"
           - Session Cookie Path: "/api/dashboard/"
       - Dispatch Class: "Api.Dashboard"
       - All other settings should be left as the default.
    3. Click "Save"
  3. **/csp/sys/dashboard/** to serve the front end files
     1. Click "Create New Web Application"
     2. Set up the appropriate properties.
        - Name: /csp/sys/dashboard
        - Description: Dashboard
        - Namespace: %SYS
           - Do not select "Namespace Default Application"
        - Enable only "Application", "CSP/ZEN", and "Inbound Web Services"
        - Leave Permitted Classes blank
        - Set Securtiy Settings to
           - Resource Required %Admin_Operate
           - Group By ID: %ISCMgtPortal
           - Do not change Allowed Authentication Methods
        - Set Session Settings to
            - Session Timeout: 28800
            - Leave Event Class blank
            - Use Cookie for session: "Always"
            - Session Cookie Path: "/csp/sys/dashboard"
        - Leave Dispatch Class blank.
        - Set CSP File Settings to
            - Serve Files: Always
            - Serve Files Timeout: 3600
            - CSP Files Physical Path: The path to the front end code, the *dashboard/* directory referenced in the Front End section
                - Example: `C:/Users/example/Desktop/SystemMonitorDashboard/src/`
            - Leave Package Name blank
            - Leave Default Superclass blank
            - CSP Settings select "Recurse" and "Lock CSP Name"
        - Leave all settings in Custom Pages Blank
     3. Click "Save"
4. Add the Dashboard Sensors to the System Monitor process
   1. From the Cache Terminal go to the %SYS namespace
       - `zn "%SYS"`
   2. Run the System Monitor Manager Routine
       - `d ^%SYSMONMGR`
   3. Configure System Monitor Classes
       - `3`
   4. Configure System Monitor Components
       - `1`
   5. Add Class
       - `2`
   6. Class?
       - `SYS.Monitor.DashboardSensors`
   7. Description?
       - `Default Dashboard Sensors`
   8. Exit to Main Menu
       - `4` then `3`
5. Restart the System Monitor
   1. Start/Stop System Monitor
       - `1`
   2. Stop, then Start the System Monitor
       - `2` then `1`
   3. Exit to Main Menu
       - `3`


## Using the Dashboard
1. From the System Mangament Portal select *System Opertation -> System Dashboard*
2. Click the last blue button labeled "Polymetric Dashboard"
3. The Dashboard should be visible, and data collected will be displayed automatically
