var _ = require('lodash');
var q = require('q');
var _http = require('http');
var _https = require('https');
var qs = require('querystring');
var logwrangler = require('logwrangler');

function Request(config){
	this.config = config || {};
	this.logger = logwrangler.create({}, true);
};

Request.prototype.makeRequest = function(method, url, data){
	var self = this;
	var config = self.config;
	data = data || {};
	url = url || '/';

	var requestOptions = _.defaults(_.pick(self.config, ['hostname', 'port']), {
		hostname: 'localhost',
		port: 80,
		headers: {
			'Content-Type': 'application/json'
		}
	});

	var http = config.secure ? _https : _http;

	var queryString = '';
	if(method == 'GET'){
		queryString = qs.stringify(data);
		if(queryString.length){
			url = [url, queryString].join('?');
		}
	}

	requestOptions.path = url;
	requestOptions.method = method;

	var deferred = q.defer();
	var start = new Date();
	var req = http.request(requestOptions, function(res){

		var data = '';
		res.on('data', function(d){
			data += d.toString();
		});

		res.on('end', function(){
			var end = Date.now() - start.getTime();

			var statusCode = res.statusCode;

			var json = {};
			try {
				json = JSON.parse(data);
			} catch(e){
				self.logger.warn({
					message: 'invalid json payload'
				});
			}

			var logData = {
				message: url,
				data: {
					statusCode: statusCode,
					url: url,
					method: method,
					responseTime: [end, 'ms'].join()
				}
			};


			if(_.indexOf([2, 3], ~~(statusCode / 100)) >= 0){
				self.logger.info(logData);
				return deferred.resolve(json);
			}
			self.logger.error(logData);
			deferred.reject(json);
		});
	});

	req.on('error', function(err){
		self.logger.error({
			data: err
		});
		deferred.reject();

	});

	if(method != 'GET'){
		req.write(JSON.stringify(data));
	}
	req.end();

	return deferred.promise;
};

_.each(['get', 'post', 'put', 'delete'], function(method){
	Request.prototype[method] = function(data){
		var self = this;
		data = data || {};

		return self.makeRequest(method.toUpperCase(), data.url, data.data);
	};
});

module.exports = Request;