var Websocket = require('../').Websocket;

var client = new Websocket({
	server: 'http://localhost:9000'
});

client.joinChannel('foobar');

client.getChannel('foobar')
.on('msg', function(data){
	console.log('data: ', data);
});

setTimeout(function(){
	client.leaveChannel('test');
	client.leaveChannel('foobar');
}, 5000);