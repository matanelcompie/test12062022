import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import * as systemActions from 'actions/systemActions';
import * as callActions from 'actions/callActions';
import * as campaignActions from 'actions/campaignActions';
import * as types from 'actions/actionTypes';

class WebDialer extends React.Component {
  constructor(props) {
    super(props);

    this.initConstants();

    this.ua = null;
    this.currentSession = null;

    this.state = {
      inCallScreen: false,
      betweenCalls: false,
      initiateCall: false,
      registerInterval: false
    }
  }

  initConstants() {
    this.webDialerStatus = require('../libs/constants').webDialerStatus;
    this.sessionOptions = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    //check if new sip server is selected
    if (nextProps.socketConnectionStatus &&
      nextProps.activeSipServerKey != null && this.props.activeSipServerKey != nextProps.activeSipServerKey) {
      if (this.props.webDialer.extensions[nextProps.activeSipServerKey]) {
        //connect to sip server if extension details exists
        this.connectToSipServer(this.props.webDialer.extensions[nextProps.activeSipServerKey]);
      } else {
        //remove existing sip and get extension details
        this.removeSipObject();
        systemActions.getWebDialerConfig(this.props.dispatch, nextProps.selectedCampaignKey);
      }
    }

    //check if got extension details and connect to sip server
    if (nextProps.webDialer.extensions != this.props.webDialer.extensions) {
      if (nextProps.webDialer.extensions[nextProps.activeSipServerKey]) {
        this.connectToSipServer(nextProps.webDialer.extensions[nextProps.activeSipServerKey]);
      }
    }

    if (!this.props.inCallScreen && nextProps.inCallScreen) {
      this.setState({
        inCallScreen: true
      });
    }

    if (!this.props.showBetweenCallsModal && nextProps.showBetweenCallsModal) {
      this.endSession();
      this.setState({ betweenCalls: true });
    }

    if (this.props.showBetweenCallsModal && !nextProps.showBetweenCallsModal) {
      this.setState({ betweenCalls: false });
    }

    if (!this.props.callSeconds && nextProps.callSeconds) {
      console.log("ending call from button");
      this.endSession();
    }

    if (!this.props.showInBreakModal && nextProps.showInBreakModal) {
      console.log("ending call from break modal");
      this.endSession();
    }

    if (!this.props.muted && nextProps.muted) {
      if (this.currentSession) this.currentSession.hold();
    }

    if (this.props.muted && !nextProps.muted) {
      if (this.currentSession) this.currentSession.unhold();
    }

    let manual_voter_call_data = nextProps.manual_voter_call_data;
    if (this.props.isManualCampaign && manual_voter_call_data.id && this.props.manual_voter_call_data.id !== manual_voter_call_data.id) {
      this.startNewCall(manual_voter_call_data);
    }

    if (this.props.newCallError == null && nextProps.newCallError != null) {
      console.log("new call error: " + nextProps.newCallError);
      this.endSession();
      if (this.state.betweenCalls) campaignActions.addExtensionToCampaign(this.props.activeCampaignKey, true);
    }
  }

