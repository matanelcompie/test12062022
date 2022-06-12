const controllers = require('../controllers/');
const connections = require('../connections');
const CtiActions = require('../actions/CtiActions');
const TelemarketingActions = require('../actions/TelemarketingActions');
const SystemActions = require('../actions/SystemActions');

module.exports = (redis) => {
    redis.on("message", function (channel, data) {
        var parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            parsedData = data;
        }

        if (channel == "system") {
            let socket = null;
            switch (parsedData.action) {
                case 'update_sip': // Connect user to sip with laravel session.
                    CtiActions.updateSocket(parsedData.laravel_session, parsedData.sip_number, parsedData.campaign_id);
                    break;
                case 'update_campaign': // Connect campaign to sip.
                    socket = CtiActions.updateCampaign(parsedData.laravel_session, parsedData.campaign_id);
                    if (socket && !socket.simulation) {
                        //update sip in redis
                        TelemarketingActions.updateSip(socket);
                        //increment cti in campaign
                        if (parsedData.campaign_id != null) {
                            TelemarketingActions.incCtiConnection(parsedData.campaign_id);
                            TelemarketingActions.addCampaignActiveTime(parsedData.campaign_id);
                        } else if (socket.campaign_screen_id) {
                            TelemarketingActions.checkEndCampaignActiveTime(socket.campaign_screen_id);
                        }
                    }
                    break;
                case 'campaign_data_changed': // Updating the client that the campaign has changed 
                    CtiActions.campaignDetailsChanged(parsedData.campaignId, parsedData.campaignChangedData);
                    break;
                case 'delete_campaign': // Disconnect campaign to sip.
                    socket = CtiActions.updateCampaign(parsedData.laravel_session, null);
                    if (socket && !socket.simulation) {
                        //update sip in redis
                        TelemarketingActions.updateSip(socket);
                        //increment cti in campaign
                        TelemarketingActions.decCtiConnection(parsedData.campaign_id);

                        if (socket.campaign_screen_id) {
                            TelemarketingActions.checkEndCampaignActiveTime(socket.campaign_screen_id);
                        }
                    }
                    break;
                case 'new_call': // Connect new call to sip. 
                    socket = SystemActions.findSocketBySipNumber(parsedData.sip_number);
                    if (socket) {
                        socket.cti_status = 'call';
                        CtiActions.updateNewCallVoter(socket, parsedData.call_key, parsedData.call_id, parsedData.voter_data);
                        TelemarketingActions.updateSip(socket);                        
                    }
                    break;
            }
        }
    });
}