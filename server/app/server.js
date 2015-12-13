var http = require('http');
var ws = require('ws');
var FileServer = require('file-server');
var url = require('url');
var enableDestroy = require('server-destroy');

var lights = require('./lights');
lights.init(3, function (err, status) {

});

var appServer = http.createServer();
enableDestroy(appServer);

var wsServer = new ws.Server({server: appServer});

var fileServer = new FileServer(handleServerError);
var serveSiteFolder = fileServer.serveDirectory('./public', {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpg'
});

appServer.on('request', handleServerRequest);
wsServer.on('connection', handleWebsocketConnection);

function start(cb) {
  var port = process.env.PORT || 4080;
  appServer.listen(port, cb);
}

function getPort() {
  return appServer.address().port;
}

function stop() {
  appServer.destroy();
}

function handleServerError(err, req, res) {
  console.log('Error', err);
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
    lights.toggle(Number(lightIndex), function (err, status) {
      if (err) {
        handleServerError({ code: 400, message: err.message }, req, res);
      }
      else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: status }));

        // broadcast updated status to all connected ws clients
        broadcastLightsStatus(wsServer.clients);
      }
    });
  }
  else {
    handleServerError({ code: 400, message: 'Please specify a light index to toggle' }, req, res);
  }
}

function handlePublicFilesRequest(path, req, res) {

  if (path === '/') {
    path = '/index.html';
  }

  console.log('Trying', path);
  serveSiteFolder(req, res, path);
}

function handleWebsocketConnection(ws) {
  try {
    var location = url.parse(ws.upgradeReq.url, true);
    console.log('New ws connection', location);

    broadcastLightsStatus([ws]);
  }
  catch (ex) {
    console.log('Error handling ws connection', ex);
  }
}

function broadcastLightsStatus(wsClients) {

  lights.getStatus(function (err, status) {
    var msg;

    if (err) {
      console.log('Error getting lights status', err);
      msg = { type: 'status', isError: true, error: err.message };
    }
    else {
      msg = { type: 'status', isError: false, status: status };
    }

    wsClients.forEach(function (ws) {
      ws.send(JSON.stringify(msg), function (err) {
        if (err) {
          console.log('Error broadcasting status update', err);
        }
      });
    });

  });

}

function isMainModule() {
  return require.main === module;
}

if (isMainModule()) {
  start();
  console.log('Listening on ', getPort());
}
else {
  module.exports = {
    getPort: getPort,
    start: start,
    stop: stop
  };
}

