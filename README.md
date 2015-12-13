# esp-lights
ESP8266 node.js project for controlling led lights using websockets

## overview
Project consists of a Node.js server which keeps track of a set of lights' status.

The server provides a control page that displays the current lights status and provides ways to toggle the lights.

Websockets are used to broadcast in real-time the current lights status from the server, each time it changes.

The ESP8266 client project connects to the server using Websockets to keep track of the status and turn the leds on or off when status update messages are received.

Both the control page and the ESP8266 act as Websocket clients.

## Starting the server
To start the server, clone the repository and then do:
```
$> cd server
$> npm install
$> npm start
```

After the server starts, browse to the server address (defaults to ```http://localhost:4080/```) and you should get the control page.

You can also run the server test by doing:
```
$> cd server
$> npm test
```
