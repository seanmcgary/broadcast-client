var HTTP = require('../').HTTP;

var client = new HTTP({
	port: 9000
});

setInterval(function(){
	client.publish('foobar', { foo: 'bar' });
}, 2000);
