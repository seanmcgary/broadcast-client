var HTTP = require('../').HTTP;

var client = new HTTP({
	port: 9000
});

client.publish('foobar', { foo: 'bar' });