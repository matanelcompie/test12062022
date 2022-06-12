import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import * as VoterActions from 'actions/VoterActions';
import * as CampaignActions from 'tm/actions/campaignActions';
import { webDialerConfig } from 'libs/constants';

class VoterWebDialer extends React.Component {
  constructor(props) {
    super(props);
    this.initConstants();

    this.initState = {
      registered: false,
      CallDurationTime: 0, // call time in sec
      callEndText: null
    }

    this.state = { ...this.initState }
  }

  initConstants() {
    this.ua = null;
    this.currentSession = null;
    this.options = { sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } } }
    this.CHANGE_CALL_STATUS_TYPE = VoterActions.ActionTypes.VOTER_DIALER_WINDOW.SET_CALL_STATUS;

  }
  componentWillMount() {
    if (this.props.webDialer.sipnumber) {
      this.registerWebDialer(this.props);
    } else {
      VoterActions.getWebDialer(this.props.dispatch);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.state.registered && nextProps.webDialer.sipnumber) {
      if (!this.props.webDialer.sipnumber) { // If get user sip number.
        this.registerWebDialer(nextProps);
      } else if (!this.props.existAudioInput && nextProps.existAudioInput) { // If insert audio input.
        this.registerWebDialer(nextProps);
      }
    }

  }

  registerWebDialer(props) {
    if (!props.existAudioInput || this.ua) { return; }
    let self = this;
    let uri = webDialerConfig.uri;
    let wsServers = 'wss://' + uri + ':7443/ws';
    let dialerConfig = {
      userAgentString: 'SIP.js/0.12.0 BB',
      uri: props.webDialer.sipnumber + '@' + uri,
      transportOptions: {
        wsServers: [wsServers]
      },
      authorizationUser: props.webDialer.sipnumber,
      password: props.webDialer.password,
      traceSip: true
    };
    this.setState({ callEndText: '' });
    this.ua = new SIP.UA(dialerConfig);
    this.ua.register();

    this.notRegisteredTimeout = setTimeout(function () { //
      if (!self.state.registered) {
        self.setState({ callEndText: 'לא ניתן להתחבר לחייגן, אנא  נתק כל חיבור אחר ונסה שנית.' });
      }
    }, 10000);

    this.ua.on('registered', function () {
      console.log("registered");
      self.setState({ registered: true })
    });

    this.ua.on('disconnected', function () {
      self.setState({ registered: false })
      console.log('disconnected');
    });
  }
  canStartNewCall() {
    // console.log(this.state.registered , !this.props.phoneNumber , this.props.inCall);
    if (!this.state.registered || !this.props.phoneNumber || this.props.inCall) {
      return false;
    }
    return true;
  }
  startNewCall() {
    let self = this;
    if (!this.canStartNewCall()) { return; }
    this.props.dispatch({ type: this.CHANGE_CALL_STATUS_TYPE, inCall: true, isCallHolded: false })

    self.props.resetCallDetails();
    this.setState({ CallDurationTime: 0 });
    // reset last call.
    this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_DIALER_WINDOW.SET_CALL_DATA, callKey: null })

    let remoteVideo = document.getElementById('remote_video');
    let localVideo = document.getElementById('local_video');
    // let phoneNumber = '0584671611';
    // console.log(phoneNumber, this.props.phoneNumber);
    let phoneNumber = this.props.phoneNumber.replace('-', '');
    this.currentSession = this.ua.invite(phoneNumber + "@" + webDialerConfig.uri, this.options);

    this.currentSession.on('trackAdded', function () {
      console.log('trackAdded');
      // We need to check the peer connection to determine which track was added
      var pc = self.currentSession.sessionDescriptionHandler.peerConnection;

      // Gets remote tracks
      var remoteStream = new MediaStream();
      pc.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
      });
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
        remoteVideo.play();
      }

      // Gets local tracks
      var localStream = new MediaStream();
      pc.getSenders().forEach(function (sender) {
        localStream.addTrack(sender.track);
      });
      if (localVideo) {
        localVideo.srcObject = localStream;
        localVideo.play();
      }
    });
    // Call accepted by voter:
    this.currentSession.on('accepted', function () {
      console.log('accepted');
      CampaignActions.monitorCampaignMessageApi('voter web dialer call accepted', {
        campaignId: this.props.phoneNumber
      })
      self.saveCallInActions();
      self.startCallTimeCounter();
    })
    this.currentSession.on('rejected', function (data) {
      self.setState({ callEndText: 'נדחתה' })
      console.log('rejected');
      self.endCall(false);
    });

    this.currentSession.on('failed', function (data) {
      if (!self.state.callEndText) {
        self.setState({ callEndText: 'נכשלה' })
      }
      console.log('failed');
      self.endCall(false);
    });

    this.currentSession.on('cancel', function (data) {
      self.setState({ callEndText: 'בוטלה' })
      console.log('cancel');
      self.endCall(false);
    });

    this.currentSession.on('bye', function (data) {
      self.setState({ callEndText: 'נותקה' })
      console.log('bye bye');
      self.endCall(false);
    });
  }
  saveCallInActions() {
    let actionDetails = {}
    let voterKey = this.props.voterDetails.key;
    VoterActions.addNewAction(this.props.dispatch, voterKey, actionDetails, true);
  }
  startCallTimeCounter() {
    let self = this;
    this.CallDurationInterval = setInterval(function () {
      self.setState({ CallDurationTime: self.state.CallDurationTime += 1 })
    }, 1000);
  }
  holdCall() {
    let isCallHolded = this.props.isCallHolded;
    if (isCallHolded) {
      this.currentSession.unhold();
    } else {
      this.currentSession.hold();
    }
    this.props.dispatch({ type: this.CHANGE_CALL_STATUS_TYPE, inCall: true, isCallHolded: !isCallHolded })
  }
  endCall(terminateCall = false) {
    if (this.currentSession) {
      clearInterval(this.CallDurationInterval);
      if (terminateCall) {
        this.currentSession.terminate();
        CampaignActions.monitorCampaignMessageApi('voter web dialer -> end call -> terminate', { campaignId: this.props.phoneNumber })
        this.currentSession = null;
      }
    }
    this.props.dispatch({ type: this.CHANGE_CALL_STATUS_TYPE, inCall: false, isCallHolded: false })
  }
  endCurrentCall() {
    this.endCall(true);
  }
  renderCallButtons() {
    let inCall = this.props.inCall;
    let inActiveCall = (inCall && this.props.callKey) ? true : false;
    let holdCallClass = this.props.isCallHolded ? 'call-actions__btn_orange' : 'call-actions__btn_gray';
    let callBtnClass = this.canStartNewCall() ? '' : 'disabled';
    let btnGridClass = "col-md-" + (inActiveCall ? '6' : '12');
    return (
      <div className="row form-group">

        {!inCall && <div className={btnGridClass}>
          <div className={'call-actions__btn ' + callBtnClass} onClick={this.startNewCall.bind(this)}>
            <i className="fa fa-phone" aria-hidden="true"></i></div>
        </div>}

        {inCall && <div className={btnGridClass}>
          <div className="call-actions__btn call-actions__btn_red" onClick={this.endCurrentCall.bind(this)}>
            <i className="fa fa-phone" aria-hidden="true"></i></div>
        </div>}

        {inActiveCall && <div className="col-md-6" >
          <div className={"call-actions__btn " + holdCallClass} onClick={this.holdCall.bind(this)}>
            <i className="fa fa-microphone-slash" aria-hidden="true"></i></div>
        </div>}


      </div>
    )
  }
  getCallText(CallDurationTime) {
    let callTimeText = '';
    if (CallDurationTime > 0) {
      let callSeconds = CallDurationTime % 60;
      let callMinutes = (CallDurationTime - callSeconds) / 60;

      callMinutes = callMinutes < 10 ? '0' + callMinutes : callMinutes;
      callSeconds = callSeconds < 10 ? '0' + callSeconds : callSeconds;
      callTimeText = ' משך שיחה: ' + callMinutes + ':' + callSeconds;
    }
    return callTimeText;
  }
  renderCallData() {
    let CallDurationTime = this.state.CallDurationTime; // Time duration in seconds
    let callTimeText = this.getCallText(CallDurationTime);

    let callTextData = null;
    if (this.props.inCall) {
      let callText = CallDurationTime > 0 ? callTimeText : 'מחייג...';
      callTextData = <h4 className="col-md-12" style={{ color: 'green' }}>{callText}</h4>
    } else if (this.state.callEndText) {
      let txt = this.state.registered ? ' השיחה ' : '';
      let callText = txt + this.state.callEndText;
      if (CallDurationTime > 0) { callText += (', ' + callTimeText); }
      callTextData = <h4 className="col-md-12" style={{ color: 'red' }}>{callText}</h4>
    }
    return callTextData;
  }
  remoteVideoRef(element) { this.remoteVideo = element; };
  localVideoRef(element) { this.localVideo = element; }
  render() {

    return (
      <div>
        {this.renderCallButtons()}
        <div className="row" style={{ minHeight: '30px' }}>{this.renderCallData()}</div>
        <video style={{ position: 'absolute' }} autoPlay id="remote_video" width="0" height="0" ref={this.remoteVideoRef.bind(this)} />
        <video style={{ position: 'absolute' }} autoPlay id="local_video" muted="muted" width="0" height="0" ref={this.localVideoRef.bind(this)} />
      </div>
    );
  }
  componentWillUnmount() {
    this.endCall(false);
    clearTimeout(this.notRegisteredTimeout);
    if (this.ua) {
      this.ua.stop()
    }
  }
}


function mapStateToProps(state) {
  return {
    voterDetails: state.voters.voterDialerWindowData.voterDetails,
    webDialer: state.voters.voterDialerWindowData.webDialer,
    existAudioInput: state.system.existAudioInput,
    callKey: state.voters.voterDialerWindowData.callKey,
    isCallHolded: state.voters.voterDialerWindowData.isCallHolded,
    inCall: state.voters.voterDialerWindowData.inCall,
  }
}

export default connect(mapStateToProps)(withRouter(VoterWebDialer));
