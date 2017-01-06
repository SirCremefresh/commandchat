var WebSocketClient = require('websocket').client;
var stdin = process.openStdin();

var client = new WebSocketClient();
var connection;

var initialized = 0;

var username;
var serverAdresse;
var serverPort;

const colors = {
 Reset: "\x1b[0m",
 Bright: "\x1b[1m",
 Dim: "\x1b[2m",
 Underscore: "\x1b[4m",
 Blink: "\x1b[5m",
 Reverse: "\x1b[7m",
 Hidden: "\x1b[8m",
 fg: {
  Black: "\x1b[30m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",
  Crimson: "\x1b[38m" //القرمزي
 },
 bg: {
  Black: "\x1b[40m",
  Red: "\x1b[41m",
  Green: "\x1b[42m",
  Yellow: "\x1b[43m",
  Blue: "\x1b[44m",
  Magenta: "\x1b[45m",
  Cyan: "\x1b[46m",
  White: "\x1b[47m",
  Crimson: "\x1b[48m"
 }
};


console.log("Username:");
stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    if (initialized !== true) {
      if (initialized === 0) {
        username = d.toString().trim();
        initialized = true;
        start();
      }
    } else {
      send({
        type: "MESSAGE",
        content: {
          text: d.toString().trim(),
        },
      });
    }

  });













function start() {
  client.connect('ws://192.168.56.1:4367/', 'echo-protocol');
}

function initialize() {
  send({
    type:"INITIALIZE",
    content:{
      username: username
    },
  });


}

function send(obj) {
    if (connection.connected) {
        connection.sendUTF(JSON.stringify(obj));
    } else {
      console.log('not connected');
    }
}

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(conn) {
  connection = conn;
    console.log('WebSocket Client Connected');
    initialize();
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        var data = JSON.parse(message.utf8Data);

        switch (data.type) {
          case "MESSAGE":
            console.log(colors.fg[data.content.color], colors.bg.White, data.content.username + " > " + colors.Reset + "  " + data.content.text);
            break;
          default:

        }


      }
    });


});
