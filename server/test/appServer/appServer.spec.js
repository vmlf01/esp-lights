'use strict';

var chai = require('chai');
var should = chai.should();
chai.use(require('chai-things'));
var request = require('request');

var AppServer = require('../../app/appServer');
var appServer;

var gameLightsMock = {
  toggle: function (index, cb) {
    if (index < 5) {
      cb();
    }
    else {
      cb(new Error());
    }
  },

  reset: function (cb) {
    cb();
  }
};

describe('App server', function () {

  beforeEach(function () {
    appServer = new AppServer(gameLightsMock);
  });

  afterEach(function () {
  });

  describe('module.exports', function () {

    it('should export a server object', function (done) {
      should.exist(appServer);
      appServer.should.be.an('object');

      done();
    });

    it('should have all public inteface methods', function (done) {
      var publicMethods = ['start', 'stop', 'getPort'];

      publicMethods.should.all.satisfy(function (f) {
        return appServer.should.respondTo(f);
      });

      done();
    });

  });

  describe('with default env options', function () {
    var baseUrl = 'http://localhost:4080';

    beforeEach(function () {
      appServer.start();
    });

    afterEach(function () {
      appServer.stop();
    });

    it('should use default port 4080', function (done) {
      appServer.getPort().should.equal(4080);

      done();
    });

    it('should return 200 when requesting /', function (done) {
      request(baseUrl + '/', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        done();
      });
    });

    it('should return 200 when toggling existing light', function (done) {
      request(baseUrl + '/toggle/0', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        done();
      });
    });

    it('should return 400 when toggling non-existing light', function (done) {
      request(baseUrl + '/toggle/115', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(400);
        done();
      });
    });

    it('should return 200 when reseting existing light', function (done) {
      request(baseUrl + '/reset', function (err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        done();
      });
    });

  });

  describe('with custom env options', function () {
    var envPort = process.env.PORT;

    beforeEach(function () {
      process.env.PORT = 4081;
      appServer.start();
    });

    afterEach(function () {
      appServer.stop();
      if (envPort) {
        process.env.PORT = envPort;
      }
      else {
        delete process.env.PORT;
      }
    });

    it('should use process.env.PORT option if specified', function (done) {
      appServer.getPort().should.equal(4081);

      done();
    });

  });

});
