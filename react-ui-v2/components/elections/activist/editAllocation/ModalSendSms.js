import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants'
import { checkKosherPhone } from 'libs/globalFunctions';

import ModalWindow from 'components/global/ModalWindow';


class ModalSendSms extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            smsText: constants.activists.verificationMessageText,

            buttons: [
                {
                    class: 'btn btn-secondary pull-right',
                    text: 'סגור',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'שלח',
                    action: this.sendSms.bind(this),
                    disabled: false
                }
            ]
        };

        this.initConstants();
    }

    initConstants() {
        this.modalTitle = 'שליחת הודעה לפעיל';

        this.labels = {
            phone: 'טלפון:',
            message: 'תוכן ההודעה:'
        };

        this.verificationMessageText = {
            sms: constants.activists.verificationMessageText,
            ivr: constants.activists.verificationMessageTextIvr
        };

        this.invalidColor = '#cc0000';
    }

    sendSms() {
        this.hideModal();
        this.props.sendSms();
    }

    hideModal() {
        this.props.hideSmsModal();
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateSmSText() ) {
            this.validInput = false;
            this.inputSmSTextStyle = {borderColor: this.invalidColor};
        } else {
            this.inputSmSTextStyle = {};
        }
    }

    setSmsText() {
        let roleName = '';
        let activistItem = this.props.activistDetails;
        let smsText = '';
        let phoneNumber = '';

        let roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
        roleName = activistItem.election_roles_by_voter[roleIndex].election_role_name;
        phoneNumber = activistItem.election_roles_by_voter[roleIndex].phone_number;

        smsText = ( checkKosherPhone(phoneNumber) ) ? this.verificationMessageText.ivr : this.verificationMessageText.sms;
        smsText = smsText.replace('[first_name]', this.props.activistDetails.first_name);
        smsText = smsText.replace('[role_name]', roleName);

        return smsText;
    }

    render() {
        this.setSmsText();

        return (
            <ModalWindow show={this.props.show} title={this.modalTitle} buttons={this.state.buttons} buttonX={this.hideModal.bind(this)}>
                <div className="modal-send-sms">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label htmlFor="inputMobile-send-sms" className="col-sm-3 control-label">{this.labels.phone}</label>
                            <div className="col-sm-9">{this.props.phone_number}</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="inputext-send-sms" className="col-sm-3 control-label">{this.labels.message}</label>
                            <div className="col-sm-9">
                                <textarea className="form-control" rows="4" id="inputext-send-sms"
                                          value={this.setSmsText()} disabled={true}/>
                            </div>
                        </div>
                    </form>
                </div>
            </ModalWindow>
        );
    }
}

export default connect() (ModalSendSms);