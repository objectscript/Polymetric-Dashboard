# The System Monitor Dashboard
Fully customizable Caché system monitoring.

## Table of Contents
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Overview](#overview)
- [Demo](#demo)
- [Usage](#usage)
	- [Requirements](#requirements)
	- [Dependencies](#dependencies)
	- [Installation](#installation)
		- [Quick Start Kit](#quick-start-kit)
		- [Source Code](#source-code)
- [Customization](#customization)
	- [Creating New Sensors](#creating-new-sensors)
	- [The Rest API](#the-rest-api)
	- [The Front End](#the-front-end)

<!-- /TOC -->

## Overview
Current Caché system monitoring functionality provides real-time information about a Caché environment. This allows for preventative measures to be taken before system failure by highlighting specific metrics when they are at unusual or dangerous values. Additionally, diagnosis of past or current erroneous events is aided by informative logs that are created by the system monitoring process.

The System Monitor Dashboard project is a successor to the current system monitoring functionality. It combines new technology and modular design to create personalized and precise monitoring of a Caché environment as well as customizable and intuitive visualization of collected monitoring data.

## Demo
-Coming Soon-

## Usage
Once installed, the System Monitoring Dashboard can be accessed via the Caché System Management Portal.

To do so, start at the main page of the System Management Portal and choose <br />"System Operation" -> "System Dashboard" -> "System Monitor Dashboard".

### Requirements
 - Caché version 2016.1 or later
 - Browser (Google Chrome is suggested)

| IE  | Firefox | Chrome | Safari | Opera |
|-----|---------|--------|--------|-------|
| 11+ | 48+     | 53+    | tbd    | 40+   |

### Dependencies
1. [jQuery](http://jquery.com/download/) v1.11.3
2. [angular](https://angularjs.org/) v1.5.7
	- [modules](https://code.angularjs.org/1.5.7/) animate, aria, messages, sanitize
2. [ngStorage](https://github.com/auth0/angular-storage)
3. [angular-bind-html-compile](https://github.com/incuna/angular-bind-html-compile) v1.2.1
4.  [angular material](https://material.angularjs.org/1.1.0-rc.5/) v1.1.0
5.  [d3](https://d3js.org/) v3.4.13
6. [nvd3](http://nvd3.org/index.html) v1.8.4
7. [moment](http://momentjs.com/) v2.10.6
8. [moment-timezone](http://momentjs.com/timezone/) v0.5.4
9. [lodash](https://lodash.com/) v4.14.0
10. [jQueryUI](https://jqueryui.com/) v1.12.0
11. [gridstack](https://github.com/troolee/gridstack.js) v0.2.5

### Installation
The System Monitor Dashboard can be installed automatically with the [quick start kit](https://github.com/CDTiernan/SystemMonitorDashboard/tree/master/dist), or manually with the [source code](https://github.com/CDTiernan/SystemMonitorDashboard/tree/master/src).

#### Quick Start Kit
Use the kit if you are not planning on customizing any of the code but want to use the monitoring capabilities of the System Monitoring Dashboard.

 - The [kit](https://github.com/CDTiernan/SystemMonitorDashboard/tree/master/dist) can be found in the *dist/* directory.

#### Source Code
Install the source code if you want to more fully understand functionality of the System Monitoring Dashboard and be able to contribute.

 - The [source code](https://github.com/CDTiernan/SystemMonitorDashboard/tree/master/src) can be found in the *src/* directory.
 - Instructions detailing [installation using the source code](https://github.com/CDTiernan/SystemMonitorDashboard/blob/master/docs/InstallUsingSourceCode.md) are located in the *docs/* directory.

## Customization
The System Monitor Dashboard is built to be customizable by design.

### Creating New Sensors
The System Monitor Dashboard in its default configuration has over 100 sensors. However, this collection can be modified by defining new sensors and the defaults can be removed.

Instructions upon how to [create new sensors](https://github.com/CDTiernan/SystemMonitorDashboard/blob/master/docs/CreatingNewSensors.md) are defined in the *docs/CreatingNewSenors.md* file.


### The Rest API
A simple REST API connects the back end monitoring and front end dashboard of the System Monitor Dashboard.

The [REST API's schema](https://github.com/CDTiernan/SystemMonitorDashboard/blob/master/docs/RestApi.md) is defined in the *docs/RESTApi.md* file.

### The Front End
The front end of the System Monitor Dashboard is built using Angular and nvd3 charts. The visualization tools used are modular and can be easily used anywhere throughout the app. However, it is also possible to change the content structure of the System Monitor Dashboard or even create a completely front end.

Details of [the front end](https://github.com/CDTiernan/SystemMonitorDashboard/blob/master/docs/ChangingTheFrontEnd.md) are described in the *docs/ChangingTheFrontEnd.md* file.
