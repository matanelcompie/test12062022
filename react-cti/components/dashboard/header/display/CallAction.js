import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import { isMobilePhone, checkKosherPhone, validateEmail, getCtiPermission } from '../../../../libs/globalFunctions';

import ModalSendSms from './ModalSendSms';
import ModalSendEmail from './ModalSendEmail';

import * as callActions from '../../../../actions/callActions';
import * as uiActions from '../../../../actions/uiActions';
import * as campaignActions from '../../../../actions/campaignActions';


class CallAction extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * This function is triggered
     * on end call event.
     */
    endCall() {
        // No need to end the call more than 1
        if (this.props.callSeconds == null) {
            callActions.endCall(this.props.dispatch);
            campaignActions.monitorCampaignMessageApi('Call action -> end call', { campaignId: this.props.campaignData.key});
        }
    }

    changeMuteSate() {

        if (this.props.muted) {
            callActions.unMuteCall(this.props.dispatch);
        } else {
            callActions.muteCall(this.props.dispatch);
        }
    }

    showSendEmailModal(canSendEmail) {

        if (!canSendEmail) {
            return;
        }
        if (this.props.voterEmail.length > 0 && validateEmail(this.props.voterEmail)) {
            uiActions.changeSendEmailInputField(this.props.dispatch, 'email', this.props.voterEmail);
        }

        uiActions.showSendEmailModal(this.props.dispatch);
    }

    showSendSmsModal(canSendSms) {
        if (!canSendSms) {
            return;
        }
        let currentPhoneIndex = -1;
        let phones = [];
        let phoneToCheck = '';

        currentPhoneIndex = this.props.phones.findIndex(phoneItem => phoneItem.id == this.props.current_phone.id);

        phoneToCheck = this.props.current_phone.phone_number.split('-').join('');
        if (isMobilePhone(phoneToCheck) && !checkKosherPhone(phoneToCheck)
            && this.props.phones[currentPhoneIndex].sms == 1) {
            phones.push(this.props.current_phone.phone_number);
        }

        for (let phoneIndex = 0; phoneIndex < this.props.phones.length; phoneIndex++) {
            if (phoneIndex != currentPhoneIndex) {

                phoneToCheck = this.props.phones[phoneIndex].phone_number.split('-').join('');
                if (isMobilePhone(phoneToCheck) && !checkKosherPhone(phoneToCheck) && this.props.phones[phoneIndex].sms == 1) {
                    phones.push(this.props.phones[phoneIndex].phone_number);
                }
            }
        }

        uiActions.changeSmsInputField(this.props.dispatch, 'phones', phones);

        uiActions.showSendSmsModal(this.props.dispatch);
    }

    /**
     * This function changes teh
     * text in the next call button
     * according to call statuses.
     *
     * @returns String
     */
    renderCallButton() {
        if (this.props.askForBreak) { // User asked for a break
            return 'צא להפסקה';
        } else if (this.props.showInBreakModal) { // The user is in a break
            return 'חזור מהפסקה';
        } else {
            return 'שיחה הבאה';
        }
    }

    /**
     * This function renders the end call button div.
     * If the user ended the call, there is no need to end
     * it more than 1.
     * In case the user ended the call, the button will not
     * be clickable.
     *
     * @returns {XML}
     */
    renderEndCallDiv() {
        let styleEndedCall = {
            cursor: 'default',
            opacity: '0.5',
            transform: 'rotate(135deg)'
        };

        if (this.props.showInBreakModal || this.props.showBetweenCallsModal) { // In a break or between calls
            return (
                // The div will not be clickable.
                <div className="call-actions__btn" style={{ transform: 'rotate(135deg)' }}>
                    <i className="fa fa-phone" aria-hidden="true" />
                </div>
            );
        } else { // In active call
            if (this.props.callSeconds == null) { // The call is active
                // The div will be clickable.
                return (
                    <div className="call-actions__btn call-actions__btn_red" style={{ transform: 'rotate(135deg)' }}
                        onClick={this.endCall.bind(this)}>
                        <i className="fa fa-phone" aria-hidden="true" />
                    </div>
                );
            } else { // user ended the call
                // The div will not be clickable.
                return (
                    <div className="call-actions__btn" style={styleEndedCall}>
                        <i className="fa fa-phone" style={{ cursor: 'default' }} aria-hidden="true" disabled={true} />
                    </div>
                );
            }
        }
    }

    renderMicrophoneIcon() {
        let className = "";
        let title = "";

        if (this.props.muted) {
            className = "fa fa-microphone-slash";
            title = "השמע";
        } else {
            className = "fa fa-microphone";
            title = "השתק";
        }

        return (
            <i className={className} title={title} aria-hidden="true" onClick={this.changeMuteSate.bind(this)} />
        );
    }

    render() {
        let sendSmsClass = '';
        let sendEmailClass = "";

        if (this.props.showSendSmsModal) {
            sendSmsClass = "call-actions__btn send-sms";
        } else {
            sendSmsClass = "call-actions__btn";
        }

        if (this.props.showSendEmailModal) {
            sendEmailClass = "call-actions__btn send-email";
        } else {
            sendEmailClass = "call-actions__btn";
        }
        let emailData = {
            message: this.props.campaignData.email_body,
            subject: this.props.campaignData.email_topic
        }
        let sms_message = this.props.campaignData.sms_message;

        let canSendSms = getCtiPermission(this.props.permissions, 'sms');
        let canSendEmail = getCtiPermission(this.props.permissions, 'email');
        let disabledEmailClass = canSendEmail ? '' : ' disabledClass';
        let disabledSmsClass = canSendSms ? '' : ' disabledClass';

        let endCallButtonStyle = this.props.canUserEndCall ? {} : {  opacity: '0.7', cursor: 'not-allowed' }

        return (
            <div className="call-actions">
                {this.renderEndCallDiv()}
                <div className="call-actions__btn">
                    {this.renderMicrophoneIcon()}
                </div>
                <div className="call-actions__btn">
                    <i className="fa fa-reply fa-flip-horizontal" aria-hidden="true" />
                </div>
                <div className={sendEmailClass + disabledEmailClass}>
                    <i className="fa fa-envelope"
                        onClick={this.showSendEmailModal.bind(this, canSendEmail)}
                        aria-hidden="true" />
                </div>
                <div className={sendSmsClass + disabledSmsClass}>
                    <i className="fa fa-commenting fa-flip-horizontal"
                        onClick={this.showSendSmsModal.bind(this, canSendSms)}
                        aria-hidden="true" />
                </div>

                <div className="call-actions__btn call-actions__btn_wide" onClick={this.props.nextCall} style={endCallButtonStyle}>
                    {this.renderCallButton()}
                </div>

                <ModalSendSms phones={this.props.sendSmsFormInputFields.phones} sms_message={sms_message} />

                <ModalSendEmail emailData={emailData} />
            </div>
        );
    }
};


function mapStateToProps(state) {
    return {
        callSeconds: state.call.activeCall.timer.callSeconds,
        askForBreak: state.campaign.askForBreak,
        showInBreakModal: state.campaign.modalBreak.show,
        showBetweenCallsModal: state.campaign.modalBetweenCalls.show,
        campaignData: state.campaign.campaignData,
        muted: state.call.activeCall.muted,
        current_phone: state.call.activeCall.voter.current_phone,
        phones: state.call.activeCall.voter.phones,
        voterEmail: state.call.activeCall.voter.email,
        sendSmsFormInputFields: state.ui.sendSmsFormInputFields,
        showSendSmsModal: state.ui.showSendSmsModal,
        showSendEmailModal: state.ui.showSendEmailModal,
        permissions: state.campaign.permissions,
    }
}

export default connect(mapStateToProps)(withRouter(CallAction));
