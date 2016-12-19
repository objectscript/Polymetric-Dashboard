# Quick Start Guide
Quickly install the Polymetric Dashboard using this kit.

**Table Of Contents**
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Contents of Kit](#contents-of-kit)
- [Instructions](#instructions)
	- [Download](#download)
	- [Install](#install)
	- [Use](#use)

<!-- /TOC -->

## Contents of Kit
The kit is made up of two xml files and one directory.

##### DashboardInstaller.xml
  - This xml file is the only file you will need to interact with to install the Polymetric Dashboard. It automatically sets up all necessary functionality for you.

##### DashboardSupport.xml
  - This xml file is an export of all the Caché code needed for monitoring the Caché environment.

##### dashboard/
  - This directory contains all the code needed for front end web page you will be interacting with.

## Instructions

### Download
 1. Download kit.zip
 2. Extract kit.zip
   - Remember the full path to the extracted kit, it will be used later.
     - example:  *C:/Users/user/Desktop/kit/*

### Install
 1. Open a Caché Terminal
   - On Windows machines, this can be done by selecting the Caché cube on the bottom right of the screen and choosing "Terminal" from the popup menu.
   - On Unix machines, this can be done by running the command `csession INSTANCE`
     - INSTANCE is the name of the Caché instance
 2. Change to the %SYS Namespace
   - `zn "%SYS"`
 3. Import DashboardInstaller.xml
   - `set status = $System.OBJ.Load(PATH TO DASHBOARDINSTALLER.XML, "ck")`
      - example PATH TO DASHBOARDINSTALLER.XML: *C:/Users/user/Desktop/kit/DashboardInstaller.xml*
 4. Install the Polymetric Dashboard
   - `set status = ##class(SYS.Monitor.DashboardInstaller).Install(PATH TO KIT, DEVELOPMENT MODE)`
     - example PATH TO KIT: *C:/Users/user/Desktop/kit/*
		 - DEVELOPMENT MODE: either 1 or 0.
		 	- If 1: CSP Gateway caching of front end files will be disabled, allowing for new changes to code to be shown immediately.
 		 	- If 0: CSP Gateway caching of front end files will be enabled, allowing for faster load times, but new changes to code will not be shown.
 5. Wait for the installation to complete.
   - *"Successfully Installed the Dashboard"* will be printed if the installation was successful
   - *"Failed to Install the Dashboard. Check for errors printed above, and returned by the Install Method"* will be printed along with the errors encountered if unsuccessful.

### Use
 1. Go to the System Management Portal using a web browser (performance is best using Google Chrome, or Firefox)
   - http://localhost:PORT/csp/sys/UtilHome.csp
     - PORT is the port the Cache Instance is using
 2. From the main page select "System Operation"
 3. From the "System Operation" menu select "System Dashboard"
 4. Click the blue "Polymetric Dashboard" button
