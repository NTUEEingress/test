var http = require("http")
var ws = require("./node_modules/nodejs-websocket")
var fs = require("fs")
var express = require( 'express' ) ;
var app = express() ;
var cors = require('cors');

app.use(express.static('../'));
app.use(cors());
app.listen( 3000 ) ;

//http.createServer(function (req, res) {
//	res.setHeader('Access-Control-Allow-Origin', '*');
//	res.setHeader('Access-Control-Request-Method', '*');
//	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
//	res.setHeader('Access-Control-Allow-Headers', '*');
//	fs.createReadStream("index.html").pipe(res);
//}).listen(8080)

app.get('/', function(req, res) {
	res.sendFile('index.html', {root: __dirname});
});

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

