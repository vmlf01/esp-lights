var should = require('chai').should();
var request = require('request');

var server = require('../app/server');

describe('App server', function () {

  it('should export a server object', function (done) {
    should.exist(server);
    server.should.be.an('object');

    done();
  });

  it('should have a start method', function (done) {
    should.exist(server.start);
    server.start.should.be.an('function');

    done();
  });

  it('should have a stop method', function (done) {
    should.exist(server.stop);
    server.stop.should.be.an('function');

    done();
  });

  describe('with default env options', function () {

    beforeEach(function () {
      server.start();
    });

    afterEach(function () {
      server.stop();
    });


    it('should start a server on default port 4080', function (done) {
      server.getPort().should.equal(4080);

      done();
    });

  });

  describe('with custom env options', function () {
    var envPort = process.env.PORT;

    beforeEach(function () {
      process.env.PORT = 4081;
      server.start();
    });

    afterEach(function () {
      server.stop();
      if (envPort) {
        process.env.PORT = envPort;
      }
      else {
        delete process.env.PORT;
      }
    });

    it('should use process.env.PORT option if specified', function (done) {
      server.getPort().should.equal(4081);

      done();
    });

    it('should return 200 when requesting /', function (done) {
      request('http://localhost:4081/', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        done();
      });
    });

    it('should return 200 when toggling existing light', function (done) {
      request('http://localhost:4081/toggle/0', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        done();
      });
    });

    it('should return 400 when toggling non-existing light', function (done) {
      request('http://localhost:4081/toggle/115', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(400);
        done();
      });
    });

  });

});
