'use strict';

var chai = require('chai');
var should = chai.should();
chai.use(require('chai-things'));

var http = require('http');
var ws = require('ws');
var Broadcaster = require('../../app/broadcaster');
var lights = require('../../app/lights');

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

  describe('broadcast', function () {
    var clientCount;
    var testLights;
    var connectionCount;
    var clients;

    var initTestLights = function () {
      testLights = [
        new lights.Light(),
        new lights.Light(),
        new lights.Light()
      ];

      testLights[1].isOn = true;
    };

    var resetClientConnectionCount = function () {
      clientCount = 3;
      connectionCount = 0;
    };

    var connectionHandler = function (broadcastTestSender) {
      return function () {
        connectionCount = connectionCount + 1;
        if (connectionCount === clientCount) {
          broadcastTestSender();
        }
      };
    };

    var setupClientConnections = function (broadcastTestSender, messageHandler) {
      clients = [];

      var client;
      for (var i = 0; i < clientCount; i++) {
        client = ws.connect('ws://localhost:' + testPort);
        client.once('open', connectionHandler(broadcastTestSender));
        client.once('message', messageHandler);
        clients.push(client);
      }
    };

    beforeEach(function () {
      initTestLights();
      resetClientConnectionCount();
      wsServer.start();
    });

    it('should broadcast lights status update message', function (done) {
      var broadcastTestStatus = function () {
        wsServer.broadcastStatus(testLights);
      };

      var messagesReceived = 0;
      var messageHandler = function (msg, flags) {
        msg = JSON.parse(msg);

        msg.type.should.be.equal('status');
        msg.lights.should.deep.equal(testLights);

        messagesReceived = messagesReceived + 1;
        if (messagesReceived === 1) {
          done();
        }
      };

      setupClientConnections(broadcastTestStatus, messageHandler);
    });

    it('should broadcast status to all connected clients', function (done) {

      var broadcastTestStatus = function () {
        wsServer.broadcastStatus(testLights);
      };

      var messagesReceived = 0;
      var messageHandler = function (msg, flags) {
        messagesReceived = messagesReceived + 1;

        if (messagesReceived === clientCount) {
          done();
        }

      };

      setupClientConnections(broadcastTestStatus, messageHandler);
    });

    it('should broadcast to specified client only', function (done) {

      var testClient;
      wsServer.once('connection', function (ws) {
        testClient = ws;
      });

      var broadcastTestStatus = function () {
        wsServer.broadcastStatusToClient(testClient, testLights);
      };

      var messagesReceived = 0;
      var messageHandler = function (msg, flags) {
        messagesReceived = messagesReceived + 1;

        setTimeout(function () {
          messagesReceived.should.be.equal(1, 'Too many status updates received');
          done();
        }, 100);
      };

      setupClientConnections(broadcastTestStatus, messageHandler);
    });

  });

});
