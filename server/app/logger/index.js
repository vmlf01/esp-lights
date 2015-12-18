'use strict';

var winston = require('winston');
var fs = require('fs');

(function ensureLogsDirExists() {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
}());

var logger = new (winston.Logger)({
  level: 'info',
  transports: [
    new (winston.transports.Console)()
    //new (winston.transports.File)({
    //  name: 'info-file',
    //  filename: 'logs/esp-lights.log',
    //  level: 'info'
    //}),
    //new (winston.transports.File)({
    //  name: 'error-file',
    //  filename: 'esp-lights.error.log',
    //  level: 'error'
    //})
  ]
});

module.exports = logger;
