/**
 * Server module.
 *
 *
 */
 
'use strict';
 
var nodestatic = require('node-static');
var express = require('express');
var path = require('path');

var fs = require('fs')
var https = require('https')

// read ssl certificate
var privateKey = fs.readFileSync("D:/C DRIVE/apache-tomcat-8.5.34SSL/webapps/peerconnection/munge-sdp/key.pem", 'utf8');
var certificate = fs.readFileSync("D:/C DRIVE/apache-tomcat-8.5.34SSL/webapps/peerconnection/munge-sdp/cert.pem", 'utf8');
var credentials = { key: privateKey, cert: certificate };

var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8445//1337
// var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '192.168.10.29'//'localhost'
// var socketIoServer = '192.168.10.29';// '127.0.0.1';
var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '192.168.10.29'//'localhost'
var socketIoServer = '119.40.93.30';// '127.0.0.1';


////////////////////////////////////////////////
// SETUP SERVER
////////////////////////////////////////////////
    
var app = express();
require('./router')(app, socketIoServer);

// Static content (css, js, .png, etc) is placed in /public
app.use(express.static(__dirname + '/public'));

// Location of our views
app.set('views',__dirname + '/views');

// Use ejs as our rendering engine
app.set('view engine', 'ejs');

// Tell Server that we are actually rendering HTML files through EJS.
app.engine('html', require('ejs').renderFile);

var server=https.createServer({
  key: fs.readFileSync("D:/C DRIVE/apache-tomcat-8.5.34SSL/webapps/peerconnection/munge-sdp/key.pem", 'utf8'),
  cert: fs.readFileSync("D:/C DRIVE/apache-tomcat-8.5.34SSL/webapps/peerconnection/munge-sdp/cert.pem", 'utf8')
}, app)
.listen(serverPort, serverIpAddress, function(){
    console.log("Express is running on port "+serverPort);
});

// var io = require('socket.io').listen(server,credentials);
var io = require('socket.io').listen(server );

////////////////////////////////////////////////
// EVENT HANDLERS
////////////////////////////////////////////////

io.sockets.on('connection', function (socket){
    
	function log(){
        var array = [">>> Message from server: "];
        for (var i = 0; i < arguments.length; i++) {
	  	    array.push(arguments[i]);
        }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message: ', message);
		log('socket.room: ', socket.room);
        socket.broadcast.to(socket.room).emit('message', message);
	});
    
	socket.on('create or join', function (message) {
		log('Got message create or join: ', message);
        var room = message.room;
        socket.room = room;
        var participantID = message.from;
        configNameSpaceChannel(participantID);
        
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0){
			socket.join(room);
			socket.emit('created', room);
		} else {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		}
	});
    
    // Setup a communication channel (namespace) to communicate with a given participant (participantID)
    function configNameSpaceChannel(participantID) {
        var socketNamespace = io.of('/'+participantID);
        
        socketNamespace.on('connection', function (socket){
            socket.on('message', function (message) {
                // Send message to everyone BUT sender
                socket.broadcast.emit('message', message);
            });
        });
    }

});
