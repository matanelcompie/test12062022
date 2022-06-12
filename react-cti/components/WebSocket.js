import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import io from 'socket.io-client';

import * as systemActions from 'actions/systemActions';
import * as callActions from 'actions/callActions';
import * as types from 'actions/actionTypes';

import constants from 'libs/constants';

class WebSocket extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.state = {
            inCall: false
        };
    }

    initConstants() {
        this.webDialerStatus = constants.webDialerStatus;
    }

    setNewCallFromSocket(callKey, voterData) {
        callActions.setActiveCallKey(this.props.dispatch, callKey);

        voterData.household = [];
        callActions.getActiveCallVoterFromSocket(this.props.dispatch, voterData);
    }

    componentWillMount() {
        var socket = io(window.Laravel.websocketHost + "/cti");
        var that = this;

        socket.on('connect', function () {
            socket.emit('event', { 'event': 'system:authenticate', data: { token: window.Laravel.websocketToken } });
        });

        socket.on('disconnect', function () {
            systemActions.updateWebSocketConnectionStatus(that.props.dispatch, constants.webSocketConnectionStatus.disconnected);
        });

        socket.on('event', function (socketData) {
            console.log(socketData.event);
            switch (socketData.event) {
                case 'cti:new_voter':
                    that.setNewCallFromSocket(socketData.data.call_key, socketData.data.voter);
                    break;
                case 'system.connection.status':
                    let connectionStatus = socketData.data.status;
                    systemActions.updateWebSocketConnectionStatus(that.props.dispatch, connectionStatus);
                    break;
                case 'cti:campaign_data_changed':
                    that.props.dispatch({ type: types.CAMPAIGN_DATA_CHANGED, campaignChangedData: socketData.campaignChangedData });
                    break;
            }
        });

        this.socket = socket;
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps);
        if (nextProps.simulationMode !== this.props.simulationMode) { // if simulation mode change
            this.socket.emit('event', { event: 'cti:set_simulation_mode', campaignId: nextProps.campaignId, simulationMode: nextProps.simulationMode });
        }

        if (nextProps.activeCampaignId != this.props.activeCampaignId) {
            if (!nextProps.simulationMode && !this.props.simulationMode) {
                let campaignId = (nextProps.activeCampaignId)? nextProps.activeCampaignId : '';
                this.socket.emit('event', { event: 'cti:update_campaign', data: { campaignId: nextProps.activeCampaignId } })
            }
        }

        // The WebRtc changes form disconnected to connected
        if ((nextProps.webSocket.connectionStatus) && (this.props.webDialer.status != nextProps.webDialer.status)) {
            this.socket.emit('event', { event: 'cti:sip_status', data: { status: nextProps.webDialer.status } });
        }

        //update sip number in websocker server
        if (nextProps.webDialer.sipnumber != this.props.webDialer.sipnumber) {
            this.socket.emit('event', { event: 'cti:sip_number', data: { sipNumber: nextProps.webDialer.sipnumber } })
        }

        if (this.props.callKey != nextProps.callKey && nextProps.callKey) {
            this.setState({ inCall: true });
            callActions.updateCallStatus(this.props.dispatch, 'in_call');
        }

        if (!this.props.showBetweenCallsModal && nextProps.showBetweenCallsModal && this.state.inCall) {
            this.sendEndCall();
        }

        if (!this.props.showInBreakModal && nextProps.showInBreakModal && this.state.inCall) {
            this.sendEndCall();
        }

        //update break key in websocket
        if (this.props.breakKey != nextProps.breakKey) {
            this.socket.emit('event', { event: 'cti:break', data: { key: nextProps.breakKey } });
            if (nextProps.breakKey) { callActions.updateCallStatus(this.props.dispatch, 'break'); }
        }

        //update waiting key in websocket
        if (this.props.waitingKey != nextProps.waitingKey) {
            this.socket.emit('event', { event: 'cti:waiting', data: { key: nextProps.waitingKey } });
            if (nextProps.waitingKey) { callActions.updateCallStatus(this.props.dispatch, 'waiting'); }
        }

        //update campaign screen id in websocket
        if (this.state.activeCampaignId != nextProps.activeCampaignId) {
            this.socket.emit('event', { event: 'cti:campaign_screen', data: { campaignScreenId: nextProps.activeCampaignId } });
        }

        //activate user in campaign -> start timing user activity in the campaign
        if (!this.props.activateUserInCampaign && nextProps.activateUserInCampaign) {
            this.socket.emit('event', { event: 'cti:activate_user'});
        }

        //deactivate user in campaign -> stop timing user activity in campaign
        if (this.props.activateUserInCampaign && !nextProps.activateUserInCampaign) {
            this.socket.emit('event', { event: 'cti:deactivate_user'});
        }
    }

    sendEndCall() {
        this.setState({inCall: false });
        this.socket.emit('event', { event: 'cti:end_call', data: {} });
    }

    render() {
        return (
            <div></div>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        webSocket: state.system.webSocket,
        webDialer: state.system.webDialer,
        inCallScreen: state.call.inCallScreen,
        simulationMode: state.campaign.simulationMode,
        campaignId: state.campaign.campaignId,
        callKey: state.call.activeCall.callKey,
        showBetweenCallsModal: state.campaign.modalBetweenCalls.show,
        showInBreakModal: state.campaign.modalBreak.show,
        breakKey: state.campaign.breakKey,
        waitingKey: state.campaign.waitingKey,
        activeCampaignId: state.campaign.activeCampaignId,
        activateUserInCampaign: state.campaign.activateUserInCampaign
    };
}

export default connect(mapStateToProps)(withRouter(WebSocket));