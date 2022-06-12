const connections = require('../connections');
const models = require('../models');
const moment = require('moment');
const SystemActions = require('./SystemActions');
const singletons = require('../singletons');
const sequelize = require('sequelize');

//count all cti connection per campaign and set them in redis
exports.countCtiConnections = function() {
	//clean cti connection count
	this.cleanCtiConnectionCount();

	//loop over sockets and count for each campaign
	var counts = {};
	for (var key in connections.cti.sockets) {
		var socket = connections.cti.sockets[key];
		if (socket.sip_connected) {
			if (counts["camp_" + socket.campaign_id] == undefined) counts["camp_" + socket.campaign_id] = 1;
			else counts["camp_" + socket.campaign_id]++;
		}
	};

	//
	for (var key in counts) {
		campaignId = key.replace('camp_', '');
		connections.redis.hset('tm:cti_counts', campaignId, counts[key]);
	}
}

//delete cti counts keys from redis
exports.cleanCtiCount = function(cursor) {
	connections.redis.del('tm:cti_counts');
	connections.redis.del('tm:cti_break_counts');
	connections.redis.del('tm:cti_waiting_counts');
}

//increment count for cti connection per campaign
exports.incCtiConnection = function(campaignId) {
	connections.redis.hincrby('tm:cti_counts', campaignId ,1);
}

//decrement count for cti connection per campaign
exports.decCtiConnection = function(campaignId) {
	connections.redis.hincrby('tm:cti_counts', campaignId, -1);
}

/**
 * Increment count for campaign cti in break
 *
 * @param integer campaignId
 * @return void
 */
exports.incCtiBreakCount = function(campaignId) {
	connections.redis.hincrby('tm:cti_break_counts', campaignId ,1);
}

/**
 * Decrement count for campaign cti in break
 *
 * @param integer campaignId
 * @return void
 */
exports.decCtiBreakCount = function(campaignId) {
	connections.redis.hincrby('tm:cti_break_counts', campaignId, -1);
}

/**
 * Increment count for campaign cti in waiting
 *
 * @param integer campaignId
 * @return void
 */
exports.incCtiWaitingCount = function(campaignId) {
	connections.redis.hincrby('tm:cti_waiting_counts', campaignId ,1);
}

/**
 * Decrement count for campaign cti in waiting
 *
 * @param integer campaignId
 * @return void
 */
exports.decCtiWaitingCount = function(campaignId) {
	connections.redis.hincrby('tm:cti_waiting_counts', campaignId, -1);
}

//update sip number with user data to redis
exports.updateSip = function(socket) {

	let campaignString = (socket.campaign_id == null)? '' : socket.campaign_id;
	connections.redis.hmset('tm:sip_numbers:' + socket.sip_number, 
							['user_id', socket.user_id, 
							'campaign_id', campaignString,
							'status', socket.cti_status]);
	//log socket status
	/*let logObject = {};
	logObject.connectionStatus = socket.connectionStatus;
    logObject.laravel_session = socket.laravel_session;
    logObject.sip_number = socket.sip_number;
    logObject.campaign_id = socket.campaign_id;
    logObject.campaign_screen_id = socket.campaign_screen_id;
    logObject.simulation = socket.simulation;
    logObject.voter = socket.voter;
    logObject.call_id = socket.call_id;
    logObject.sip_connected = socket.sip_connected;
    logObject.sip_status = socket.sip_status;
    logObject.waiting_key = socket.waiting_key;
    logObject.break_key = socket.break_key;
    logObject.cti_status = socket.cti_status;
    console.log(logObject);*/
}

//remove sip number and user id from redis
exports.removeSip = function(sipNumber) {
	connections.redis.del('tm:sip_numbers:' + sipNumber);
}

//delete sip_numbers key from redis
exports.cleanSips = function() {
	connections.redis.eval("for i, name in ipairs(redis.call('KEYS', 'tm:sip_numbers:*')) do redis.call('DEL', name); end", 0);
}

/**
 * Update sip status: call, waiting or break
 *
 * @param integer sipNumber
 * @param string status
 * @return void
 */
exports.updateSipStatus = function(sipNumber, status) {
	connections.redis.hmset('tm:sip_numbers:' + sipNumber, ['status', status]);
}

/**
 * Delete active call from redis
 *
 * @param integer campaignId
 * @param integer callId
 * @return void
 */
exports.removeActiveCall = function(campaignId, callId) {
	let key = 'tm:campaigns:' + campaignId + ":active_calls:" + callId;
	connections.redis.del(key);
}

/**
 * Add voter to finished table
 *
 * @param integer voterId
 * @param integer campaignId
 * @param tinyint status
 * @return void
 */
