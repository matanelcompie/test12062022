const connections = require('../connections');
const constants = require('../constants');

/**
* Update socket with sip number and campaign ID when user selects campaign to work on
* also set the connection to false, the user will update the connection when it is connected
*
**/
exports.updateSocket = function (laravelSession, sipNumber, campaignId) {
	console.log('in updateSocket sipNumber: ' + sipNumber);

	for (var key in connections.cti.sockets) {
		var socket = connections.cti.sockets[key];
		if (socket.laravel_session == laravelSession && socket.connectionStatus == constants.connectionStatus.authenticated) {
			socket.sip_number = sipNumber;
			socket.campaign_id = campaignId;
			if (socket.sip_number == undefined) socket.sip_status = null;
			return;
		}
	}

	return false;
};

/**
 * This function updates the campaign. *
 *
 * @param laravelSession
 * @param campaignId
 */
exports.updateCampaign = function (laravelSession, campaignId) {
	console.log('in updateCampaign campaignId: ' + campaignId);
	
	for (var key in connections.cti.sockets) {
		var socket = connections.cti.sockets[key];

		if (socket.laravel_session == laravelSession && socket.connectionStatus == constants.connectionStatus.authenticated) {
			socket.campaign_id = campaignId;
			return socket;
		}
	}

	return false;	
};

/**
 * This function updates the socket
 * with the call key and the voter data.
 *
 * @param sipNumber
 * @param callKey
 * @param voterData
 */
exports.updateNewCallVoter = function (socket, callKey, callId, voterData) {
	socket.voter = voterData;
	socket.call_id = callId;
	socket.emit('event', { 'event': 'cti:new_voter', data: { call_key: callKey, voter: voterData } });
	return;
};

/**

 * @param campaignDetailsChanged
 */
exports.campaignDetailsChanged = function (campaignId, campaignChangedData) {
	// console.log(campaignId, campaignChangedData);
	for (var key in connections.cti.sockets) {
		var socket = connections.cti.sockets[key];
		if (campaignId == socket.campaign_id) {
			socket.emit('event', { 'event': 'cti:campaign_data_changed', campaignChangedData: campaignChangedData });
		}
	}
};


/**
 * Emit the socket connection status to the cti
 *
 * @param object socket
 * @param integer connectionStatus
 * @return void
 */
exports.updateConnectionStatus = function(socket, connectionStatus) {
	socket.emit('event', {'event': 'system.connection.status', data: {status: connectionStatus}});
}
