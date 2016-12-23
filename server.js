
// VARIABLES FOR LATER USE
var port = 4367;
var connections = [];
var connectionCount = 0;
var colors = [
    "Red",
    "Green",
    "Yellow",
    "Blue",
    "Magenta",
    "Cyan",
    "Crimson",
  ]


  function randomIntFromInterval(min,max)
  {
      return Math.floor(Math.random()*(max-min+1)+min);
  }



/*
 *    OPEN WEBSOCKET CONNECTION
 */
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' | WEBSOCKET | Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(port, function() {
    console.log((new Date()) + ' | WEBSOCKET | Server is listening on port ' + port);
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}


/*
 *    START WEBSOCKET APPLICATION
 */
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' | WEBSOCKET | Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    /*
     *    ON SUCCESSFULL CONNECTION
     */
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' | WEBSOCKET | Connection accepted from: ' + connection.remoteAddress);

    connectionCount++;
    var userIndex = connectionCount;
    var username;
    var color = colors[randomIntFromInterval(0, 6)];
    connections[userIndex] = connection;




    /*
     *    ON RECIVE MESSAGE
     */
    connection.on('message', function(message) {

      var data = JSON.parse(message.utf8Data);

        if (message.type === 'utf8') {

          switch (data.type) {
            case "INITIALIZE":
              console.log(data);
              username = data.content.username;
              break;
            case "MESSAGE":
              console.log(data);
              for (var i = 0; i < connections.length; i++) {
                if (typeof connections[i] !== "undefined" && connections[i] !== false && connections[i] !== connection) {
                  connections[i].sendUTF(
                    JSON.stringify({
                      type: "MESSAGE",
                      content: {
                        text: data.content.text,
                        username: username,
                        color: color,
                      },
                    })
                  );
                }

              }
              break;
            default:
              console.log(data);
              break;
          }

        }
    });


    /*
     *    ON CLOSE CONNECTION
     */
    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' | WEBSOCKET | Client ' + connection.remoteAddress + ' disconnected.');
      connections[userIndex] = false;
    });

});
