const jwt = require('jsonwebtoken');
const config = require('../config');
var connections = require('../connections');
const constants = require('../constants');
const CtiActions = require('../actions/CtiActions');
const SystemActions = require('../actions/SystemActions');

module.exports.authenticate = function(socket, data) {
	jwt.verify(data, config.jwt_secret, function(err, decoded) {
		let connectionStatus = null;
		if (err) {
			//not authenticated
			connectionStatus = constants.connectionStatus.notAuthenticated;
		} else {
			let foundExistingUser = false;
			for (var key in connections.cti.sockets) {
		        var existingSocket = connections.cti.sockets[key];
		        if (existingSocket.user_id == decoded.sub && existingSocket.connectionStatus == constants.connectionStatus.authenticated) {
		        	foundExistingUser = true;
		        	break;
		        }
		    }
		    if (foundExistingUser) {
		    	//found duplicate user
		    	connectionStatus = constants.connectionStatus.duplicateUser;
		    } else {
		    	//authentication OK
				connectionStatus = constants.connectionStatus.authenticated;
			}
			socket.user_id = decoded.sub;
			socket.laravel_session = decoded.laravel_session;
        }
        //send authentication event to client
        SystemActions.updateSocketConnectionStatus(socket, connectionStatus);
        CtiActions.updateConnectionStatus(socket, connectionStatus);
        if (connectionStatus == constants.connectionStatus.notAuthenticated) socket.disconnect();
	});
}