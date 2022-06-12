import React from 'react';
import { connect } from 'react-redux';

import { validateEmail } from '../../../../libs/globalFunctions';
import ModalWindow from '../../../common/ModalWindow';

import * as uiActions from '../../../../actions/uiActions';
import * as callActions from '../../../../actions/callActions';


class ModalSendEmail extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }
    componentWillReceiveProps(nextprops) {
        if (!_.isEqual(nextprops.emailData, this.props.emailData) || nextprops.showSendEmailModal != this.props.showSendEmailModal) {
            let emailData = nextprops.emailData;
            this.inputChange('subject', emailData.subject);
            this.inputChange('message', emailData.message);
        }
    }
    initConstants() {
        this.modalTexts = {
            title: 'שליחת אימייל',
            buttonOkText: 'שלח אימייל',
            buttonCancelText: 'בטל'
        };

        this.labels = {
            email: 'אימייל ל:',
            subject: 'נושא:',
            message: 'תוכן ההודעה:'
        }
    }

    hideModalDialog() {
        uiActions.hideSendEmailModal(this.props.dispatch);
    }

    sendEmail() {
        callActions.updateVoterEmail(this.props.dispatch, this.props.sendEmailFormInputFields.email);

        if (this.props.inCallScreen) {
            callActions.sendSms(this.props.callKey, this.props.sendSmsFormInputFields.email,
                this.props.sendEmailFormInputFields.subject, this.props.sendSmsFormInputFields.message);
        }

        uiActions.hideSendEmailModal(this.props.dispatch);
    }

    inputChange(fieldName, event) {
        if (!event) {
            return;
        }
        let fieldValue = event;
        if (!_.isString(event)) {
            fieldValue = event.target.value;
        }

        uiActions.changeSendEmailInputField(this.props.dispatch, fieldName, fieldValue);

        switch (fieldName) {
            case 'email':
                this.validateForOkButton(fieldValue, this.props.sendEmailFormInputFields.subject,
                    this.props.sendEmailFormInputFields.message);
                break;

            case 'subject':
                this.validateForOkButton(this.props.sendEmailFormInputFields.email, fieldValue,
                    this.props.sendEmailFormInputFields.message);
                break;

            case 'message':
                this.validateForOkButton(this.props.sendEmailFormInputFields.email,
                    this.props.sendEmailFormInputFields.subject, fieldValue);
                break;
        }
    }

    initVariables() {
        this.emailInputClass = "modal-send-email__form-input-email-error";
        this.subjectInputClass = "modal-send-email__form-input-subject-error";
        this.messageInputClass = "modal-send-email__form-input-message-error";
    }

    validateMessage(message = null) {
        let messageToCheck = (message == null) ? this.props.sendEmailFormInputFields.message : message;

        return (messageToCheck.length > 0)
    }

    validateSubject(subject = null) {
        let subjectToCheck = (subject == null) ? this.props.sendEmailFormInputFields.subject : subject;

        return (subjectToCheck.length > 0)
    }

    validateEmail(email = null) {
        let emailToCheck = (email == null) ? this.props.sendEmailFormInputFields.email : email;

        if (emailToCheck.length == 0) {
            return false;
        } else {
            return validateEmail(emailToCheck);
        }
    }

    validateForOkButton(email, subject, message) {
        let validInputs = true;

        if (!this.props.sendEmailFormInputFields.email || !this.validateEmail(email)) {
            validInputs = false;
        }

        if (!this.props.sendEmailFormInputFields.subject || !this.validateSubject(subject)) {
            validInputs = false;
        }

        if (!this.props.sendEmailFormInputFields.message || !this.validateMessage(message)) {
            validInputs = false;
        }

        if (validInputs) {
            uiActions.enableSendEmailOkStatus(this.props.dispatch);
        } else {
            uiActions.disableSendEmailOkStatus(this.props.dispatch);
        }
    }

    validateVariables() {
        if (this.validateEmail()) {
            this.emailInputClass = "modal-send-email__form-input-email-valid";
        } else {
            this.emailInputClass = "modal-send-email__form-input-email-error";
        }

        if (this.validateSubject()) {
            this.subjectInputClass = "modal-send-email__form-input-subject-valid";
        } else {
            this.subjectInputClass = "modal-send-email__form-input-subject-error";
        }

        if (this.validateMessage()) {
            this.messageInputClass = "modal-send-email__form-input-message-valid";
        } else {
            this.messageInputClass = "modal-send-email__form-input-message-error";
        }
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <ModalWindow show={this.props.showSendEmailModal}
                buttonX={this.hideModalDialog.bind(this)}
                buttonOk={this.sendEmail.bind(this)}
                buttonOkText={this.modalTexts.buttonOkText}
                buttonCancel={this.hideModalDialog.bind(this)}
                buttonCancelText={this.modalTexts.buttonCancelText}
                disabledOkStatus={this.props.disabledSendEmailOkStatus}
                title={this.modalTexts.title}
                style={{ zIndex: '9001' }}>
                <div className="modal-send-email">
                    <div className="modal-send-email__header-email">{this.labels.email}</div>

                    <div>
                        <input className={this.emailInputClass}
                            value={this.props.sendEmailFormInputFields.email}
                            onChange={this.inputChange.bind(this, 'email')} />
                    </div>

                    <div className="modal-send-email__header-subject">{this.labels.subject}</div>

                    <div>
                        <input className={this.subjectInputClass}
                            value={this.props.sendEmailFormInputFields.subject}
                            onChange={this.inputChange.bind(this, 'subject')} />
                    </div>

                    <div className="modal-send-email__header-message">{this.labels.message}</div>

                    <div>
                        <textarea className={this.messageInputClass}
                            value={this.props.sendEmailFormInputFields.message}
                            onChange={this.inputChange.bind(this, 'message')} />
                    </div>
                </div>
            </ModalWindow>
        );
    }
}

function mapStateToProps(state) {
    return {
        showSendEmailModal: state.ui.showSendEmailModal,
        disabledSendEmailOkStatus: state.ui.disabledSendEmailOkStatus,
        sendEmailFormInputFields: state.ui.sendEmailFormInputFields,
        inCallScreen: state.call.inCallScreen,
        callKey: state.call.activeCall.callKey
    }
}

export default connect(mapStateToProps)(ModalSendEmail);