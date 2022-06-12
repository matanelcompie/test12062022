import React from 'react';
import { connect } from 'react-redux';

import { isMobilePhone, checkKosherPhone } from '../../../../libs/globalFunctions';

import ModalWindow from '../../../common/ModalWindow';

import * as uiActions from '../../../../actions/uiActions';
import * as callActions from '../../../../actions/callActions';


class ModalSendSms extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }
    componentWillReceiveProps(nextprops) {
        if (nextprops.sms_message != this.props.sms_message || nextprops.showSendSmsModal != this.props.showSendSmsModal) {
            uiActions.changeSmsInputField(this.props.dispatch, 'message', nextprops.sms_message);
        }
    }
    initConstants() {
        this.modalTexts = {
            title: 'שליחת SMS',
            buttonOkText: 'שלח SMS',
            buttonCancelText: 'בטל'
        };

        this.selectItems = {
            choose: 'בחר',
            other: 'אחר'
        };

        this.icons = {
            valid: window.Laravel.baseURL + 'Images/icon-ok.png',
            invalid: window.Laravel.baseURL + 'Images/icon-x.png',
            kosher: window.Laravel.baseURL + 'Images/icon-kosher.png'
        };

        this.labels = {
            phone: 'בחר מספר טלפון',
            message: 'תוכן ההודעה'
        };

        this.phoneTypes = require('../../../../libs/constants').phoneTypes;
    }

    hideModalDialog() {
        uiActions.hideSendSmsModal(this.props.dispatch);
    }

    sendSms() {
        callActions.addPhoneToVoter(this.props.dispatch, this.phoneTypes.mobile,
            this.props.sendSmsFormInputFields.phoneNumber);

        if (this.props.inCallScreen) {
            callActions.sendSms(this.props.callKey, this.props.sendSmsFormInputFields.phoneNumber,
                this.props.sendSmsFormInputFields.message);
        }

        uiActions.hideSendSmsModal(this.props.dispatch);
    }

    isInputTextDisplayed() {
        if (this.props.phones.length == 0 || this.props.sendSmsFormInputFields.selected == this.selectItems.other) {
            return true;
        } else {
            return false;
        }
    }

    selectChange(event) {
        let selectedValue = event.target.value;

        if (selectedValue == this.selectItems.choose || selectedValue == this.selectItems.other) {
            uiActions.changeSmsInputField(this.props.dispatch, 'selected', selectedValue);
            uiActions.changeSmsInputField(this.props.dispatch, 'phoneNumber', '');
        } else {
            uiActions.changeSmsInputField(this.props.dispatch, 'selected', selectedValue);
            uiActions.changeSmsInputField(this.props.dispatch, 'phoneNumber', selectedValue);
        }

        this.validateForOkButton(event.target.value, this.props.sendSmsFormInputFields.message);
    }

    messageChange(event) {
        uiActions.changeSmsInputField(this.props.dispatch, 'message', event.target.value);

        this.validateForOkButton(this.props.sendSmsFormInputFields.phoneNumber, event.target.value);
    }

    inputTextChange(event) {
        uiActions.changeSmsInputField(this.props.dispatch, 'phoneNumber', event.target.value);

        this.validateForOkButton(event.target.value, this.props.sendSmsFormInputFields.message);
    }

    renderInput() {
        if (this.isInputTextDisplayed()) {
            return (
                <div className={this.textInputClass}>
                    <input value={this.props.sendSmsFormInputFields.phoneNumber} onChange={this.inputTextChange.bind(this)} />
                    <img src={this.inputImage} />
                </div>
            );
        }
    }

    renderPhones() {
        let options = this.props.phones.map(function (phoneNumber, index) {
            return (
                <option key={index} value={phoneNumber}>{phoneNumber}</option>
            );
        });

        return options;
    }

    renderSelect() {
        if (this.props.phones.length > 0) {
            return (
                <div className="modal-send-sms__form-select">
                    <select style={{ width: '326px' }} onChange={this.selectChange.bind(this)}>
                        <option value={this.selectItems.choose}>{this.selectItems.choose}</option>
                        {this.renderPhones()}
                        <option value={this.selectItems.other}>{this.selectItems.other}</option>
                    </select>
                </div>
            );
        }
    }

    validateMessage(message = null) {
        let messageToCheck = '';

        if (null == message) {
            messageToCheck = (this.props.sendSmsFormInputFields.message)? this.props.sendSmsFormInputFields.message : '';
        } else {
            messageToCheck = message;
        }

        if (0 == messageToCheck.length) {
            return false;
        } else {
            return true;
        }
    }

    validatePhone(phoneNumber = null) {
        let phoneToCheck = '';
        let isValidPhone = true;

        if (null == phoneNumber) {
            phoneToCheck = this.props.sendSmsFormInputFields.phoneNumber.split('-').join('');
        } else {
            phoneToCheck = phoneNumber.split('-').join('');
        }

        if (!isMobilePhone(phoneToCheck)) {
            isValidPhone = false;
        } else if (checkKosherPhone(phoneToCheck)) {
            isValidPhone = false;

            this.kosherPhone = true;
        }

        return isValidPhone;
    }

    validateForOkButton($phoneNumber, $message) {
        let validInputs = true;

        if (!this.validatePhone($phoneNumber)) {
            validInputs = false;
        }

        if (!this.validateMessage($message)) {
            validInputs = false;
        }

        if (validInputs) {
            uiActions.enableSendSmsOkStatus(this.props.dispatch);
        } else {
            uiActions.disableSendSmsOkStatus(this.props.dispatch);
        }
    }

    validateVariables() {
        if (this.validatePhone()) {
            this.textInputClass = "modal-send-sms__form-input modal-send-sms__form-input-text-valid";
            this.inputImage = this.icons.valid;
        } else {
            this.textInputClass = "modal-send-sms__form-input modal-send-sms__form-input-text-error";

            this.inputImage = (this.kosherPhone) ? this.icons.kosher : this.icons.invalid;
        }

        if (this.validateMessage()) {
            this.textareaInputClass = "modal-send-sms__form-input-textarea-valid";
        } else {
            this.textareaInputClass = "modal-send-sms__form-input-textarea-error";
        }
    }

    initVariables() {
        this.textInputClass = "modal-send-sms__form-input modal-send-sms__form-input-text-error";
        this.textareaInputClass = "modal-send-sms__form-input-textarea-error";

        this.validPhone = false;
        this.kosherPhone = false;

        this.inputImage = '';
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <ModalWindow show={this.props.showSendSmsModal}
                buttonX={this.hideModalDialog.bind(this)}
                buttonOk={this.sendSms.bind(this)}
                buttonOkText={this.modalTexts.buttonOkText}
                buttonCancel={this.hideModalDialog.bind(this)}
                buttonCancelText={this.modalTexts.buttonCancelText}
                disabledOkStatus={this.props.disabledSendSmsOkStatus}
                title={this.modalTexts.title}
                style={{ zIndex: '9001' }}>
                <div className="modal-send-sms">
                    <div className="modal-send-sms__header-phone">{this.labels.phone}</div>

                    {this.renderSelect()}

                    {this.renderInput()}
                    <div className="modal-send-sms__header-message">{this.labels.message}</div>

                    <div className="modal-send-sms__form-input-textarea">
                        <textarea className={this.textareaInputClass}
                            value={(this.props.sendSmsFormInputFields.message)? this.props.sendSmsFormInputFields.message : ''}
                            onChange={this.messageChange.bind(this)} />
                    </div>
                </div>
            </ModalWindow>
        );
    }
}


function mapStateToProps(state) {
    return {
        showSendSmsModal: state.ui.showSendSmsModal,
        disabledSendSmsOkStatus: state.ui.disabledSendSmsOkStatus,
        sendSmsFormInputFields: state.ui.sendSmsFormInputFields,
        inCallScreen: state.call.inCallScreen,
        callKey: state.call.activeCall.callKey
    }
}

export default connect(mapStateToProps)(ModalSendSms);