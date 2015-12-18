'use strict';

var chai = require('chai');
var should = chai.should();
chai.use(require('chai-things'));

var http = require('http');
var ws = require('ws');
var Broadcaster = require('../../app/broadcaster');
var wsServer;
var appServer;
var testPort = process.env.PORT || 54321;

describe('wsServer', function () {
  beforeEach(function () {
    appServer = http.createServer();
    appServer.listen(54321);
    wsServer = new Broadcaster(appServer);
  });

  afterEach(function () {
    wsServer.stop();
    appServer.close();
  });

  describe('module.exports', function () {

    it('should export a server object', function (done) {
      should.exist(wsServer);
      wsServer.should.be.an('object');

      done();
    });

    it('should have all public inteface methods', function (done) {
      var publicMethods = ['start', 'stop', 'broadcastStatus', 'broadcastStatusToClient'];

      publicMethods.should.all.satisfy(function (f) {
        return wsServer.should.respondTo(f);
      });

      done();
    });

  });

  describe('start', function () {

    it('should start a websocket server', function (done) {
      wsServer.start.should.not.throw();

      ws.connect('ws://localhost:' + testPort, done);
    });

    it('should emit connection event when a client connects', function (done) {
      wsServer.start();
      wsServer.once('connection', function (ws) {
        ws.should.be.an('object');

        done();
      });

      ws.connect('ws://localhost:' + testPort);
    });

  });

  describe('stop', function () {
    it('should stop a websocket server', function (done) {

      wsServer.start();

      var client = ws.connect('ws://localhost:' + testPort);
      client.once('open', function () {
        wsServer.stop.should.not.throw();
      });

      client.once('close', function () {
        done();
      });

    });

  });

});
