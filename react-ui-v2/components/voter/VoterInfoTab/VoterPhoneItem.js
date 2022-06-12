import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import Combo from '../../global/Combo';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import { validatePhoneNumber, checkKosherPhone } from '../../../libs/globalFunctions';


class VoterPhoneItem extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {

        this.placeholders = {
            linePhone: "מס' טלפון נייח",
            mobilePhone: "מס' טלפון נייד",
            anotherPhone: "מס' טלפון נוסף"
        };

        this.labels = {
            linePhone: 'טלפון נייח',
            mobilePhone: "טלפון נייד",
            anotherPhone: "טלפון נוסף"
        };
        
        this.tooltip={
            disableOutCall:'לחץ על מנת שלא לאפשר שיחות יוצאות',
            enableOutCall:'לחץ על מנת לאפשר שיחות יוצאות',
            disableSendSms:'לחץ על מנת שלא  לאפשר שליחת הודעות  sms',
            enableSendSms:'לחץ על מנת לאפשר שליחת הודעות sms',
            deletePhone:'מחק מספר זה',
            kosherPhone:'טלפון כשר',
            mainPhone:'טלפון עיקרי',
            selectAsMainPhone:'סמן כטלפון עיקרי',
            goodPhone: 'לחץ על מנת לסמן מספר טלפון כשגוי',
            badPhone: 'לחץ על מנת לסמן מספר טלפון כתקין'
        };
        
        this.kosherIcon = window.Laravel.baseURL + 'Images/kosher.png';

        this.noPhoneIcon = window.Laravel.baseURL + 'Images/no-phone.jpg';
        this.noSmsIcon = window.Laravel.baseURL + 'Images/no-sms.jpg';
        this.badPhoneIcon = window.Laravel.baseURL + 'Images/bad-phone.svg';

