var twitter = require('ntwitter'),
    EventEmitter = require('events').EventEmitter,
    sys = require('sys');

var credentials = require('./credentials.js');

var TwitterStreamer = function(trackOptions, threshold) {
	EventEmitter.call(this); // assume behaviors of event emitter

	var _twit = new twitter({
                consumer_key: credentials.consumer_key,
		consumer_secret: credentials.consumer_secret,
		access_token_key: credentials.access_token_key,
		access_token_secret: credentials.access_token_secret
            });

        this.tweets = [];

        this.threshold = threshold || 4000;

        this.start = function() {
	    _twit.stream('user', trackOptions, function(stream) {
                stream.on('data', function (data) {
                    if(data && data.user) {
                        if(this.tweets.filter(function(x) { return x.id === data.id_str; }).length === 0) {
                            var tweetData = {
                                                id: data.id_str,
                                                text: data.text,
                                                image: data.user.profile_image_url,
                                                user: data.user.screen_name,
                                                name: data.user.name,
                                                time: data.created_at
                                            };
                            console.log("Received Tweet From: " + tweetData.name);
			    console.log("Received text from user: " + tweetData.text);
                            this.tweets.unshift(tweetData);
                            if(this.tweets.length > this.threshold) {
                                this.tweets.splice(this.threshold, this.tweets.length - this.threshold);
                            }
                            this.emit("newTweet", tweetData);
			    console.log("newTweet -- " + tweetData.text);
                        }
                    }
                }.bind(this));
		
		_twit.currentTwitStream = stream;
		
		stream.on('end', function(response) {
			console.log('ending stream for %s', stream.track);
		}.bind(this));
		
		//setTimeout(function(){
		//	stream.destroy();
		//}, 10000);

		stream.on('destroy', function(response) {
			console.log('destroying stream for %s', stream.track);
		}.bind(this));
            }.bind(this));
        };
	
	this.finish = function(data)
	{
		console.log("Destroying this stream begin -- " + data);
		_twit.currentTwitStream.destroy();
		console.log("Destroyed this stream .... he ha ha ha");
	}
};

// Sets TwitterStreamer.super_ and .prototype to instance of EventEmitter.prototype
sys.inherits(TwitterStreamer, EventEmitter);
exports.TwitterStreamer = TwitterStreamer;