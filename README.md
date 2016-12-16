# The Polymetric Dashboard
Fully customizable Caché system monitoring.

**Table of Contents**
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [The Polymetric Dashboard](#the-polymetric-dashboard)
	- [Overview](#overview)
	- [Usage](#usage)
		- [Requirements](#requirements)
		- [Dependencies](#dependencies)
	- [Installation](#installation)
			- [Quick Start Kit](#quick-start-kit)
			- [Source Code](#source-code)
	- [Documentation](#documentation)

<!-- /TOC -->

## Overview
Current Caché system monitoring functionality provides real-time information about a Caché environment. This allows for preventative measures to be taken before system failure by highlighting specific metrics when they are at unusual or dangerous values. Additionally, diagnosis of past or current erroneous events is aided by informative logs that are created by the system monitoring process.

The Polymetric Dashboard project is a successor to the current system monitoring functionality. It combines new technology and modular design to create personalized and precise monitoring of a Caché environment as well as customizable and intuitive visualization of collected monitoring data.

## Usage

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

## Installation
Head over to the [Releases](https://github.com/intersystems/Polymetric-Dashboard/releases) to download a specific version of the Polymetric Dashboard.

#### Quick Start Kit
An automated and quick installation process. Use the kit if you are not planning on customizing any of the code but want to use the monitoring capabilities of the Polymetric Dashboard.
- [Kit Install Instructions](https://github.com/intersystems/Polymetric-Dashboard/blob/master/docs/InstallUsingKit.md)

#### Source Code
A manual and more complex installation process. Download the source code if you want to more fully understand functionality of the Polymetric Dashboard and be able to contribute.
- [Source Code Install Instructions](https://github.com/intersystems/Polymetric-Dashboard/blob/master/docs/InstallUsingSourceCode.md)

## Documentation
More detailed documentation can be found on the [InterSystems'](https://docs.intersystems.com/webdocs/GPD/GPD.html) website.
