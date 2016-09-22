# User Defined Sensors

## Overview
The System Monitor Dashboard provides the functionality and structure for users to create their own sensors. These sensors can be added to the monitoring process, and the data collected by them displayed on the front end of the application.

## Namespaces
The System Monitoring Dashboard's default collection of sensors is defined in the %SYS namespace because it it maintained by InterSystems. Users are *strongly* discouraged from changing the default sensor definitions or create new sensor definitions in the %SYS namespace. The System Monitor Dashboard can read data from sensors in any namespace, so users are encouraged to define custom sensors in any of their own namespaces.

## Procedure
1. Create a Sensor Collection Class
  - Must inherit from `%SYS.Monitor.AbstractDashboard`
2. Create the Start Method that calls `CreateSensor()` for each individual sensor you want to define
  - `Method Start() As %Status {...}`, overrides `%SYS.Monitor.AbstractDashboard.Start()` and will be called automatically during the initialization of the System Monitor Dashboard
3.	Create the GetSensors Method calling `SetSensor()` for each individual sensor you want to record data from
  - `Method GetSensors() As %Status {...}`, overrides `%SYS.Monitor.AbstractDashboard.GetSensors()` and will be called automatically during during each sampling period.
4.	Use the System Monitor Manager to add your new Sensor Collection Class to the System Monitor Dashboard

## Example
In order to describe the creation of new user difined sensors more clearly, lets go through a concrete example.

We will be creating

`CreateSensor(Sensor As %String, Item As %String, CriticalValue As %String, WarningValue As %String, Alert As %String, Units As %String, Operator As %String, Description As %String = )`

In the AbstractDashboard.GetSensors() () method, call SetSensor() for each individual Sensor they want to record.
