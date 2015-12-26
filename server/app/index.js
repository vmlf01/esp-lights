'use strict';

var logger = require('./logger');
var AppServer = require('./appServer');
var Broadcaster = require('./broadcaster');
var Lights = require('./lights');
var App = require('./app');

var numberOfLights = process.env.NUMBER_LIGHTS || 4;

var lights = [];
var light;

for (var i = 0; i < numberOfLights; i++) {
  light = new Lights.Light();
  light.index = i;
  lights.push(light);
}

var game = new Lights.GameLights(lights);
var appServer = new AppServer(game);
var broadcaster = new Broadcaster(appServer);
new App(game, broadcaster);

appServer.start();
broadcaster.start();
game.init();

logger.info('Game Server is running on http://localhost:' + appServer.getPort());
