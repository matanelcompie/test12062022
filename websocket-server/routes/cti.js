const controllers = require('../controllers/');
const TelemarketingActions = require('../actions/TelemarketingActions');
const SystemActions = require('../actions/SystemActions');
const models = require('../models');

module.exports = (socket) => {
	console.log("Connected succesfully to the socket ...");

	socket.on('event', function (data) {
		switch (data.event) {
			case 'system:authenticate':
				socket.simulation = false;
				controllers.AuthController.authenticate(socket, data.data.token);
				break;

			case 'cti:sip_status':
				controllers.CtiController.changeSocketSipStatus(socket, data.data.status);
				break;

			case 'cti:sip_number':
				socket.sip_number = data.data.sipNumber;
				TelemarketingActions.updateSip(socket);
				break;

			case 'cti:update_campaign':
				socket.campaign_id = data.data.campaignId;
				if (!socket.campaign_id) socket.cti_status = '';
				TelemarketingActions.updateSip(socket);
				break;

			case 'cti:set_simulation_mode': //Socekt set simulation mode, and set campagin id (to update when campaign change).
				socket.simulation = data.simulationMode;
				socket.campaign_id = data.campaignId;
				break;

			case 'cti:end_call':
				if (socket.call_id) socket.call_id = null;
				console.log("end call from cti");
				break;

			//add or remove cti break key
			case 'cti:break':
				socket.break_key = data.data.key;
				if (socket.campaign_id) {
					if (socket.break_key) {
						TelemarketingActions.incCtiBreakCount(socket.campaign_id);
						socket.cti_status = 'break';
						TelemarketingActions.updateSip(socket);
					} else {
						TelemarketingActions.decCtiBreakCount(socket.campaign_id);
					}
				}
				break;

			//add or remove cti waiting key
			case 'cti:waiting':
				socket.waiting_key = data.data.key;
				if (socket.campaign_id) {
					if (socket.waiting_key) {
						TelemarketingActions.incCtiWaitingCount(socket.campaign_id);
						socket.cti_status = 'waiting';
						TelemarketingActions.updateSip(socket);
					} else {
						TelemarketingActions.decCtiWaitingCount(socket.campaign_id);
					}
				}
				break;

			//add or remove campaign screen id
			case 'cti:campaign_screen':
				socket.campaign_screen_id = data.data.campaignScreenId;
				break;

			case 'cti:activate_user':
				//start user active time
				TelemarketingActions.addCampaignUserActiveTime(socket);
				break;

			case 'cti:deactivate_user':
				//end user active time
				TelemarketingActions.stopCampaignUserActiveTime(socket);
				break;
		}
	});

	//disconnect event
	socket.on('disconnect', function () {
		//remove socket from cti count and update sip numbers if was connected
		if (socket.sip_status == 'connected') {
			if (!socket.simulation && socket.campaign_id) {
				TelemarketingActions.decCtiConnection(socket.campaign_id);
				TelemarketingActions.checkEndCampaignActiveTime(socket.campaign_id);
			}
			
		}
		//delete sip from redis
		if (socket.sip_number) TelemarketingActions.removeSip(socket.sip_number);
		//removing active call if disconnected in the middle of a call
		if (socket.call_id && socket.campaign_id) {
			TelemarketingActions.removeActiveCall(socket.campaign_id, socket.call_id);
			models.Call.findOne({ where: {id: socket.call_id} }).then(call => {
  				if (call.call_end_status == null) {
  					models.Call.update(
						{
							call_end_status: 0,
							call_end_date: Date.now(),
							call_action_end_date: Date.now()
						},
						{
							where: {id: socket.call_id}
						}
					).then(function() {
						//add to finished voters and update processed count
						TelemarketingActions.addVoterToFinished(socket.voter.id, socket.campaign_id, 0);
						TelemarketingActions.transferVotersCountToProcessed(socket.voter.portion_id, 1);
					});
  				}
			});

		}

		//checking if cti was in break
		if (socket.break_key) {
			TelemarketingActions.endBreak(socket.break_key);
			TelemarketingActions.decCtiBreakCount(socket.campaign_screen_id);
		}

		//checking if cti was in waiting
		if (socket.waiting_key) {
			TelemarketingActions.endWaiting(socket.waiting_key);
			TelemarketingActions.decCtiWaitingCount(socket.campaign_screen_id);
		}

		//checking if user in active time and stop it if so
		if (socket.active_time_id) {
			TelemarketingActions.stopCampaignUserActiveTime(socket);
		}

		//checking duplicate users
		SystemActions.checkDuplicateUser(socket.user_id);
		socket.simulation = false;
	})
}