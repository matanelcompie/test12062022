import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import * as campaignActions from 'tm/actions/campaignActions';


class CallListeningWebDialer extends React.Component {
  constructor(props) {
    super(props);
    this.initConstants();

    this.initState = {
      registered: false,
      callEndText: null,
      isCallHolded: false,
      currentCallType: null,
    }

    this.state = { ...this.initState }
  }

  initConstants() {
    this.ua = null;
    this.currentSession = null;
    this.options = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false
        }
      }

    }
    this.callTexts = {
      listening_only: 'האזנה בלבד',
      employee_only: 'לחישה לנציג',
      conference: 'שיחת ועידה',
    }
    // this.CHANGE_CALL_STATUS_TYPE = VoterActions.ActionTypes.VOTER_DIALER_WINDOW.SET_CALL_STATUS;

  }
  componentWillMount() {
    console.log("get web dialer per campaign key " + this.props.campaignKey);

    campaignActions.getWebDialer(this.props.dispatch, this.props.campaignKey);
    //console.log("sip number : " + this.props.employeeDialerId);
    /*
        if(this.props.sipnumber){
            this.registerWebDialer(this.props);
        }else{
            campaignActions.getWebDialer(this.props.dispatch, this.props.campaignKey);
        }
    */


  }
  /* To change componentWillReceiveProps()*/
  componentWillReceiveProps(nextProps) {
    console.log(this.props.campaignKey + "-" + nextProps.campaignKey);
    if (!this.state.registered && nextProps.sipnumber) {
      if (!this.props.sipnumber) { // If get user sip number.
        console.log("register web dialer");
        this.registerWebDialer(nextProps);
      } else if (!this.props.existAudioInput && nextProps.existAudioInput) { // If insert audio input.
        this.registerWebDialer(nextProps);
      }
    }

  }



  registerWebDialer(props) {
    if (!props.existAudioInput || this.ua) { return; }
    let webDialer = props.userDialerExtension;

    let self = this;
    let server_name = webDialer.server_name;
    let wsServers = 'wss://' + server_name + ':7443/ws';
    let dialerConfig = {
      userAgentString: 'SIP.js/0.12.0 BB',
      uri: webDialer.sipnumber + '@' + server_name,
      transportOptions: {
        wsServers: [wsServers]
      },
      authorizationUser: webDialer.sipnumber,
      password: webDialer.password,
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
  /* To change canStartNewCall()*/

  canStartNewCall() {
    if (!this.state.registered || this.state.currentCallType != null) {
      return false;
    }
    return true;
  }
  /* To change startNewCall()*/
  startNewCall(newCallType) {
    let self = this;
    if (!this.canStartNewCall()) { return; }

    // reset last call.
    this.setState({ currentCallType: newCallType, isCallHolded: false })

    let remoteVideo = document.getElementById('remote_video');
    let localVideo = document.getElementById('local_video');

    let callPrefix;
    switch (newCallType) {
      case 'listening_only': //
        callPrefix = '991';
        break;
      case 'employee_only':
        callPrefix = '992';
        break;
      case 'conference':
        callPrefix = '993';
        break;
      default:
        return false;
    }
    let userDialerExtension = this.props.userDialerExtension;
    let server_name = userDialerExtension.server_name;
    let sipnumber = this.props.employeeDialerId;

    let fullUrl = callPrefix + sipnumber + "@" + server_name;

    this.currentSession = this.ua.invite(fullUrl, this.options);

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
      campaignActions.monitorCampaignMessageApi("web dialer -> call accepted", { campaignId: this.props.campaignKey} )
      console.log('accepted');
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

  holdCall() {
    let isCallHolded = this.state.isCallHolded;
    if (isCallHolded) {
      this.currentSession.unhold();
    } else {
      this.currentSession.hold();
    }
    this.setState({ isCallHolded: !isCallHolded })
  }
  endCall(terminateCall = false) {
    if (this.currentSession) {
      clearInterval(this.CallDurationInterval);
      if (terminateCall) {
        this.currentSession.terminate();
        campaignActions.monitorCampaignMessageApi("web dialer -> call terminated", { campaignId: this.props.campaignKey })
        this.currentSession = null;
      }
    }
    this.setState({ currentCallType: null })
  }
  endCurrentCall() {
    this.endCall(true);
  }
  renderCallButtons() {
    let callBtnClass = ''; //call-actions__btn_orange
    let holdCallClass = this.state.isCallHolded ? 'call-actions__btn_orange' : 'call-actions__btn_gray';
    let currentCallType = this.state.currentCallType;
    return (
      <div className="row form-group">
        {!currentCallType && <div className="col-md-4">
          <div className={'call-actions__btn ' + callBtnClass} title={this.callTexts['listening_only']}
            onClick={this.startNewCall.bind(this, 'listening_only')}>
            <i className="fa fa-assistive-listening-systems" aria-hidden="true"></i></div>
        </div>}

        {!currentCallType && <div className="col-md-4" >
          <div className={"call-actions__btn " + callBtnClass} title={this.callTexts['employee_only']}
            onClick={this.startNewCall.bind(this, 'employee_only')}>
            <img className="img-responsive" style={{ height: '22px', filter: 'invert(100%)' }} src={window.Laravel.baseURL + "Images/support_solid.svg"} />
          </div>
        </div>}

        {!currentCallType && <div className="col-md-4">
          <div className="call-actions__btn " title={this.callTexts['conference']}
            onClick={this.startNewCall.bind(this, 'conference')}>
            <i className="fa fa-users" aria-hidden="true"></i>
          </div>
        </div>}
        {currentCallType && <div className="col-md-12">
          <div className="call-actions__btn call-actions__btn_red" onClick={this.endCall.bind(this, true)}>
            <i className="fa fa-phone" aria-hidden="true"></i></div>
        </div>}

        {false && <div className="col-md-6">
          <div className={"call-actions__btn " + holdCallClass} onClick={this.holdCall.bind(this)}>
            <i className="fa fa-microphone-slash" aria-hidden="true"></i></div>
        </div>}
      </div>
    )
  }
  getCallText() {

  }
  renderCallData() {
    let currentCallType = this.state.currentCallType;
    let callTextData = null;
    if (currentCallType) {
      callTextData = <h2 className="col-md-12 text-success">{this.callTexts[currentCallType]}</h2>
    } else if (this.state.callEndText) {
      let callEndText = this.state.registered ? ' השיחה ' + this.state.callEndText : this.state.callEndText
      callTextData = <h2 className="col-md-12 text-danger">{callEndText}</h2>
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
    clearInterval(this.reloadVoterOnline);
    if (this.ua) {
      this.ua.stop()
    }
  }
}


function mapStateToProps(state) {
  return {
    userDialerExtension: state.tm.campaign.userDialerExtension,
    sipnumber: state.tm.campaign.userDialerExtension.sipnumber,
    existAudioInput: state.system.existAudioInput,
  }
}

export default connect(mapStateToProps)(withRouter(CallListeningWebDialer));
