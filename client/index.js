var ws = require('ws');
var wsClient = new ws('ws://localhost:4080/');

wsClient.on('open', function () {
  console.log('open');
  wsClient.send('hello');
});

wsClient.on('message', function (data, flags) {
  console.log('data', data, 'flags', flags);
});

