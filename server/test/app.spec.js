'use strict';

var chai = require('chai');
//var should = chai.should();
chai.use(require('chai-things'));

var App = require('../app/app');
var app;
var gameMock;
var broadcasterMock;

describe('app', function () {

  beforeEach(function () {
    gameMock = {
      registeredEventName: '',
      registeredEventHandler: null,

      on: function (eventName, eventHandler) {
        this.registeredEventName = eventName;
        this.registeredEventHandler = eventHandler;
      },

      triggerChangeEvent: function () {
        this.registeredEventHandler([]);
      },

      getLights: function (cb) {
        cb(null, []);
      }

    };

    broadcasterMock = {
      registeredEventName: '',
      registeredEventHandler: null,
      broadcastStatusCalled: false,
      broadcastStatusToClientCalled: false,

      on: function (eventName, eventHandler) {
        this.registeredEventName = eventName;
        this.registeredEventHandler = eventHandler;
      },

      triggerConnectionEvent: function () {
        this.registeredEventHandler([]);
      },

      broadcastStatus: function () {
        this.broadcastStatusCalled = true;
      },

      broadcastStatusToClient: function () {
        this.broadcastStatusToClientCalled = true;
      }

    };

    app = new App(gameMock, broadcasterMock);
  });

  it('should register for game status change events', function (done) {
    gameMock.registeredEventName.should.equal('change');

    done();
  });

  it('should register for new client connection events', function (done) {
    broadcasterMock.registeredEventName.should.equal('connection');

    done();
  });

  it('should call broadcast status when game status changes', function (done) {
    gameMock.triggerChangeEvent();
    broadcasterMock.broadcastStatusCalled.should.equal(true);

    done();
  });

  it('should call broadcast status when client connects', function (done) {
    broadcasterMock.triggerConnectionEvent();
    broadcasterMock.broadcastStatusToClientCalled.should.equal(true);

    done();
  });

  it('should call broadcast status when game status changes', function (done) {
    gameMock.triggerChangeEvent();
    broadcasterMock.broadcastStatusCalled.should.equal(true);

    done();
  });
});
