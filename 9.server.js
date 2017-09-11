function handleHTTP(req,res) {
	if (req.method == "GET") {
        //if starts with slash and has one or more numeric digits, 
		if (/^\/\d+(?=$|[\/?#])/.test(req.url)) {
			req.addListener("end",function(){
				req.url = req.url.replace(/^\/(\d+).*$/,"/$1.html");
				static_files.serve(req,res);
			});
			req.resume();
		}
		else {
			res.writeHead(403);
			res.end();
		}
	}
	else {
		res.writeHead(403);
		res.end();
	}
}

function handleIO(socket) {
    function disconnect() {
        console.log("client disconnected");
    }
    console.log("client connected");
    socket.on("disconnect", disconnect);

    // var intv = setInterval(function() {
    //     socket.emit("hello", Math.random());
    // }, 1000);

    socket.on("send-message", function(msg) {
        console.log("message received");
        console.log(msg);
        socket.broadcast.emit("echo", msg);
    });
}

var host = "localhost";
var port = 8006;
var http = require("http");
var http_serv = http.createServer(handleHTTP).listen(port, host);
var ASQ = require("asynquence");
var node_static = require("node-static");

//__dirname is whatever the current directory is -- special value in node. "dunder dirname"
var static_files = new node_static.Server(__dirname);

var io = require("socket.io").listen(http_serv);
// configure socket.io
io.configure(function(){
	io.enable("browser client minification"); // send minified client
	io.enable("browser client etag"); // apply etag caching logic based on version number
	io.set("log level", 1); // reduce logging
	io.set("transports", [
		"websocket",
		"xhr-polling",
		"jsonp-polling"
	]);
});
io.on("connection", handleIO);

require("asynquence-contrib");