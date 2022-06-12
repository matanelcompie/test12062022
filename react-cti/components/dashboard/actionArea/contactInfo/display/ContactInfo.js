import React from 'react';
import { connect } from 'react-redux';

import { isLandPhone, isMobilePhone, getCtiPermission, getCtiPermissionValue } from '../../../../../libs/globalFunctions';

import ModalWindow from '../../../../common/ModalWindow';
import PhoneItem from './PhoneItem';
import AddNewPhone from './AddNewPhone';
import ContactEmail from './ContactEmail';

import * as callActions from '../../../../../actions/callActions';
import * as uiActions from '../../../../../actions/uiActions';


class ContactInfo extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
        this.state = {
            notValidContactInfoHash: {},
            newPhonesIndex: 0
        }
    }

    initConstants() {
        this.contactinfoTitle = 'עדכון פרטי קשר לתושב';

        this.subTitles = {
            phones: 'מספרי טלפון'
        };

        this.modalBody = 'האם אתה בטוח ?';

        this.phoneTypes = require('../../../../../libs/constants').phoneTypes;
    }

    validatePhone(phoneNumber, phoneIndex) {
	 
        let isPhoneValid = true;
 
        if(phoneNumber != null){
            if ( phoneNumber.length == 0) {
                isPhoneValid = phoneIndex == 'new' ? true : false;
            } else {
                let phoneToCheck = phoneNumber.split('-').join('');
                isPhoneValid = (isLandPhone(phoneToCheck) || isMobilePhone(phoneToCheck));
            }
        }
 
        this.updateContactInfoValidation(isPhoneValid, 'phone_' + phoneIndex);
        return isPhoneValid;
    }
    updateEmailValidStatus(isEmailValid){
        this.updateContactInfoValidation(isEmailValid, 'email')
    }
    updateContactInfoValidation(isItemValid, itemName){
        let notValidContactInfoHash = { ...this.state.notValidContactInfoHash };
        let currenPhoneItem = notValidContactInfoHash[itemName];

        if (isItemValid && currenPhoneItem) {
            delete notValidContactInfoHash[itemName]; //Delete key if is valid
        }
        if(!isItemValid && !currenPhoneItem){
            notValidContactInfoHash[itemName] = true;
        }
        this.setState({ notValidContactInfoHash });
        let isFormNotValid = Object.keys(notValidContactInfoHash).length > 0 ? false : true;
        uiActions.setActionAreaValidationStatus(this.props.dispatch, 'ContactInfo', isFormNotValid);
    }
    addNewPhone(phoneObj) {
        if (isLandPhone(phoneObj.phone_number.split('-').join(''))) {
            phoneObj.phone_type_Id = this.phoneTypes.home;
        } else if (isMobilePhone(phoneObj.phone_number.split('-').join(''))) {
            phoneObj.phone_type_Id = this.phoneTypes.mobile;
        }

        callActions.addPhoneToVoter(this.props.dispatch, phoneObj);
    }

    deletePhone() {
        callActions.deleteVoterPhone(this.props.dispatch, this.props.deletePhoneIndex);

        uiActions.hideDeletePhoneModal(this.props.dispatch);
    }

    hideDeleteModal() {
        uiActions.hideDeletePhoneModal(this.props.dispatch);
    }

    renderPhones(editContactsPermission, canDelete) {
        let that = this;

        let phones = this.props.phones.map(function (phoneItem, index) {
            if (!phoneItem.deleted) {
                return <PhoneItem key={index} phoneIndex={index} item={phoneItem}
                    canDelete={canDelete} canEdit={editContactsPermission}
                    validatePhone={that.validatePhone.bind(that)}  />
            }
        });
        return (
            <div className="contact-info-phones__items">
                {phones}
                {editContactsPermission ? <AddNewPhone
                    addNewPhone={this.addNewPhone.bind(this)}
                    validatePhone={this.validatePhone.bind(this)} />
                    : ''}
            </div>
        );
    }

    render() {
        let editContactsPermission = getCtiPermission(this.props.permissions, 'user_contacts', true);
        let editContactsPermissionValue = getCtiPermissionValue(this.props.permissions, 'user_contacts');
        let canDelete = (editContactsPermissionValue == 2) ;
        return (
            <div className="contact-info">
                <div className="action-content contact-info-phones-list">
                    <div className="action-content__header">
                        <span className="action-content__title">{this.contactinfoTitle}</span>
                    </div>

                    <div className="contact-info-phones">
                        <div className="contact-info-phones__sub-title">{this.subTitles.phones}</div>

                        {this.renderPhones(editContactsPermission, canDelete)}
                    </div>
                </div>

                <ContactEmail canEdit={editContactsPermission}
                    updateEmailValidStatus={this.updateEmailValidStatus.bind(this)} />

                <ModalWindow show={this.props.showDeletePhoneModal}
                    buttonOk={this.deletePhone.bind(this)}
                    buttonCancel={this.hideDeleteModal.bind(this)}
                    title={this.props.deletePhoneModalHeader}
                    style={{ zIndex: '9001' }}>
                    <div>{this.modalBody}</div>
                </ModalWindow>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        permissions: state.campaign.permissions,
        phones: state.call.activeCall.voter.phones,
        showDeletePhoneModal: state.ui.showDeletePhoneModal,
        deletePhoneModalHeader: state.ui.deletePhoneModalHeader,
        deletePhoneIndex: state.ui.deletePhoneIndex,
    }
}

export default connect(mapStateToProps)(ContactInfo);