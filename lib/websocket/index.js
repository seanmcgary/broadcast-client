var _ = require('lodash');
var q = require('q');
var EventEmitter = require('events').EventEmitter;
var io = require('socket.io-client');
var logwrangler = require('logwrangler');


function Channel(name, socket){
	this.name = name;
	this.socket = socket;
};

Channel.prototype = Object.create(EventEmitter.prototype);

function Websocket(config){
	var self = this;
	var logger = self.logger = logwrangler.create({}, true);

	config = self.config = _.defaults(config, {
		server: 'http://localhost'
	});

	self.channels = {};

	var socket = self.socket = io(config.server);

	socket.on('connect', function(){
		logger.success({
			message: 'connected to websocket server',
			data: {
				server: config.server
			}
		});
	});

	socket.on('msg', function(data){
		var channel = self.channels[data.channel];
		if(!channel){
			logger.warn({
				message: 'received a message for an unconnected channel'
			});
			return;
		}

		channel.emit('msg', data.data || {});
	});

};

Websocket.prototype.joinChannel = function(channelName){
	var self = this;

	if(!self.channels[channelName]){
		self.socket && self.socket.emit('join', { channel: channelName });
		var channel = new Channel(channelName);
		self.channels[channelName] = channel;
	}
};

Websocket.prototype.leaveChannel = function(channelName){
	var self = this;

	var channel = self.channels[channelName];
	if(!channel){
		self.logger.warn({
			message: 'you are not in that channel',
			data: { channelName: channelName }
		});
		return;
	}

	self.socket.emit('leave', { channel: channelName });
	channel.removeAllListeners();
	delete self.channels[channelName];
	self.logger.info({
		message: 'left channel',
		data: { channelName: channelName }
	});
};

Websocket.prototype.getChannel = function(channelName){
	var self = this;
	var channel = self.channels[channelName];
	if(!channel){
		return null;
	}

	return channel;
};

module.exports = Websocket;