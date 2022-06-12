import React from 'react';

import { isLandPhone, checkKosherPhone } from '../../../../../libs/globalFunctions';


class AddNewPhone extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();

        this.initState = {
            newPhone: {
                phone_number: '',
                sms: 1,
                call_via_tm: 1
            },
            undoOver: false,
            deleteOver: false,
            validInput: true
        }
        this.state = { ...this.initState }
    }

    initConstants() {
        this.placeholder = "הוסף מספר טלפון";

        this.errorMessage = "מספר לא תקין";

        this.nonActiveValueStyle = {
            backgroundColor: 'gray',
            opacity: '0.5'
        };

        this.actionMouseOverStyle = {
            backgroundColor: '#cfd3dc',
            color: 'white'
        };
    }

    addNewPhone() {
        let phoneObj = {
            phone_number: this.state.newPhone.phone_number,
            sms: this.state.newPhone.sms,
            call_via_tm: this.state.newPhone.call_via_tm
        };

       this.resetState();

        this.props.addNewPhone(phoneObj);
    }

    callViaTmChange() {
        let newCallViaTm = (this.state.newPhone.call_via_tm == 1) ? 0 : 1;
        let newPhoneObj = this.state.newPhone;

        newPhoneObj.call_via_tm = newCallViaTm;

        this.setState({newPhone: newPhoneObj});
    }

    smsChange() {
        let newSms = (this.state.newPhone.sms == 1) ? 0 : 1;
        let newPhoneObj = this.state.newPhone;

        newPhoneObj.sms = newSms;

        this.setState({newPhone: newPhoneObj});
    }

    phoneNumberChange(event) {
        let phoneNumber = event.target.value;
        let phoneToCheck = '';
        let newPhoneObj = this.state.newPhone;

        newPhoneObj.phone_number = phoneNumber;
        if ( phoneNumber.length > 0 ) {
            phoneToCheck = phoneNumber.split('-').join('');

            if (checkKosherPhone(phoneToCheck) || isLandPhone(phoneToCheck) ) {
                newPhoneObj.sms = 0;
            }
        }
        let validInput = this.props.validatePhone(phoneNumber, 'new');

        this.setState({newPhone: newPhoneObj, validInput});

        if ( validInput && phoneNumber.length > 0 ) {
            this.addNewPhone();
        }
    }

    initVariables() {
        this.mobileStyle = {};
        this.phoneStyle = {};

        if ( this.state.newPhone.sms == 1 ) {
            this.mobileStyle = {
                backgroundColor: '#ab67c8'
            };
        } else {
            this.mobileStyle = {
                backgroundColor: this.nonActiveValueStyle.backgroundColor,
                opacity: this.nonActiveValueStyle.opacity
            };
        }

        if ( this.state.newPhone.call_via_tm == 1 ) {
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
    resetState(){
        let newPhone ={
            phone_number: '',
            sms: 1,
            call_via_tm: 1
        }
        let newState = { ...this.initState };
        newState.newPhone = { ...newPhone };
        this.setState(newState )
        this.props.validatePhone('', 'new');
    }
    undoChanges() {
        this.resetState()
    }

    deleteChanges() {
        this.resetState()
    }
    componentWillUnmount(){
        this.undoChanges();
    }
    render() {
        this.initVariables();

        let phoneToCheck = '';
        let validInput = this.state.validInput

        let kosherStyle = {
            backgroundColor: this.nonActiveValueStyle.backgroundColor,
            opacity: this.nonActiveValueStyle.opacity
        };

        let errorMessageStyle = {
            color: '#e35065',
            visibility: validInput ? 'hidden' : 'visible'
        };

        if ( validInput ) {
            phoneToCheck = this.state.newPhone.phone_number.split('-').join('');

            if ( checkKosherPhone(phoneToCheck) ) {
                kosherStyle = {
                    backgroundColor: '#3bc4cb'
                };

                this.mobileStyle.cursor = 'not-allowed';
            }

            if ( isLandPhone(phoneToCheck) ) {
                this.mobileStyle.cursor = 'not-allowed';
            }
        }

        return (
            <div className="contact-info-phones__item">
                <div className="contact-info-phones__new-item-input">
                    <input type="text" placeholder={this.placeholder}
                           value={this.state.newPhone.phone_number}
                           className={validInput ? "contact-info-phones__new-item-phone-number" : "form-input-error"}
                           onChange={this.phoneNumberChange.bind(this)}/>

                    <span className="contact-info-phones__new-icon contact-info-phones__new-icon-mobile"
                          style={this.mobileStyle} onClick={this.smsChange.bind(this)}>
                        <i className="fa fa-mobile" aria-hidden="true"/>
                    </span>

                    <span className="contact-info-phones__new-icon contact-info-phones__new-icon-phone"
                          style={this.phoneStyle} onClick={this.callViaTmChange.bind(this)}>
                        <i className="fa fa-phone" aria-hidden="true"/>
                    </span>

                    <span className="contact-info-phones__new-icon-kosher" style={kosherStyle}>K</span>
                </div>

                <div style={errorMessageStyle}>{this.errorMessage}</div>

                <div className="contact-info-phones__new-item-actions">
                    <span className="contact-info-phones__new-item-action-undo"
                          style={this.state.undoOver ? this.actionMouseOverStyle : {}}
                          onMouseOver={this.mouseOverAction.bind(this, 'undoOver')}
                          onMouseOut={this.mouseOutAction.bind(this, 'undoOver')}
                          onClick={this.undoChanges.bind(this)}>
                        <i className="fa fa-undo fa-6"/>
                    </span>

                    <span className="contact-info-phones__new-item-action-delete"
                          style={this.state.deleteOver ? this.actionMouseOverStyle : {}}
                          onMouseOver={this.mouseOverAction.bind(this, 'deleteOver')}
                          onMouseOut={this.mouseOutAction.bind(this, 'deleteOver')}
                          onClick={this.deleteChanges.bind(this)}>
                        <i className="fa fa-trash fa-6"/>
                    </span>
                </div>
            </div>
        );
    }
}

export default AddNewPhone;