        this.setDirtyTarget = "elections.voter.additional_data.contact_details";
    }

    showWarningPhoneDeletionModal() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_SHOW_WARNING_PHONE_DELETION_MODAL,
                             deletePhoneIndex: this.props.phoneIndex, phoneNumber: this.props.item.phone_number});
    }

    phoneNumberChange(e) {
        var phoneIndex = this.props.phoneIndex;
        var phoneNumber = e.target.value;

        var data = {
            phoneIndex: phoneIndex,
            phoneNumber: phoneNumber,
            defined: true
        };

        if ( 0 == phoneNumber.length ) {
            data.defined = false;

            // If the phone is the main phone and it's not
            // valid. then no phone is the main phone
            if ( phoneIndex == this.props.main_phone_index ) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_PHONE_CHANGE,
                                     newMainPhoneIndex: -1});
            }
        } else {
            if ( !this.validatePhoneNumber(phoneNumber) ) {
                data.defined = false;

                // If the phone is the main phone and it's not
                // valid. then no phone is the main phone
                if ( phoneIndex == this.props.main_phone_index ) {
                    this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_PHONE_CHANGE,
                                         newMainPhoneIndex: -1});
                }
            } else {
                data.defined = this.validatePhoneType(this.props.item.phone_type_name, this.props.item.phone_type_id);
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_NUMBER_INPUT_CHANGE, data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    phoneMainChange() {
        var newMainPhoneIndex;

        newMainPhoneIndex = this.props.phoneIndex;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_PHONE_CHANGE,
                             newMainPhoneIndex: newMainPhoneIndex});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    phoneTmClick() {
        if (!this.allowEditPhone) return;
        var phoneIndex = this.props.phoneIndex;
        var newTM = '';

        if ( this.props.item.call_via_tm == 1 ) {
            newTM = 0;
        } else {
            newTM = 1;
        }

        var data = {
            phoneIndex: phoneIndex,
            call_via_tm: newTM
        };

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_TM_CHANGE, data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    phoneSmsClick() {
        if (!this.allowEditPhone) return;
        var phoneIndex = this.props.phoneIndex;
        var newSms = '';

        if ( this.props.item.sms == 1 ) {
            newSms = 0;
        } else {
            newSms = 1;
        }

        var data = {
            phoneIndex: phoneIndex,
            sms: newSms
        };

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_SMS_CHANGE, data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    /**
     * Change worng phone attribute
     *
     * @return void
     */
    phoneWrongClick() {
        if (!this.allowEditPhone || !this.props.item.id) return;
        var phoneIndex = this.props.phoneIndex;
        var newWrong = null;

        if ( this.props.item.wrong == 1 ) {
            newWrong = 0;
        } else {
            newWrong = 1;
        }

        var data = {
            phoneIndex: phoneIndex,
            wrong: newWrong
        };

        //reset main phone if it is set to wrong
        if (newWrong && phoneIndex == this.props.main_phone_index) {
            let newMainPhoneIndex = -1;
            for(let i=0; i<this.props.phones.length; i++) {
                if (i == phoneIndex) continue;
                let phone = this.props.phones[i];
                if (!phone.wrong) {
                    newMainPhoneIndex = i;
                    break;
                }
            }
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_PHONE_CHANGE,
                     newMainPhoneIndex: newMainPhoneIndex});
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_WRONG_CHANGE, data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    /**
     * This function checks if the phone number
     * appears more than once.
     *
     * @param phoneNumber
     * @returns {boolean}
     */
    checkIfPhoneAlreadyExists(phoneNumber) {
        var voterPhones = this.props.voterPhones;
        var currentPhoneIndex = this.props.phoneIndex;
        var phoneIndex = -1;
        var phoneToCheck = phoneNumber.split('-').join('');
        var phoneToCompare = "";
        var phoneDeleted = "";

        if ( voterPhones[currentPhoneIndex].deleted ) {
            return true;
        }

        for ( phoneIndex = 0; phoneIndex < voterPhones.length; phoneIndex++ ) {
            phoneToCompare = voterPhones[phoneIndex].phone_number.split('-').join('');
            phoneDeleted = voterPhones[phoneIndex].deleted;

            if ( !phoneDeleted && phoneIndex != currentPhoneIndex && phoneToCheck == phoneToCompare ) {
                return true;
            }
        }

        return false;
    }

    validatePhoneNumber (phoneNumber) {
        if ( 0 == phoneNumber.length ) {
            return false;
        }

        let phoneToCheck = phoneNumber.split('-').join('');

        if ( !validatePhoneNumber(phoneToCheck) ) {
            return false;
        } else {
            return !this.checkIfPhoneAlreadyExists(phoneNumber);
        }
    }

    validatePhoneType(phoneTypeName, phoneTypeId) {

        if ( 0 == phoneTypeName.length ) {
            return false;
        }

        if ( 0 == phoneTypeId ) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        var phone = this.props.item.phone_number.split('-').join('');

        if ( 0 == this.props.item.phone_number.length ) {
            this.isKosherPhone = false;
            this.phoneNumberClass = "col-sm-3 col-xs-12 has-error";
        } else {
            if ( !this.validatePhoneNumber(this.props.item.phone_number) ) {
                this.isKosherPhone = false;
                this.phoneNumberClass = "col-sm-3 col-xs-12 has-error";
            } else {
                // Checking kosher phone
                this.phoneNumberClass = "col-sm-3 col-xs-12";
                this.isKosherPhone = checkKosherPhone(phone);
            }
        }

        if ( !this.validatePhoneType(this.props.item.phone_type_name, this.props.item.phone_type_id) ) {
            this.phoneTypeClass = "col-sm-2 col-xs-12 has-error";
        } else {
            this.phoneTypeClass = "col-sm-2 col-xs-12";
        }

        if ( this.isKosherPhone ) {
            this.kosherContent = <img src={this.kosherIcon} title={this.tooltip.kosherPhone}/>;
        } else {
            this.kosherContent = '\u00A0';
        }
    }

    getPhoneTypeId(phoneTypeName) {
        let phoneTypesList = this.props.phoneTypes;
        let phoneTypeIndex = -1;
        let phoneTypeId = 0;

        phoneTypeIndex = phoneTypesList.findIndex(phoneTypeItem => phoneTypeItem.name == phoneTypeName);
        if ( -1 == phoneTypeIndex ) {
            return 0;
        } else {
            phoneTypeId = phoneTypesList[phoneTypeIndex].id;
            return phoneTypeId;
        }
    }

    phoneTypeChange(e) {
        var phoneTypeName = e.target.value;
        var phoneTypeId = 0;
        var defined;

        phoneTypeId = this.getPhoneTypeId(phoneTypeName);
        if ( !this.validatePhoneType(phoneTypeName, phoneTypeId)  ) {
            defined = false;
        } else {
            defined = this.validatePhoneNumber(this.props.item.phone_number);
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_TYPE_CHANGE,
                             phoneIndex: this.props.phoneIndex,
                             phoneTypeId: phoneTypeId,
                             phoneTypeName: phoneTypeName,
                             defined: defined});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    initVariables() {
        this.phoneNumberClass = "col-sm-4";
        this.phoneTypeClass = "col-sm-2";
        this.htmlFor = "inputPhoneNo" + this.props.phoneIndex;

        this.allowEditPhone = false;
        this.allowDeletePhone = false;
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.allowEditPhone = true;
            this.allowDeletePhone = true;

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.contact_details.phone.edit'] == true) {
            this.allowEditPhone = true;
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.contact_details.phone.delete'] == true &&
            this.allowEditPhone ) {
            this.allowDeletePhone = true;
        }
    }

    renderCallViaTm() {
        let iconClass = (this.allowEditPhone)? "cursor-pointer" : "not-allowed";
        if ( this.props.item.call_via_tm == 1 ) {
            return (
                <button type="button" className="btn btn-success btn-xs" title={this.tooltip.disableOutCall}
                        onClick={this.phoneTmClick.bind(this)} disabled={!this.allowEditPhone}>
                    <i className="fa fa-phone fa-1"></i>
                </button>
            );
        } else {
            return (
                <a className={iconClass} onClick={this.phoneTmClick.bind(this)} title={this.tooltip.enableOutCall}>
                    <img src={this.noPhoneIcon}/>
                </a>
            );
        }
    }

    renderSendSms() {
        let iconClass = (this.allowEditPhone)? "cursor-pointer" : "not-allowed";
        if ( this.props.item.sms == 1 ) {
            return (
                <button type="button" className="btn btn-success btn-xs" title={this.tooltip.disableSendSms}
                        onClick={this.phoneSmsClick.bind(this)} disabled={!this.allowEditPhone}>
                    <i className="fa fa-mobile fa-1"></i>
                </button>
            );
        } else {
            return (
                <a className={iconClass} onClick={this.phoneSmsClick.bind(this)} title={this.tooltip.enableSendSms}>
                    <img src={this.noSmsIcon}/>
                </a>
            );
        }
    }

    /**
     * Render wrong phone icon
     *
     * @return JSX
     */
    renderWrongPhone() {
        let iconClass = (this.allowEditPhone && this.props.item.id)? "cursor-pointer" : "not-allowed";
        if (this.props.item.wrong) {
            return (
                <a className={iconClass} onClick={this.phoneWrongClick.bind(this)} title={this.tooltip.badPhone}>
                    <img src={this.badPhoneIcon}></img>
                </a>
            )
        } else {
            return (
                <a className={iconClass} onClick={this.phoneWrongClick.bind(this)} title={this.tooltip.goodPhone}>
                    <img src={this.badPhoneIcon} style={{opacity: "0.4"}}></img> 
                </a>
            )           
        }
    }

    /**
     * This function checks if the current user is
     * permitted to delete a phone, and prints the
     * delete icon if he is permitted.
     *
     * @returns {*}
     */
    renderDeletePhone() {
        if (this.allowDeletePhone) {
            return (
                <span className="glyphicon glyphicon-erase" title={this.tooltip.deletePhone}
                      onClick={this.showWarningPhoneDeletionModal.bind(this)}
                      aria-hidden="true">
                </span>
            );
        } else {
            return '\u00A0';
        }

    }

    /**
     * This function checks if the user is permitted
     * to edit phones.
     * If he is, then it prints a combo for changing
     * the phone type, else it prints the phone type name.
     *
     * @returns {*}
     */
    renderPhoneType() {
        if ( this.allowEditPhone ) {
            return (
                <Combo id={this.htmlFor} items={this.props.phoneTypes}
                       itemIdProperty="id" itemDisplayProperty='name'
                       maxDisplayItems={10}
                       value={this.props.item.phone_type_name}
                       onChange={this.phoneTypeChange.bind(this)}/>
            );
        } else {
            return this.props.item.phone_type_name;
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        return (
            <div className="row radio phoneDtls">
                <div className="col-sm-1 col-xs-1">{'\u00A0'}</div>

                <div className="col-sm-1 col-xs-1">
                    <input type="radio" name="optionsRadios" id="optionsRadios1"
                           checked={this.props.phoneIndex == this.props.main_phone_index}
                           title={(this.props.phoneIndex == this.props.main_phone_index)?this.tooltip.mainPhone:this.tooltip.selectAsMainPhone}
                           value="1" disabled={!this.allowEditPhone || this.props.item.wrong}
                           onChange={this.phoneMainChange.bind(this)}
                    />
                </div>

                <div className={this.phoneTypeClass} style={{marginBottom:'10px'}}>
                    {this.renderPhoneType()}
                </div>

                <div className={this.phoneNumberClass} style={{marginBottom:'10px'}}>
                    <input type="text" className="form-control" 
                           value={this.props.item.phone_number}
                           onChange={this.phoneNumberChange.bind(this)}
                           readOnly={!this.allowEditPhone}
                    />
                </div>


                <div className="col-sm-1 col-xs-2">{this.kosherContent}</div>

                <div className="col-sm-1 col-xs-2">{this.renderCallViaTm()}</div>

                <div className="col-sm-1 col-xs-2">{this.renderSendSms()}</div>

                <div className="col-sm-1 col-xs-2">{this.renderWrongPhone()}</div>

                <div className="col-sm-1 col-xs-2">
                    {this.renderDeletePhone()}
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        phoneTypes: state.system.phoneTypes,
        phones: state.voters.voterDetails.phones,
        main_phone_index: state.voters.voterDetails.main_phone_index,
        main_voter_phone_id: state.voters.voterDetails.main_voter_phone_id,
        voterPhones: state.voters.voterDetails.phones,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterPhoneItem));