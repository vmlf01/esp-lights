'use strict';

var logger = require('./logger');
var AppServer = require('./appServer');
var Broadcaster = require('./broadcaster');
var Lights = require('./lights');
var App = require('./app');

var numberOfLights = process.env.NUMBER_LIGHTS || 4;

var lights = [];

for (var i = 0; i < numberOfLights; i++) {
  lights.push(new Lights.Light());
}

var game = new Lights.GameLights(lights);
var appServer = new AppServer(game);
var broadcaster = new Broadcaster(appServer);
new App(game, broadcaster);

appServer.start();
broadcaster.start();
game.init();

logger.info('Game Server is running on http://localhost:' + appServer.getPort());
