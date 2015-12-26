'use strict';

var util = require('util');
var EventEmitter = require('events');
var ws = require('ws');

var logger = require('../logger');

function Broadcaster(appServer) {

  EventEmitter.call(this);

  var self = this;
  var httpServer = appServer.getHttpServer();
  var wsServer = null;

  this.start = function () {
    if (wsServer !== null) {
      self.stop();
    }

    wsServer = new ws.Server({server: httpServer});
    wsServer.on('connection', handleWebsocketConnection);
  };

  this.stop = function () {
    if (wsServer !== null) {
      wsServer.removeListener('connection', handleWebsocketConnection);
      wsServer.close();
      wsServer = null;
    }
  };

  this.broadcastStatus = function (isFinished, status) {
    if (wsServer !== null) {
      broadcastLightsStatus(wsServer.clients, isFinished, status);
    }
  };

  this.broadcastStatusToClient = function (client, isFinished, status) {
    if (wsServer !== null) {
      broadcastLightsStatus([client], isFinished, status);
    }
  };

  function handleWebsocketConnection(ws) {
    try {
      logger.info('New ws connection', ws.upgradeReq.url);
      self.emit('connection', ws);
    }
    catch (ex) {
      logger.error('Error handling ws connection', ex);
    }
  }

  function broadcastLightsStatus(wsClients, isFinished, status) {

    var msg = { type: 'status', isFinished: isFinished, lights: status };

    logger.info('Sending game status message', msg);

    wsClients.forEach(function (ws) {
      ws.send(JSON.stringify(msg), function (err) {
        if (err) {
          logger.error('Error broadcasting status update', err);
        }
      });
    });

  }
}

util.inherits(Broadcaster, EventEmitter);

module.exports = Broadcaster;