exports.addVoterToFinished = function(voterId, campaignId, status) {
	let finishedVoter = models.FinishedVotersInCampaign.build();
	finishedVoter.voter_id = voterId;
	finishedVoter.campaign_id = campaignId;
	finishedVoter.status = status;
	finishedVoter.save();
}

/**
 * Transfer voter count from processing to processed in db table
 *
 * @param integer portionId
 * @param integer voterCount
 * @return void
 */
exports.transferVotersCountToProcessed = function(portionId, voterCount) {
	models.CampaignPortionProgress.findOne({
		where: {
			portion_id: portionId
		}
	}).then(progress => {
		if (progress == null) return;
		progress.increment({
			processing_count: -1 * voterCount,
			processed_count: voterCount,

		});
	});
}

/**
 * End break in DB if disconnected without closing break
 *
 * @param string breakKey
 * @return void
 */
exports.endBreak = function(breakKey) {

	models.CampaignBreakTimes.update(
	{
		end_date: moment().format('YYYY-MM-DD HH:mm:ss'),
		total_seconds: sequelize.fn('timestampdiff', sequelize.literal('second'), sequelize.col('created_at'),sequelize.fn('now'))
	}, {
		where: {
			key: breakKey
		}
	});
}

/**
 * Add campaign active time
 *
 * @param integer campaignId
 * @return void
 */
exports.addCampaignActiveTime = async function(campaignId) {
	if (!singletons.campaigns[campaignId]) {
		let key = await SystemActions.getNewTableKey(models.CampaignActiveTimes, 10);
		let campaignActiveTime = models.CampaignActiveTimes.create({
			key: key,
			campaign_id: campaignId
		}).then(function() {
			singletons.campaigns[campaignId] = key;
			console.log(singletons);
		});
	
	}
}

/**
 * check and end campaign active time
 *
 * @param integer campaignId
 * @return void
 */
exports.checkEndCampaignActiveTime = function(campaignId) {
	let foundSocket = false;
	for (var key in connections.cti.sockets) {
        var socket = connections.cti.sockets[key];
        if (socket.campaign_id == campaignId) {
        	foundSocket = true;
        	break;
        }
    }

    if (!foundSocket) {
    	let CampaignActiveTimeKey = singletons.campaigns[campaignId];
    	models.CampaignActiveTimes.update(
	    	{
	    		end_date: moment().format('YYYY-MM-DD HH:mm:ss')
	    	}, {
	    		where: {
		    		key: CampaignActiveTimeKey
		    	}
	    	}
    	).then(function() {
    		delete singletons.campaigns[campaignId];
    	});
    }
}

/**
 * End all campaign active times that are not ended
 *
 * @return void
 */
exports.endAllCampaignActiveTimes = function() {
	models.CampaignActiveTimes.update(
    	{
    		end_date: moment().format('YYYY-MM-DD HH:mm:ss')
    	}, {
    		where: {
	    		end_date: null
	    	}
    	}
	)
}

/**
 * End waiting in DB if disconnected without closing waiting
 *
 * @param string waitingKey
 * @return void
 */
exports.endWaiting = function(waitingKey) {

	models.CampaignWaitingTimes.update(
	{
		end_date: moment().format('YYYY-MM-DD HH:mm:ss'),
		total_seconds: sequelize.fn('timestampdiff', sequelize.literal('second'), sequelize.col('created_at'),sequelize.fn('now'))
	}, {
		where: {
			key: waitingKey
		}
	});
}

/**
 * Add campaign user active time
 *
 * @param integer campaignId
 * @return void
 */
exports.addCampaignUserActiveTime = async function(socket) {
	models.CampaignUserActiveTimes.create({
		user_id: socket.user_id,
		campaign_id: socket.campaign_id,
		created_at: sequelize.fn('now'),
		updated_at: sequelize.fn('now')
	}).then(function(campaignUserActiveTime) {
		socket.active_time_id = campaignUserActiveTime.id;
	}, (error) => {

	});
}

/**
 * Stop campaign user active time
 *
 * @param integer campaignId
 * @return void
 */
exports.stopCampaignUserActiveTime = async function(socket) {
	if (!socket.active_time_id) return;
	models.CampaignUserActiveTimes.update(
	{
		end_date: sequelize.fn('now'),
		total_seconds: sequelize.fn('timestampdiff', sequelize.literal('second'), sequelize.col('created_at'),sequelize.fn('now'))
	}, {
		where: {
			id: socket.active_time_id
		}
	}).then(function() {
		socket.active_time_id = null;
	}, (error) => {

	});
}