  //start manual call
  startNewCall(manual_voter_call_data) {
    // console.log('startNewCall', this.state.registered,manual_voter_call_data)
    if (!this.state.registered || !manual_voter_call_data.id) { return; }

    const options = { sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } } }
    let testPhoneNumber = localStorage.getItem('testPhoneNumber');
    let phoneNumber = (testPhoneNumber && testPhoneNumber != undefined) ? testPhoneNumber : manual_voter_call_data.phone_number;
    console.log('phoneNumber', phoneNumber);

    let newSession = this.ua.invite(phoneNumber + "@" + this.extension.server_name, options);
    let callData = { phoneId: manual_voter_call_data.id }

    //add phone number to call
    callActions.addNewCall(this.props.dispatch, this.props.activeCampaignKey, callData, this.props.webDialer.sipnumber);
    campaignActions.monitorCampaignMessageApi('Web dialer add new call', { campaignId: this.props.activeCampaignKey, callData });
    this.setCurrentSessionListeners(newSession, this);
  }
  /**
   * Connect to sip server according to extension details
   *
   * @param object extension
   * @return void
   */
  connectToSipServer(extension) {
    console.log('register');
    this.extension = extension;
    this.removeSipObject();
    let config = { // Set web dialer config for: 1. current campaign sip server 2. user sip number:
      userAgentString: 'SIP.js/0.12.0 BB',
      uri: extension.dialer_user_id + '@' + extension.server_name,
      transportOptions: {
        wsServers: ['wss://' + extension.server_name + ':7443/ws']
      },
      authorizationUser: extension.dialer_user_id,
      password: extension.password,
      traceSip: true
    };

    let that = this;
    //  SIP -a class in js to manage socket
    this.ua = new SIP.UA(config);
    this.ua.register();

    this.ua.on('registered', function () {
      console.log("registered");
      that.setState({ registered: true })

      that.props.dispatch({ type: types.UPDATE_SIP_NUMBER, sipNumber: extension.dialer_user_id });
      systemActions.updateWebDialerStatus(that.props.dispatch, that.webDialerStatus.connected);
    });

    if (!this.props.isManualCampaign) { // Listen to dialer, If campaign in not manual.
      //not manual
      this.ua.on('invite', (session) => {

        let voterCallData = session.remoteIdentity.uri.user;
        let callDataArray = voterCallData.split("-");
        let phoneId = (callDataArray[0]) ? callDataArray[0] : '';
        let sipServerKey = (callDataArray.length > 1) ? callDataArray[1] : "";
        let callData = { phoneId, sipServerKey };

        callActions.addNewCall(that.props.dispatch, this.props.activeCampaignKey, callData, this.props.webDialer.sipnumber);
        //remove extension from campaign so it will not receive new calls untill finished
        campaignActions.deleteExtensionFromCampaign(this.props.activeCampaignKey, true);
        if (!this.props.activeCampaignKey || this.props.callStatus != 'waiting') {
          session.reject();
          console.log('reject');
          return;
        }

        this.setCurrentSessionListeners(session, this);
        session.accept(this.sessionOptions);
        console.log('accept');

      });
    }


    this.ua.on('disconnected', function () {
      console.log('disconnected');
      that.setState({ registered: false })
      systemActions.updateWebDialerStatus(that.props.dispatch, that.webDialerStatus.disconnected);
    });

    this.ua.on('unregistered', function () {
      console.log("unregistered");
      that.setState({ registered: false })
      that.ua.register();
      if (!that.state.registerInterval) that.setRegisterInterval();
    });
  }
  setCurrentSessionListeners(session, that) {

    that.currentSession = session;

    that.currentSession.on('rejected', function (data) {
      callActions.endCall(that.props.dispatch);
      console.log("session rejected");
    });

    that.currentSession.on('failed', function (data) {
      callActions.endCall(that.props.dispatch);
      console.log("session failed");
    });

    that.currentSession.on('terminated', function (data) {
      callActions.endCall(that.props.dispatch);
      console.log("session terminated");
    });

    that.currentSession.on('cancel', function (data) {
      callActions.endCall(that.props.dispatch);
      console.log("session canceled");
    });

    that.currentSession.on('bye', (data) => {
      console.log("session bye");
      if (!that.props.callSeconds) callActions.endCall(that.props.dispatch);
    });

    that.currentSession.on('accepted', function (data) {
      console.log("session accepted");
    });

    that.currentSession.on('trackAdded', () => {
      console.log("track added");
      // We need to check the peer connection to determine which track was added

      var pc = that.currentSession.sessionDescriptionHandler.peerConnection;
      // Gets remote tracks

      var remoteStream = new MediaStream();
      pc.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
      });
      that.remoteVideo.srcObject = remoteStream;
      that.remoteVideo.play();

      try {

        // Gets local tracks
        var localStream = new MediaStream();
        pc.getSenders().forEach(function (sender) {
          localStream.addTrack(sender.track);
        });
        that.localVideo.srcObject = localStream;
        that.localVideo.play();
      } catch (error) {
        console.log('error', error)
      }


    });

  }
  /**
   * Set register interval
   *
   * @return void
   */
  setRegisterInterval() {
    let registerInterval = setInterval(this.registerCheck.bind(this), 1000);
    this.setState({
      registerInterval: registerInterval
    });
  }

  /**
   * Check register atatus on ua
   *
   * @return void*/
  registerCheck() {
    if (this.ua.isRegistered()) {
      clearInterval(this.state.registerInterval);
      this.setState({
        registerInterval: false
      });
      systemActions.updateUnregisteredSeconds(this.props.dispatch, 0);
    } else {
      systemActions.updateUnregisteredSeconds(this.props.dispatch, this.props.webDialer.unregisteredSeconds + 1);
      this.ua.register();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.inCallScreen && this.state.betweenCalls && !this.state.initiateCall) {
      this.setState({ initiateCall: true });
    }

    if (this.state.inCallScreen && this.state.betweenCalls && !prevState.betweenCalls) {
      this.setState({ initiateCall: false });
    }

    if (this.state.initiateCall && !prevState.initiateCall) {
      console.log("starting call");
      if (!this.props.isManualCampaign) {
        campaignActions.addExtensionToCampaign(this.props.activeCampaignKey, true);
      } else {
        campaignActions.deleteExtensionFromCampaign(this.props.activeCampaignKey, true)
      }
    }
  }

  endSession() {
    if (this.currentSession) {
      console.log("ending call");
      this.currentSession.terminate();
      this.currentSession = null;
    }
  }

  /**
   * Remove and end sip object session if exists
   *
   * @return void
   */
  removeSipObject() {
    if (this.ua) {
      this.endSession(); this.ua.stop(); this.ua = null;
      systemActions.updateWebDialerStatus(this.props.dispatch, this.webDialerStatus.disconnected);
    }
  }

  remoteVideoRef(element) {
    this.remoteVideo = element;
  };

  localVideoRef(element) {
    this.localVideo = element;
  }

  render() {
    return (
      <div>
        <video autoPlay id="remote_video" width="0" height="0" ref={this.remoteVideoRef.bind(this)} />
        <video autoPlay id="local_video" muted="muted" width="0" height="0" ref={this.localVideoRef.bind(this)} />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    webDialer: state.system.webDialer,
    activeSipServerKey: state.campaign.activeSipServerKey,
    selectedCampaignKey: state.campaign.selectedCampaignKey,
    activeCampaignKey: state.campaign.activeCampaignKey,
    socketConnectionStatus: state.system.webSocket.connectionStatus,
    inCallScreen: state.call.inCallScreen,
    callStatus: state.call.callStatus,
    muted: state.call.activeCall.muted,
    showBetweenCallsModal: state.campaign.modalBetweenCalls.show,
    showInBreakModal: state.campaign.modalBreak.show,
    callSeconds: state.call.activeCall.timer.callSeconds,
    manual_voter_call_data: state.call.manual_voter_call_data,
    isManualCampaign: state.campaign.isManualCampaign,
    newCallError: state.call.newCallError
  }
}

export default connect(mapStateToProps)(withRouter(WebDialer));
