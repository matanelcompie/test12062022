const Sequelize = require('sequelize');

var connections = require('../connections');
const constants = require('../constants');
const CtiActions = require('../actions/CtiActions');
const SystemActions = require('../actions/SystemActions');
const TelemarketingActions = require('../actions/TelemarketingActions');
const config = require('../config');
var models = require('../models');
var randomstring = require("randomstring");

/**
 * Update socket connection status
 *
 * @param object socket
 * @param integer connectionStatus
 * @return void
 */
exports.updateSocketConnectionStatus = function(socket, connectionStatus) {
	socket.connectionStatus = connectionStatus;
}

/**
 * Check and update duplicate user sockets
 *
 * @param integer userId
 * @return void
 */
exports.checkDuplicateUser = function(userId) {
	let authenticatedUserSocket = null;
	let duplicateUserSockets = [];
	for (var key in connections.cti.sockets) {
        var existingSocket = connections.cti.sockets[key];
        if (existingSocket.user_id == userId) {
        	if (existingSocket.connectionStatus == constants.connectionStatus.authenticated) authenticatedUserSocket = existingSocket;
        	else if (existingSocket.connectionStatus == constants.connectionStatus.duplicateUser) duplicateUserSockets.push(existingSocket);
        }
    }

    if (authenticatedUserSocket == null && duplicateUserSockets.length > 0) {
    	SystemActions.updateSocketConnectionStatus(duplicateUserSockets[0], constants.connectionStatus.authenticated);
        CtiActions.updateConnectionStatus(duplicateUserSockets[0], constants.connectionStatus.authenticated);
    }
}

/**
 * Initialize database connection
 *
 * @return void
 */
exports.initDatabaseConnection = function() {
    const timezone = 'Asia/Jerusalem';
    const sequelize = new Sequelize(
            config.db_name, 
            config.db_user, 
            config.db_password, 
            {
              host: config.db_host,
              dialect: 'mysql',
              timezone: timezone
            }
    );

    sequelize.authenticate()
          .then(function() {
            connections.database = sequelize;
            console.log("database initialize");
            defineModels(sequelize);
            //end capmaign active times if not ended yet (probably because this server got restarted)
            TelemarketingActions.endAllCampaignActiveTimes();
          });
}

/**
 * Load model files to models object
 *
 * @param object sequelize
 * @return void
 */
var defineModels = function(sequelize) {
    require("fs").readdirSync('models').forEach(function(file) {
            let modelName = file.slice(0, -3);
            modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
            if (file != 'index.js') models[modelName] = require('../models/' + file)(sequelize);
    });
}

/**
 * Initialize socket properties
 *
 * @param object socket
 * @return void
 */
exports.initSocketProperties = function(socket) {
    socket.connectionStatus = '';
    socket.laravel_session = '';
    socket.sip_number = '';
    socket.campaign_id = '';
    socket.campaign_screen_id = '';
    socket.simulation = false;
    socket.voter = '';
    socket.call_id = '';
    socket.sip_connected = false;
    socket.sip_status = '';
    socket.waiting_key = '';
    socket.break_key = '';
    socket.cti_status = '';
}

/**
 * Get new table key
 *
 * @param object model
 * @param integer length
 * @param integer dataType
 * @return void
 */
var getNewTableKey = async function(model, length = 10, dataType) {
    var key = '';
    try {
        let found = false;
        do {
            key = randomstring.generate(length);
            let row = await model.findOne({
                where: {key: key},
                attributes: ['id']
            });
            found = (row != null);
        } while(found);
    } catch (error) {

    }
    return key;
    
}

exports.findSocketBySipNumber = function(sipNumber) {
    for (var key in connections.cti.sockets) {
        var socket = connections.cti.sockets[key];
        if (socket.sip_number == sipNumber) return socket;
    }
    return null;
}

exports.getNewTableKey = getNewTableKey;