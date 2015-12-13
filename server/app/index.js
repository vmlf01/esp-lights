var server = require('./server');

server.start();

console.log('Listening on http://localhost:' + server.getPort());
