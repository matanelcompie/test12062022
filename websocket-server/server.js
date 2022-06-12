const config = require('./config');
const routes = require('./routes');
var connections = require('./connections');
const TelemarketingActions = require('./actions/TelemarketingActions');
const CtiActions = require('./actions/CtiActions');
const SystemActions = require('./actions/SystemActions');
const constants = require('./constants');
var singletons = require('./singletons');

var https = require('https');
var fs = require('fs');
var express = require('express');
var app = express();
var redis = require('redis');

//load ssl keys
var options = {
    key: fs.readFileSync( config.ssl_key ),
    cert: fs.readFileSync( config.ssl_cert ),
    ca: (config.ca_cert)? fs.readFileSync( config.ca_cert ) : '',
    requestCert: false,
    rejectUnauthorized: false
};

var server = https.createServer(options, app);
var io = require('socket.io').listen(server);
var ctiIo = io.of('/cti');
var telemarketingIo = io.of('/telemarketing');

//add connections to connection object
connections.cti = ctiIo;
connections.telemarketing = telemarketingIo;
connections.io = io;

//initialize database connection
SystemActions.initDatabaseConnection();

//set redis connection options
var redisConectionOptions = {
	host: config.redis_host,
	port: config.redis_port,
    db: config.redis_db
}
if ((config.redis_password != null)&&(config.redis_password != 'null')) {
	redisConectionOptions.password = config.redis_password;
}

//connect to redis server
var redisSub = redis.createClient(redisConectionOptions);
var redisClient = redis.createClient(redisConectionOptions);

//add redis to connection object
connections.redis = redisClient;

redisSub.on('connect', function() {
    redisSub.subscribe('system');
    redisSub.subscribe('newCall');
});

routes.redis(redisSub);

ctiIo.on('connection', function (socket) {
    SystemActions.initSocketProperties(socket);
    SystemActions.updateSocketConnectionStatus(socket, constants.connectionStatus.connected);
    CtiActions.updateConnectionStatus(socket, constants.connectionStatus.connected);
    routes.cti(socket);
});

//clean cti counts and sip from redis
TelemarketingActions.cleanCtiCount();
TelemarketingActions.cleanSips();

//init singletons
singletons.campaigns = {};

server.listen(config.server_port);