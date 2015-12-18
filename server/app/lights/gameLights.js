'use strict';

var util = require('util');
var events = require('events');

function GameLights(lights) {
  events.EventEmitter.call(this);

  if (lights.length < 2) {
    throw new Error('We need at least 2 lights to play the game');
  }

  var gameLights = lights.slice();

  this.init = function () {
    randomizeLightStatus();
    this.emit('change', gameLights);
  };

  this.toggle = function (lightIndex, cb) {
    if (isValidIndex(lightIndex)) {
      gameLights[lightIndex].isOn = !gameLights[lightIndex].isOn;
      this.emit('change', gameLights);
      return cb && cb(null, gameLights);
    }
    else {
      return cb && cb(new Error('Invalid light index => ' + lightIndex), gameLights);
    }
  };

  this.getLights = function (/* optional */ lightIndex, cb) {
    if (typeof(lightIndex) === typeof(Function)) {
      cb = lightIndex;
      return cb(null, gameLights);
    }
    else if (isValidIndex(lightIndex)) {
      return cb(null, gameLights[lightIndex]);
    }
    else {
      return cb(new Error('Invalid light index => ' + lightIndex), gameLights);
    }
  };

  function randomizeLightStatus () {
    gameLights.forEach(function (light) {
      light.isOn = getRandomStatus();
    });

    // ensure at least one light is on and another is off
    gameLights[1].isOn = !gameLights[0].isOn;
  }

  function getRandomStatus () {
    var value = getRandomInt(0, 2);

    return value === 1;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function isValidIndex (index) {
    return Number.isInteger(index) && index < gameLights.length;
  }
}

util.inherits(GameLights, events.EventEmitter);

module.exports = GameLights;
