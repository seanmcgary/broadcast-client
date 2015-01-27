var _ = require('lodash');


var Request = require('./request');

function HTTP(config){
	var self = this;
	config = _.defaults(config || {}, {
		hostname: 'localhost',
		port: 80,
		secure: false
	});

	self.config = config;
	self.request = new Request(self.config);
};

HTTP.prototype.publish = function(room, data){
	var self = this;

	return self.request.post({
		url: '/publish/' + room,
		data: data
	});
};


module.exports = HTTP;