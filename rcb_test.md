**Dashboard Documentation Contents                                         Sept 29, 2017**

1. overview of Dashboard package design and components

- Dashboard architecture consists of
  - front-end generating customizable UI that displays data from system and application sensors
  - REST API to retrieve data from sensors
  - predfined sensors and the ability to create custom sensors
- Dashboard components include
  - demo Dashboard installed alongside and integrating with Caché
  - open source install kits and front-end source code
  - REST API and predefined system sensors within Caché

1. overview of Dashboard functionality

- integrates with Caché management portal
- displays data from system and application sensors, contained in charts that cover a specified time period and allow display of maximum, minimum, mean, and standard deviation as well as current and previous values.
- chart period and sensor sampling interval are configurable Dashboard-wide.
- front end is highly customizable:
  - you can add tabs with your own custom set of sensors displayed as you want them
  - the Playground [name?] tab lets you experiment by trying out widgets representing selected sensors in different ways
- the Dashboard back end is also customizable, allowing you to create your own sensors

1. Installation instructions

- requirements &amp; dependencies
- quick start kit

- long install (source code)

1. the front end

- overview
- technologies
- visualizations        highlighted items are documented
- chart period and sampling interval        on Dashboard Showcase tab
- broadcast timer listener
- customization: tabs and visualizations (with code samples)

- building a custom front end

1. the REST API

- overview
- get all sensors (code samples)
- get a single sensor (code samples)
- get a sensor&#39;s chart data (code samples)
- get a sensor&#39;s calculated data (code samples)

- broadcast timer (code samples)

1. the back end

- predefined Caché sensors
- creating sutom sensors (with use cases and code samples)
