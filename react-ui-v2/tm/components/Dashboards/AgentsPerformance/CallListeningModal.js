import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import * as campaignActions from 'tm/actions/campaignActions';

import ModalWindow from 'components/global/ModalWindow';
import ModalAudio from 'components/global/VoterWebDialer/ModalAudio';

// import * as campaignActions from 'tm/actions/campaignActions';
import * as systemActions from 'tm/actions/systemActions';

import CallListeningWebDialer from './CallListeningWebDialer';


class CallListeningModal extends React.Component {
    componentWillMount() {
        this.checkAudioInput();

		let self = this;
		this.reloadVoterOnline = setInterval(function () {
				self.reloadData();
		}, 5000);
    }
	
	reloadData(){
		 campaignActions.loadOnlineVoterCallingData(this.props.dispatch , this.props.campaignKey , this.props.callListenData.key);
	}

    renderModalAudio() {
        if (this.props.existAudioInput === false) {
            return (<ModalAudio
                buttonOk={this.checkAudioInput.bind(this)}
                buttonCancel={this.props.hideModal.bind(this, null)} />)
        }
        return null;
    }
    /**
    * Check if audio input exists
    * @return void
    */
    checkAudioInput() {
        let self = this;
        let actionType = systemActions.types.SET_AUDIO_STATE;
        let existAudioInput = this.props.existAudioInput
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function () {
                if (!existAudioInput) { self.props.dispatch({ type: actionType, existAudioInput: true }) };
            }, function () {
                if (existAudioInput) { self.props.dispatch({ type: actionType, existAudioInput: false }) };
            });
    }
    render() {
		//console.log("Ff");
        let callListenData = this.props.callListenData;
		//console.log(callListenData);
        return (
            <div className="modal-md">
                <ModalWindow show={true}
                    buttonX={this.props.hideModal.bind(this, null)}
                    buttonOk={this.props.hideModal.bind(this, null)}
                    buttonOkText='סגור'
					ignoreOverflowSettings={true}
                    title={'האזנה לשיחה עם נציג'}>
                    <h2>
                        <label> פרטי נציג: </label> <br />
                        <b> {callListenData.full_name} </b>
                        <span> ({callListenData.personal_identity}) </span>
                    </h2>
                    <br />
                    <h2>
                        <label> פרטי תושב: </label>  <br />
                        <p><Link to={'elections/voters/' + callListenData.voter_key} target="_blank">
                            <b> {callListenData.voter_name} </b>
                        </Link></p>
                        <label>טלפון:</label> <span> {callListenData.phone_number} </span>
                    </h2>
                    <CallListeningWebDialer campaignKey={this.props.campaignKey} employeeDialerId={callListenData.dialer_id}></CallListeningWebDialer>
                </ModalWindow>
                {this.renderModalAudio()}
            </div>
        )
    }
	
	 componentWillUnmount(){
		clearInterval(this.reloadVoterOnline);
     
    }
}
function mapStateToProps(state) {
    return {
        existAudioInput: state.system.existAudioInput,
		callListenData: state.tm.campaign.callListenData,
    }
}

export default connect(mapStateToProps)(CallListeningModal);

