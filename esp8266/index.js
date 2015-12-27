// 1 - create web server to display game configuration page
//    list all wifi networks
//    input wifi network password
//    input game endpoint url
//    connect button
//    display connection status
//

var wifi = require('Wifi');
var http = require('http');
var ws = require('ws');

function startWebServer (serverConfig) {
  webServer = http.createServer(handleServerRequest);
  webServer.listen(serverConfig.port);
  console.log('Web Server running on http://' + wifi.getIP().ip + ':' + serverConfig.port + '/');
}

function handleServerRequest (req, res) {
  //>url.parse('https://localhost:8080/index.html?a=2793', true)
  //={
  //  "protocol": "https:",
  //  "method": "GET",
  //  "host": "localhost",
  //  "path": "/index.html?a=2793",
  //  "pathname": "/index.html",
  //  "search": "?a=2793",
  //  "port": 8080,
  //  "query": {
  //    "a": "2793"
  //   }
  // }
  //>

  var reqParams = url.parse(req.url, true);

  if (reqParams.pathname === '/') {
    sendHomePage(res);
  }
  else if (reqParams.pathname === '/setup') {
    connectToNetwork(reqParams, function () {
      sendHomePage(res);
    });
  }
  else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("404: Page " + reqParams.pathname + " not found");
  }
}

function sendHomePage (res) {
  getWifiNetworks(function (wifiNetworks) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    writeHomePage(res, wifiNetworks);
  });
}

function writeHomePage (res, wifiNetworks) {
  res.write('<!DOCTYPE html>');
  res.write('<html>');
  res.write('<head>');
  res.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">');
  res.write('<title>ESP Lights Configuration</title>');
  res.write('<style>');
  res.write('body');
  res.write('{');
  res.write('background:#FF6600;');
  res.write('font-family:"Lucida Grande", Tahoma, Arial, Verdana, sans-serif;');
  res.write('}');
  res.write('#form_container');
  res.write('{');
  res.write('background:#fff;');
  res.write('margin:0px auto;');
  res.write('text-align:left;');
  res.write('width:640px;');
  res.write('}');
  res.write('h1');
  res.write('{');
  res.write('background-color:#FF9900;');
  res.write('margin:0px;');
  res.write('padding:10px;');
  res.write('}');
  res.write('form ul');
  res.write('{');
  res.write('padding:0px;');
  res.write('}');
  res.write('form li');
  res.write('{');
  res.write('display:block;');
  res.write('margin:0;');
  res.write('padding:10px;');
  res.write('position:relative;');
  res.write('}');
  res.write('form li.section_break');
  res.write('{');
  res.write('padding-bottom: 0px;');
  res.write('border-bottom:1px dotted #ccc;');
  res.write('}');
  res.write('.buttons input');
  res.write('{');
  res.write('font-size:120%;');
  res.write('}');
  res.write('input.text');
  res.write('{');
  res.write('font-size: 100%;');
  res.write('padding:4px;');
  res.write('}');
  res.write('select.select');
  res.write('{');
  res.write('font-size: 100%;');
  res.write('}');
  res.write('select.select[class]');
  res.write('{');
  res.write('padding:4px;');
  res.write('}');
  res.write('input.medium');
  res.write('{');
  res.write('width:50%;');
  res.write('}');
  res.write('select.medium');
  res.write('{');
  res.write('width:40%;');
  res.write('}');
  res.write('input.large');
  res.write('{');
  res.write('width:95%;');
  res.write('}');
  res.write('</style>');
  res.write('</head>');
  res.write('<body>');
  res.write('<div id="form_container">');
  res.write('<h1>ESP Lights Configuration</h1>');
  res.write('<form method="get" action="setup">');
  res.write('<ul>');
  res.write('<li class="section_break">');
  res.write('<h3>Wi-Fi Connection</h3>');
  res.write('</li>');
  res.write('<li>');
  res.write('<label for="ssid">Wi-Fi Network</label>');
  res.write('<div>');
  res.write('<select class="select medium" name="ssid">');
  res.write(getWifiNetworksOptions(wifiNetworks));
  res.write('</select>');
  res.write('<input name="ssid2" class="text medium" type="text" maxlength="255" value="' + wifiConfig.ssid + '"/>');
  res.write('</div>');
  res.write('</li>');
  res.write('<li>');
  res.write('<label for="password">Password</label>');
  res.write('<div>');
  res.write('<input name="password" class="text medium" type="text" maxlength="255" value="' + wifiConfig.password + '"/>');
  res.write('</div>');
  res.write('</li>');
  res.write('<li class="section_break">');
  res.write('<h3>Web Socket Connection</h3>');
  res.write('</li>');
  res.write('<li>');
  res.write('<label for="endpoint">WS Endpoint</label>');
  res.write('<div>');
  res.write('<input name="wsurl" class="text large" type="text" maxlength="255" value="' + wsConfig.url + '"/>');
  res.write('</div>');
  res.write('</li>');
  res.write('<li class="buttons">');
  res.write('<input class="button_text" type="submit" name="submit" value="Submit" />');
  res.write('</li>');
  res.write('</ul>');
  res.write('</form>');
  res.write('</div>');
  res.write('</body>');
  res.end('</html>');
}

function getWifiNetworksOptions (networks) {
  networks.unshift('');

  var networkOptions = networks.map(function (ssid) {
    return '<option value="' + ssid + '" ' + (ssid === '' ? 'selected=""' : '') + '>' + ssid + '</option>';
  });

  return networkOptions;
}

function connectToNetwork (reqParams, callback) {
  parseWifiParams(reqParams);
  parseWsParams(reqParams);

  connectToWifi(wifiConfig, function () {
    connectToWebSocketServer(wsConfig, function () {
      callback();
    });
  });
}

function parseWifiParams (reqParams) {
  if (reqParams.query) {
    wifiConfig.ssid = reqParams.query.ssid || reqParams.query.ssid2;
    wifiConfig.password = reqParams.query.password;
  }
  else {
    wifiConfig.ssid = '';
    wifiConfig.password = '';
  }
}

function connectToWifi (wifiParams, callback) {
  callback();
}

function parseWsParams (reqParams) {
  if (reqParams.query) {
    wsConfig.url = reqParams.query.wsurl;
  }
  else {
    wsConfig.url = '';
  }
}

function connectToWebSocketServer (wsParams, callback) {
  callback();
}

function getWifiNetworks (callback) {
  wifi.scan(function (networks) {

    var networkNames = networks.map(function (net) {
      return net.ssid;
    });

    wifi.disconnect(function () {
      callback(networkNames);
    });

  });
}

var webServer;

var serverConfig = {
  port: process.env.PORT || 8080
};

var wifiConfig = {
  ssid: '',
  password: ''
};

var wsConfig = {
  url: ''
};


function onInit () {
  startWebServer(serverConfig);
}
