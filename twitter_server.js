var express = require('express'),
    app = express.createServer(),
    TwitterStreamer = require('./TwitterStreamer.js').TwitterStreamer,
    io = require('socket.io').listen(app);
var port = 8559;
var params, streamer;
var count = 0;
io.set('log level', 1);
var _sockets = [],
	_wireUpSocket = function(socket) {
		_sockets.push(socket);	    
		console.log("Socket ID " + socket.id + " connecting...");
		console.log("Socket count now: " + _sockets.length);
		socket.on('news', function(data) {
			var clientKeyword = data.message;
			console.log("client connecting: " + clientKeyword);
			params = { track: clientKeyword};
			streamer = new TwitterStreamer(params, 4000);
			streamer.start();
			streamer.on("newTweet", _updateClients );
			socket.emit("init", { tweets: streamer.tweets });
			socket.on('end', function (socket) {
				_sockets.splice(_sockets.indexOf(socket,1));
			});
			socket.on('destroy', function (socket) {
				streamer.finish();
			});
		});			
	},
	_updateClients = function(payload) {
		_sockets.forEach(function(socket) {
			socket.emit("newTweet", payload);
		});
	};		
	io.sockets.on('connection', _wireUpSocket );
	count += 1;		
	if (count >= 2) {
		streamer.on("newTweet", _updateClients );
	}

app.use("/", express.static(__dirname + '/client'));

// Server would listen on port 8559
app.listen(port);
console.log('Twitter Streaming Server running at port:' + port + '/');