import React from 'react';
import { connect } from 'react-redux';
import Combo from 'components/global/Combo';
import VoterWebDialer from './VoterWebDialer';
import ModalAudio from './ModalAudio';

import * as VoterActions from 'actions/VoterActions';
import * as SystemActions from 'actions/SystemActions';

class VoterDialerWindow extends React.Component {

    componentWillMount() {
        this.callBoxOpen = 'closed-full full';
        this.initState = {
            phoneSelected: { id: null, phone_number: '' },
            conversation_with_other: '',
            description: '',
            canEditCall: false,
            fastSelectPhoneNumber: null
        }
        let initState = { ...this.initState }
        this.checkAudioInput();

        this.canEditCall = false;

        let fastSelectPhoneNumber = this.props.voterDetails.fastSelectPhoneNumber
        if (fastSelectPhoneNumber) {
           let  phoneSelected = this.props.voterDetails.voterEnabledPhones.find(function (phone) {
                if (phone.phone_number == fastSelectPhoneNumber) { return phone; }
            });
            if (phoneSelected) {
                initState.phoneSelected = phoneSelected;
            }
        }
        this.setState(initState);
    }
    componentWillReceiveProps(nextProps){
       let nextCallKey = nextProps.callKey;

        if (!this.props.callKey && nextCallKey) { // If call had been started
            this.setState({ canEditCall: true })
        }
        if(!nextCallKey){
            this.setState({ canEditCall: false })
        }

        // Update phone number when selected other phone.
        let fastSelectPhoneNumber = nextProps.voterDetails.fastSelectPhoneNumber;
        if(fastSelectPhoneNumber !=  this.state.fastSelectPhoneNumber ){
            let phoneSelected = { ...this.initState.phoneSelected };
            if(fastSelectPhoneNumber){
                phoneSelected = nextProps.voterDetails.voterEnabledPhones.find(function (phone) {
                    if (phone.phone_number == fastSelectPhoneNumber) {  return phone; }
                });
            }
            this.setState({ phoneSelected: phoneSelected, fastSelectPhoneNumber: fastSelectPhoneNumber })
        }
    }
    /**
     * Check if audio input exists
     * @return void
     */
    checkAudioInput() {
        let self = this;
        let actionType = SystemActions.ActionTypes.SET_AUDIO_STATE;
        let existAudioInput = this.props.existAudioInput
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function () {
                if (!existAudioInput) { self.props.dispatch({ type: actionType, existAudioInput: true }) };
            }, function () {
                if (existAudioInput) { self.props.dispatch({ type: actionType, existAudioInput: false }) };
            });
    }
    resizeCallBox() {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_DIALER_WINDOW.TOGGLE_CALL_BOX })
    }
    selectPhoneNumber(e){
        let selectedItem = e.target.selectedItem;
        let phoneSelected = selectedItem ? selectedItem : this.initState.phoneSelected;
        this.setState({ phoneSelected })
    }
     saveCallData(){ 
        let updateData = {
            description: this.state.description,
            conversation_with_other: this.state.conversation_with_other,
        };
        VoterActions.editAction(this.props.dispatch, this.props.voterDetails.key, this.props.callKey, updateData, true)
    }
    closeCallBox(){
        if(!this.props.inCall){
            this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_DIALER_WINDOW.TOGGLE_CALL_BOX })
            this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_DIALER_WINDOW.DISPLAY_CALL_BOX, display: false, voterDetails: null });
        }
    }
    onInputChange(fieldName, e) {
        let newState = { ...this.state }
        let fieldValue = e.target.value || '';
        newState[fieldName] = fieldValue;
        this.setState(newState);
    }

    resetCallDetails() {
        this.setState({ description: '', conversation_with_other: '' });
    }
    renderVoterPhones() {
        this.validPhoneNumber = this.state.phoneSelected.id ?true :false;
        let comboStyle = this.validPhoneNumber ? {} : { border: '2px solid red' };
        return (
            <div className="form-group">
                <Combo items={this.props.voterDetails.voterEnabledPhones}
                    id="inputBirthPlace"
                    itemIdProperty="id"
                    itemDisplayProperty='phone_number'
                    value={this.state.phoneSelected.phone_number}
                    inputStyle={comboStyle}
                    showFilteredList={false}
                    disabled={this.props.inCall}
                    onChange={this.selectPhoneNumber.bind(this)} />
            </div>
        )
    }

    renderResizeButton() {
        return (
            <a onClick={this.resizeCallBox.bind(this)} >
                <i className="fa fa-bars toggle-open-button" aria-hidden="true"></i>
            </a>
        )
    }

    renderModalAudio() {
        if (this.props.existAudioInput === false) {
            return (
                <ModalAudio
                    buttonOk={this.checkAudioInput.bind(this)}
                    buttonCancel={this.closeCallBox.bind(this)} />
            )
        }
        return null;
    }
    
    render() {
        let voterDetails = this.props.voterDetails;
        let callBoxOpen = this.props.dialerWindowData.callBoxOpen;
        let callBoxClass = callBoxOpen ? 'full' : 'closed';
        let dialerBoxClass = '';
        if(this.props.inCall){  dialerBoxClass = !this.props.isCallHolded ? 'in-call' : 'in-hold-call'; }
        return (
            <div>
            <div className={"dialer-box " + callBoxClass + ' ' + dialerBoxClass}>
                <div className="inner-box">
                    <div className="row">
                        <div className="col-md-12">
                            <div style={callBoxOpen ? {} : { display: 'none' }}>
                                <button type="button" className="close close-btn"
                                    style={this.props.inCall ? { cursor: 'not-allowed' } : {}}
                                    onClick={this.closeCallBox.bind(this)}>
                                    <span>×</span>
                                </button>

                                <h4>{voterDetails.first_name + ' ' + voterDetails.last_name}</h4>
                                {this.renderVoterPhones()}
                                <VoterWebDialer
                                    resetCallDetails={this.resetCallDetails.bind(this)}
                                    phoneNumber={this.state.phoneSelected.phone_number}
                                />
                                <div className="form-group">
                                    <label>פירוט השיחה:</label>
                                    <textarea rows="3" className="form-control" value={this.state.description}
                                        style={{ resize: 'none' }}
                                        onChange={this.onInputChange.bind(this, 'description')}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>עם מי שוחחתי:</label>
                                    <input className="form-control" maxLength="100" value={this.state.conversation_with_other} 
                                        onChange={this.onInputChange.bind(this, 'conversation_with_other')} />
                                </div>
                                <div className="form-group">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-8">
                                        <button className="btn btn-block btn-success" disabled={!this.state.canEditCall}
                                            onClick={this.saveCallData.bind(this)}>שמור</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderResizeButton()}
            </div>
                {this.renderModalAudio()}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        existAudioInput: state.system.existAudioInput,
        voterDetails: state.voters.voterDialerWindowData.voterDetails,
        dialerWindowData: state.voters.voterDialerWindowData,
        callKey: state.voters.voterDialerWindowData.callKey,
        isCallHolded: state.voters.voterDialerWindowData.isCallHolded,
        inCall: state.voters.voterDialerWindowData.inCall,
    }
}

export default connect(mapStateToProps)(VoterDialerWindow);