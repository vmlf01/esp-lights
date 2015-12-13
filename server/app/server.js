var http = require('http');
var ws = require('ws');
var FileServer = require('file-server');
var url = require('url');
var enableDestroy = require('server-destroy');

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

function start() {
  var port = process.env.PORT || 4080;
  appServer.listen(port, handleServerConnection);
}

function getPort() {
  return appServer.address().port;
}

function stop() {
  appServer.destroy();
}

function handleServerConnection(req, res) {
}

function handleServerError(error, req, res) {
  console.log('Error', error);
  res.statusCode = error.code || 500;
  res.end(error.message || 'Internal Server Error');
}

function handleServerRequest(req, res) {
  try {
    var filename = url.parse(req.url).pathname;
    if (filename === '/') {
      filename = '/index.html';
    }
    console.log('Trying', filename);
    serveSiteFolder(req, res, filename);
  }
  catch(ex) {
    handleServerError(ex, req, res);
  }
}

function handleWebsocketConnection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  console.log('New ws connection', location);

  ws.on('message', function incoming(message) {
    console.log('incoming', message);
  });
}

/*
wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});
*/

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

