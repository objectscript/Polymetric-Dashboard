# The Source Code
The code that makes the System Monitor Dashboard Work.

## Orginization
 1. The DashboardSupport.xml file
  - This xml file is an export of all the Caché code needed for monitoring the Caché environment.
 2. Dashboard.csp
  - This is the "index.html" of the System Monitor Dashboard. It is the file that is served when a user wants to visit the System Monitor Dashboard, and is the page template where angular builds the one page application.
 3. The 'app' directory
  - This directory contains all the angular code that creates the application.
 4. The 'assets' directory
  - This directory contains all the custom css styles, fonts, and 3rd party libraries used by the application.
