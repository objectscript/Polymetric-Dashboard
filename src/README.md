# The Source Code
The code that makes the System Monitor Dashboard work.

## Orginization

##### DashboardSupport.xml
  - This xml file is an export of all the Caché code needed for monitoring the Caché environment.

##### Dashboard.csp
  - This is the "index.html" of the System Monitor Dashboard. It is the file that is served when a user wants to visit the System Monitor Dashboard, and is the page template where angular builds the one page application.

##### app/
  - This directory contains all the angular code that creates the application.

##### assets/
  - This directory contains all the custom css styles, fonts, and 3rd party libraries used by the application.

## Instruction
Instructions detailing [installation using the source code](https://github.com/CDTiernan/SystemMonitorDashboard/blob/master/docs/InstallUsingSourceCode.md) are located in the docs/ directory.
