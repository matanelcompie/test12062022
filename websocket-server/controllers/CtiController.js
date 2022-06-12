var connections = require('../connections');
const TelemarketingActions = require('../actions/TelemarketingActions');

module.exports.changeSocketSipStatus = function(socket, status) {
	socket.sip_status = status;
	if (socket.sip_status == 'connected') {
		if(socket.campaign_id) TelemarketingActions.incCtiConnection(socket.campaign_id);
		TelemarketingActions.updateSip(socket);
	}
	if (socket.sip_status == 'disconnected') {
		if(socket.campaign_id) TelemarketingActions.decCtiConnection(socket.campaign_id);
		TelemarketingActions.removeSip(socket.sip_number);
	}
};