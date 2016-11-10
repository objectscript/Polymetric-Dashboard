// require testing dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var btoa = require('btoa');
var moment = require('moment');

// Use chai-http to make requests
chai.use(chaiHttp);

// Setup costants
var TSFORMAT = 'YYYY-MM-DD HH:mm:ss';
var STARTTIME = moment.utc().subtract(1, 'hour').format(TSFORMAT);
var SENSORTOTEST = { // what sensor will be used to vigorously test the routes that require a sensor when making the request
  'namespace': '%SYS',
  'sensor': 'CPUusage',
  'item': '-'
};

// Initialize global vars
var url; // the host and port of which to call
var credentials; // user credentials needed to make calls
var sensor; // var storing the returned data of sensorToTest
var sensorCalcDataVerification; // when the sensorToTest's chart data is recieved (using the reading interval) its calculated data will be calculated to verify the GetCalculatedData route
var allPassed = true; // flag used to test if all the tests were passed (if so "SUCCES" will be printed after all of the tests have been run)

// The parent block of all tests
describe('Dashboard REST API Test Suite\n', function() {
  /*****************************
   * Hooks into Testing Events *
   *****************************/
  before(function(done) { // called before any tests are run
    // if host and port were passed in as arguments
    if (process.argv[3] !== undefined && process.argv[4] !== undefined) {
      url = 'http://' + process.argv[3].replace('-', '') + ':' + process.argv[4].replace('-', '') + ''; // the url is built using the passed in host and port values
      if (process.argv[5] !== undefined && process.argv[6] !== undefined) {
        credentials = {
          'user': process.argv[5].replace('-', ''),
          'pass': process.argv[6].replace('-', '')
        };
      }
    } else {
      // if no host or port were defined Throw an error and abort testing.
      throw new Error('No host or port passed into the test, aborting.\n The call should follow this structure "npm test -- \"HOST\" \"PORT\".');
    }

    done();
  });

  afterEach(function(done) { // Function called after every (pass or failed) test (skipped tests do not trigger this event)
    allPassed = allPassed && (this.currentTest.state === 'passed');

    done();
  });

  after(function(done) { // Function called after all tests completed (passed, failed, or skipped)
    console.log('\n');
    if (sensor) {
      if (allPassed) console.log('SUCCESS');
    } else {
      console.warn('Could not find the sensor [' + SENSORTOTEST.namespace + '] ' + SENSORTOTEST.sensor + ', ' + SENSORTOTEST.item + ' on the server. \nALL OTHER ROUTES TESTS WILL BE SKIPPED.');
    }

    done();
  });

  /*****************************
   * Test the GetSensors Route *
   *****************************/
  describe('GET /Sensors', function() {
    it('SHOULD GET all sensors: Validate their properties', function(done) {
      chai.request(url)
        .get('/api/dashboard/v3/Sensors?encryption=base64')
        .end(function(err, res) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.above(0);
          for (var i = 0; i < res.body.length; i++) {
            res.body[i].should.have.property('namespace').not.equal('');
            res.body[i].should.have.property('sensor').not.equal('');
            res.body[i].should.have.property('item').not.equal('');
            validateSensorIdentifiers(res.body[i].namespace, res.body[i].sensor, res.body[i].item);
            res.body[i].should.have.property('description');
            res.body[i].should.have.property('readingInterval').to.be.above(0);
            res.body[i].should.have.property('warningValue');
            res.body[i].should.have.property('criticalValue');
            res.body[i].should.have.property('operator').to.be.oneOf(['<', '>']);
            res.body[i].should.have.property('units');
            // if a waring and critical value are defined
            if (res.body[i].warningValue && res.body[i].warningValue) {
              validateStateLimits(res.body[i].warningValue, res.body[i].criticalValue, res.body[i].operator, res.body[i].units);
            }

            // if the sensorToTest is found, save it for use to test later routes
            if (res.body[i].namespace === SENSORTOTEST.namespace && res.body[i].sensor === SENSORTOTEST.sensor && res.body[i].item === SENSORTOTEST.item) {
              sensor = res.body[i];
            }
          }

          done();
        });

      // an object used to confirm that sensors only have the default item "-" if they do not have multiple items
      var sensorItems = {};
      // confirm that sensors either have one item (the default item "-"), or multiple items none of which being the default item ("-")
      function validateSensorIdentifiers(namespace, sensor, item) {
        // if the sensor has not been added to the sensorItems object yet, add it and continue
        if (sensorItems[namespace + '|' + sensor] === undefined) {
          // if the item is the default item "-", the value added is 0, otherwise 1
          sensorItems[namespace + '|' + sensor] = item !== '-';
        // otherwise the sensor has been added to the sensorItems object before
        } else {
          // assert that the items added previously and the current item are not the default item "-"
          // because if a sensor is returned with the default item "-" it should have no other items
          sensorItems[namespace + '|' + sensor].should.equal(item !== '-', 'Sensor [' + namespace + '] ' + sensor + ' cannot have multiple items and the default item "-". Sensors with the default item "-" must only have one item.');
        }
      }

      // confirm that the warning and critical values are valid (ex: a sensor with greater numbers being worse should not have a higher warning value than critical value)
      function validateStateLimits(warn, crit, operator, units) {
        // warning and critical value should not be equal, and if the operator is ">" warn should be lower than crit (vise versa for "<")
        if (operator === '>') warn.should.be.below(crit);
        else warn.should.be.above(crit);

        // If the sensors unit is "%" confirm that the warning and critical values are reasonable (should not have critical and warning values above 100 or below 0)
        if (units === '%') {
          warn.should.be.within(0, 100);
          crit.should.be.within(0, 100);
        }
      }
    });

    it('SHOULD NOT GET all of the sensors: Unsupported encryption query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors?encryption=PGP')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('encryption');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });

    it('SHOULD NOT GET all of the sensors: Misisng encryption query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
        .get('/api/dashboard/v3/Sensors')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('encryption');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });
  });

  /****************************
   * Test the GetSensor Route *
   ****************************/
  describe('GET /Sensors/:sensorID/Items/:itemID', function() {
    it('SHOULD GET the specified sensor: Validate its properties', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/Items/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('object');
            // confirm that the GetASensor route returns the same properties for the sensor as GetAllSensors does
            res.body.should.have.property('units', sensor.units);
            res.body.should.have.property('description', sensor.description);
            res.body.should.have.property('operator', sensor.operator);
            res.body.should.have.property('readingInterval', sensor.readingInterval);
            res.body.should.have.property('warningValue', sensor.warningValue);
            res.body.should.have.property('criticalValue', sensor.criticalValue);

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor: Missing namespace and encryption query params', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/Items/' + btoa(sensor.item))
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(2);
            res.body.error.should.include('namespace');
            res.body.error.should.include('encryption');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });
  });

  /*******************************
   * Test the GetChartData Route *
   *******************************/
  describe('GET /Sensors/:sensorID/ChartData/:itemID', function() {
    it('SHOULD GET the specified sensor\'s chart data (60 second sample interval): Validate chart data', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/ChartData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(STARTTIME) + '&samplePeriod=' + btoa(60) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.above(0);
            for (var i = 0; i < res.body.length; i++) {
              res.body[i].should.have.property('value').be.within(0, 100); // CPUusage is a percent so values cannot be below 0 or above 100
              res.body[i].should.have.property('timestamp').match(/\d{4}-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d/); // the timestamp must be in YYYY-MM-DD HH:mm:ss format
            }

            done();
          });
      }
    });

    it('SHOULD GET the specified sensor\'s chart data (reading interval second sample interval): Validate chart data', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/ChartData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(STARTTIME) + '&samplePeriod=' + btoa(sensor.readingInterval) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.above(0);
            // vars used to calculate and store the sensors calculated data
            var sum = 0;
            var max;
            var min;
            for (var i = 0; i < res.body.length; i++) {
              res.body[i].should.have.property('value').be.within(0, 100); // CPUusage is a percent so values cannot be below 0 or above 100
              res.body[i].should.have.property('timestamp').match(/\d{4}-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d/); // the timestamp must be in YYYY-MM-DD HH:mm:ss format
              if (max === undefined || res.body[i].value > max) max = res.body[i].value;
              if (min === undefined || res.body[i].value < min) min = res.body[i].value;
              sum += res.body[i].value;
            }

            var mean = sum / res.body.length;
            // if the mean is not an integer (it has decimels), then round it to 2 usits of precision (2.12314 -> 2.12) to match the backends precision
            if (!Number.isInteger(mean)) mean = Number(mean.toFixed(2));
            sensorCalcDataVerification = {
              'state': calculateSensorState(sensor.operator, sensor.criticalValue, sensor.warningValue, max, min),
              'max': max,
              'min': min,
              'mean': mean,
              'stdDev': calculateStandardDeviaition(res.body, mean),
              'timestamp': res.body[res.body.length - 1].timestamp
            };

            done();
          });

        // using the sensors properties and values, calculate what state it should be in
        function calculateSensorState(operator, crit, warn, max, min) {
          var state = 0; // default to 0 (normal)

          if (operator === '>') { // the ">" operator means greater values are worse
            if (crit !== undefined && max >= crit) state = 2; // if the maximum value exceeds the criticalValue of the sensor the state is 2 (alert)
            else if (warn !== undefined && max >= warn) state = 1; // if the maximum value only exceeds the warningValue of the sensor the state is 1 (warning)
          } else if (operator === '<') { // the "<" operator means lower values are worse
            if (crit !== undefined && min <= crit) state = 2; // if the minimum value is below the criticalValue of the sensor the state is 2 (alert)
            else if (warn !== undefined && min <= warn) state = 1; // if the minimum value is only below the warningValue of the sensor the state is 1 (warning)
          }

          return state;
        }

        // standard deviation calculation
        function calculateStandardDeviaition(body, mean) {
          // sym the squared distance from the mean each value is
          var squareDiff = 0;
          for (var i = 0; i < body.length; i++) {
            squareDiff += Math.pow(body[i].value - mean, 2);
          }

          var stdDev = squareDiff / body.length; // compute the average of the squared differences
          // if the mean is not an integer (it has decimels), then round it to 2 usits of precision (2.12314 -> 2.12) to match the backends precision
          if (!Number.isInteger(stdDev)) stdDev = Number(stdDev.toFixed(2));

          return stdDev;
        }
      }
    });

    it('SHOULD NOT GET the specified sensor\'s chart data: Invalid startTime (1 hour in the future) query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        var future = moment.utc().add(1, 'hour').format(TSFORMAT);
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/ChartData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(future) + '&samplePeriod=' + btoa(sensor.readingInterval) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('startTime');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor\'s chart data: Invalid startTime (wrong format) query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/ChartData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(STARTTIME.substr(2, STARTTIME.length)) + '&samplePeriod=' + btoa(sensor.readingInterval) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('startTime');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor\'s chart data: Invalid samplePeriod (below reading interval) query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/ChartData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(STARTTIME) + '&samplePeriod=' + btoa(sensor.readingInterval - 1) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('samplePeriod');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor\'s chart data: Missing namespace, startTime, samplePeriod, and encryption query params', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/ChartData/' + btoa(sensor.item))
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(4);
            res.body.error.should.include('namespace');
            res.body.error.should.include('startTime');
            res.body.error.should.include('samplePeriod');
            res.body.error.should.include('encryption');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });
  });

  /*************************************
   * Test the GetCalculatedtData Route *
   *************************************/
  describe('GET /Sensors/:sensorID/CalculatedData/:itemID', function() {
    it('SHOULD GET the specified sensor\'s calculated data: validate data', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/CalculatedData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(STARTTIME) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('object');
            // confirm that the returned calculated data is equivelent to the caludated data calculated from the data returned by the GetChartData route using the reading interval as a sample interval
            res.body.should.have.property('state', sensorCalcDataVerification.state);
            res.body.should.have.property('max', sensorCalcDataVerification.max);
            res.body.should.have.property('min', sensorCalcDataVerification.min);
            res.body.should.have.property('mean', sensorCalcDataVerification.mean);
            res.body.should.have.property('stdDev', sensorCalcDataVerification.stdDev);
            res.body.should.have.property('timestamp', sensorCalcDataVerification.timestamp);

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor\'s calculated data: Invalid startTime (1 day in the future) query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        var future = moment.utc().add(1, 'day').format(TSFORMAT);
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/CalculatedData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(future) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('startTime');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor\'s calculated data: Invalid startTime (wrong format) query param', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        var wrongFormat = moment.utc().subtract(1, 'hour').format('MM/DD/YYYY h:mm:ssa');
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/CalculatedData/' + btoa(sensor.item) + '?namespace=' + btoa(sensor.namespace) + '&startTime=' + btoa(wrongFormat) + '&encryption=base64')
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(1);
            res.body.error.should.include('startTime');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });

    it('SHOULD NOT GET the specified sensor\'s calculated data: Missing namespace, startTime, and encryption query params', function(done) {
      // This test requires that the sensorToTest be found on the server (thus populating the sensor var).
      if (!sensor) {
        this.skip(); // If the sensor var is undefined skip this test.
      } else {
        var wrongFormat = moment.utc().subtract(1, 'hour').format('MM/DD/YYYY h:mm:ssa');
        chai.request(url)
          .get('/api/dashboard/v3/Sensors/' + btoa(sensor.sensor) + '/CalculatedData/' + btoa(sensor.item))
          .end(function(err, res) {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('code').equal(400);
            res.body.should.have.property('error').be.a('array');
            res.body.error.length.should.be.equal(3);
            res.body.error.should.include('namespace');
            res.body.error.should.include('startTime');
            res.body.error.should.include('encryption');
            res.body.should.have.property('message').equal('Missing or invalid query parameters.');

            done();
          });
      }
    });
  });
});
