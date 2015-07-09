var http = require("http")
var ws = require("./node_modules/nodejs-websocket")
var fs = require("fs")
var express = require( 'express' ) ;
var app = express() ;

app.use(express.static('../'));
app.listen( 3000 ) ;

http.createServer(function (req, res) {
	fs.createReadStream("index.html").pipe(res)
}).listen(8080)

var server = ws.createServer(function (connection) {
	connection.nickname = null
	connection.on("text", function (str) {
		broadcast(str) ;
	})
	connection.on("close", function () {
	})
})
server.listen(8081)

function broadcast(str) {
	server.connections.forEach(function (connection) {
		connection.sendText(str)
	})
}

