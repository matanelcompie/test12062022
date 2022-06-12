import React from 'react';
import { connect } from 'react-redux';

import { isLandPhone, checkKosherPhone } from '../../../../../libs/globalFunctions';

import * as callActions from '../../../../../actions/callActions';
import * as uiActions from '../../../../../actions/uiActions';


class PhoneItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            undoOver: false,
            deleteOver: false,
            validInput: true
        };

        this.initConstants();
    }
    componentWillMount(){
        let phone_number = this.props.item.phone_number ? this.props.item.phone_number : null;
        let validInput = this.props.validatePhone(phone_number, this.props.phoneIndex);
        this.setState({ validInput })
    }
    initConstants() {
        this.nonActiveValueStyle = {
            backgroundColor: 'gray',
            opacity: '0.5'
        };

        this.actionStyle = {
            backgroundColor: '#f0f4f7',
            color: '#b4bcc6'
        };

        this.actionMouseOverStyle = {
            backgroundColor: '#cfd3dc',
            color: 'white'
        };

        this.errorMessage = "מספר לא תקין";
    }

    showDeleteModal() {
        if (!this.canDelete) { return; }

        let modalHeader = 'מחיקת טלפון ';
        modalHeader += this.props.item.phone_number;

        uiActions.showDeletePhoneModal(this.props.dispatch, this.props.phoneIndex, modalHeader)
    }

    undoChanges() {
	 
        let phoneKey = this.props.item.key;
        if (phoneKey == null) {
            callActions.deleteVoterPhone(this.props.dispatch, this.props.phoneIndex);
        } else {
            callActions.undoVoterPhoneChanges(this.props.dispatch, this.props.phoneIndex);
        }
		 
        //let phone_number = this.props.item.phone_number ? this.props.item.phone_number : null;
		
        //let validInput = this.props.validatePhone(phone_number, this.props.phoneIndex);
        this.setState({ validInput:true })
    }

    callViaTmChange() {
        if (!this.canEdit) { return; }

        let newCallViaTm = (this.props.item.call_via_tm) ? 0 : 1;

        callActions.changeVoterPhoneInputField(this.props.dispatch, this.props.phoneIndex, 'call_via_tm', newCallViaTm);
    }

    smsChange() {
        if (!this.canEdit) { return; }

        let newSendSms = (this.props.item.sms) ? 0 : 1;

        callActions.changeVoterPhoneInputField(this.props.dispatch, this.props.phoneIndex, 'sms', newSendSms);
    }

    phoneNumberChange(event) {
        if (!this.canEdit) { return; }
        let phoneNumber = event.target.value;
        callActions.changeVoterPhoneInputField(this.props.dispatch, this.props.phoneIndex, 'phone_number', phoneNumber);
        
        let validInput = this.props.validatePhone(phoneNumber, this.props.phoneIndex);
        this.setState({ validInput })

        if (phoneNumber.length > 0 && checkKosherPhone(phoneNumber.split('-').join(''))) {
            callActions.changeVoterPhoneInputField(this.props.dispatch, this.props.phoneIndex, 'sms', 0);
        }
    }

    initVariables() {
        this.mobileStyle = {};
        this.phoneStyle = {};

        if (this.props.item.sms == 1) {
            this.mobileStyle = {
                backgroundColor: '#ab67c8'
            };
        } else {
            this.mobileStyle = {
                backgroundColor: this.nonActiveValueStyle.backgroundColor,
                opacity: this.nonActiveValueStyle.opacity
            };
        }

        if (this.props.item.call_via_tm == 1) {
            this.phoneStyle = {
                backgroundColor: '#38c099'
            };
        } else {
            this.phoneStyle = {
                backgroundColor: this.nonActiveValueStyle.backgroundColor,
                opacity: this.nonActiveValueStyle.opacity
            };
        }
    }

    mouseOutAction(actionName) {
        let stateObj = {};

        stateObj[actionName] = false;

        this.setState(stateObj);
    }

    mouseOverAction(actionName) {
        let stateObj = {};

        stateObj[actionName] = true;

        this.setState(stateObj);
    }

    render() {
        this.initVariables();

        let phoneToCheck = '';
        let validInput = this.state.validInput;

        let mobileIconStyle = {};

        let kosherStyle = {
            backgroundColor: this.nonActiveValueStyle.backgroundColor,
            opacity: this.nonActiveValueStyle.opacity
        };

        let errorMessageStyle = {
            color: '#e35065',
            visibility: validInput ? 'hidden' : 'visible'
        };

        if (validInput) {
            phoneToCheck = this.props.item.phone_number.split('-').join('');

            if (checkKosherPhone(phoneToCheck)) {
                kosherStyle = {
                    backgroundColor: '#3bc4cb'
                };

                this.mobileStyle = {
                    backgroundColor: this.nonActiveValueStyle.backgroundColor,
                    opacity: this.nonActiveValueStyle.opacity
                };

                mobileIconStyle = {
                    cursor: 'not-allowed'
                };
            }

            if (isLandPhone(phoneToCheck)) {
                this.mobileStyle = {
                    backgroundColor: this.nonActiveValueStyle.backgroundColor,
                    opacity: this.nonActiveValueStyle.opacity
                };

                mobileIconStyle = {
                    cursor: 'not-allowed'
                }
            }
        }
        let disabledClass = !this.props.canEdit ? ' disabledClass' : '';
        let disabledDeleteClass = !this.props.canDelete ? ' disabledClass' : '';

        this.canEdit = this.props.canEdit;
        this.canDelete = this.props.canDelete;
        return (

            <div className="contact-info-phones__item">
                <div className="contact-info-phones__item-input">
                    <input type="text" value={this.props.item.phone_number}
                        className={this.state.validInput ? "" : "form-input-error"}
                        disabled={!this.canEdit}
                        onChange={this.phoneNumberChange.bind(this)}
                        readOnly={(this.props.item.id)? true : null}/>

                    <span className="contact-info-phones__icon contact-info-phones__icon-mobile"
                        style={this.mobileStyle}>
                        <i className={"fa fa-mobile" + disabledClass} style={mobileIconStyle} onClick={this.smsChange.bind(this)} aria-hidden="true" />
                    </span>

                    <span className="contact-info-phones__icon contact-info-phones__icon-phone"
                        style={this.phoneStyle}>
                        <i className={"fa fa-phone" + disabledClass} onClick={this.callViaTmChange.bind(this)} aria-hidden="true" />
                    </span>

                    <span className={"contact-info-phones__icon-kosher" + disabledClass} style={kosherStyle}>K</span>
                </div>

                <div style={errorMessageStyle}>{this.errorMessage}</div>

                <div className="contact-info-phones__item-actions">
                    <span className="contact-info-phones__item-action-undo"
                        style={(this.state.undoOver) ? this.actionMouseOverStyle : this.actionStyle}
                        onMouseOver={this.mouseOverAction.bind(this, 'undoOver')}
                        onMouseOut={this.mouseOutAction.bind(this, 'undoOver')}
                        onClick={this.undoChanges.bind(this)}>
                        <i className={"fa fa-undo fa-6" + disabledClass} />
                    </span>

                    <span className="contact-info-phones__item-action-delete"
                        style={(this.state.deleteOver) ? this.actionMouseOverStyle : this.actionStyle}
                        onMouseOver={this.mouseOverAction.bind(this, 'deleteOver')}
                        onMouseOut={this.mouseOutAction.bind(this, 'deleteOver')}
                        onClick={this.showDeleteModal.bind(this)}>
                        <i className={"fa fa-trash fa-6" + disabledDeleteClass} />
                    </span>
                </div>
            </div>
        );
    }
}


export default connect()(PhoneItem);