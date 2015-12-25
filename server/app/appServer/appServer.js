'use strict';

var http = require('http');
var enableDestroy = require('server-destroy');
var FileServer = require('file-server');
var url = require('url');
var logger = require('../logger');

function AppServer(gameLights) {

  var port;
  var appServer = http.createServer();
  enableDestroy(appServer);
  appServer.on('request', handleServerRequest);

  var fileServer = new FileServer(handleServerError);
  var serveSiteFolder = fileServer.serveDirectory('./public', {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpg'
  });

  parsePortSetting();

  this.start = function () {
    parsePortSetting();
    appServer.listen(port);
  };

  this.stop = function () {
    appServer.destroy();
  };

  this.getPort = function () {
    return port;
  };

  function parsePortSetting() {
    port = Number(process.env.PORT) || 4080;
  }

  function handleServerError(err, req, res) {
    logger.error('Error', err);
    res.writeHead(err.code || 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
  }

  function handleServerRequest(req, res) {
    try {

      var path = url.parse(req.url).pathname;
      if (path.startsWith('/toggle')) {
        // toggle light
        handleLightToggleRequest(path, req, res);
      }
      else if (path.startsWith('/reset')) {
        handleLightsResetRequest(path, req, res);
      }
      else {
        // serve public files
        handlePublicFilesRequest(path, req, res);
      }

    }
    catch (ex) {
      handleServerError(ex, req, res);
    }
  }

  function handleLightToggleRequest(path, req, res) {
    var lightIndex = path.substring(8);
    if (lightIndex.length > 0) {
      gameLights.toggle(Number(lightIndex), function (err, status) {
        if (err) {
          handleServerError({ code: 400, message: err.message }, req, res);
        }
        else {
          res.writeHead(200);
          res.end();
        }
      });
    }
    else {
      handleServerError({ code: 400, message: 'Please specify a light index to toggle' }, req, res);
    }
  }

  function handleLightsResetRequest(path, req, res) {
    gameLights.reset(function (err, status) {
      if (err) {
        handleServerError({ code: 400, message: err.message }, req, res);
      }
      else {
          res.writeHead(200);
          res.end();
      }
    });
  }

  function handlePublicFilesRequest(path, req, res) {

    if (path === '/') {
      path = '/index.html';
    }

    logger.info('Trying', path);
    serveSiteFolder(req, res, path);
  }

}

module.exports = AppServer;
