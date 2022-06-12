import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterPhoneItem from './VoterPhoneItem';

import { validateEmail } from '../../../libs/globalFunctions';
import ModalWindow from '../../global/ModalWindow';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterContact extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {

        this.placeholders = {
            linePhone: "מס' טלפון נייח",
            mobilePhone: "מס' טלפון נייד",
            anotherPhone: "מס' טלפון נוסף",
            email: 'דוא"ל'
        };

        this.labels = {
            linePhone: 'טלפון נייח',
            mobilePhone: "טלפון נייד",
            anotherPhone: "טלפון נוסף",
            email: 'דוא"ל'
        };
        
        this.tooltip = {
            undoChanges:'לבטל שינויים'
        };

        this.addPhoneText = "הוסף טלפון";
        this.enableEmailText = 'אפשר לשלוח דוא"ל';
        this.saveButtonText = "שמירה";

        this.addNewPhoneStyle = {
            cursor: 'pointer'
        };

        this.modalWarningText = "בחירה של טלפון תגרום למחיקתו מפרטי התושב הרשום מטה";
        this.modalWarningStyle = {
            color: '#cc0000',
            fontWeight: 'bold'
        };
        this.modalWarningMultiplePhoneContainerStyle = {
            maxHeight: "500px",
            overflowY: "scroll"
        };

        this.warningPhoneDeletionModalContent = "האם אתה בטוח/ה ?";

        this.undoButtonStyle = {
            marginLeft: "10px"
        };

        this.setDirtyTarget = "elections.voter.additional_data.contact_details";
    }

    /**
     *  This function restores the values of
     *  contact details before the changes
     */
    undoContactChanges() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_CONTACT_UNDO_CHANGES});

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    /**
     *  This function sends the voter's phones
     *  and the delete list of phones that are common to
     *  other voters.
     */
    savePhonesAndModalPhones() {
        let voterData = [];
        let voterPhonesData = [];
        let voterKey = this.props.router.params.voterKey;
        let phonesToDelete = [];

        voterData = this.buildVoterDataToServer();

        voterPhonesData = this.buildVoterPhonesToServer();
		
        for ( let phoneIndex = 0; phoneIndex < this.props.votersWithSamePhones.length; phoneIndex++ ) {
            if ( this.props.votersWithSamePhones[phoneIndex]['toDelete'] ) {
                phonesToDelete.push(this.props.votersWithSamePhones[phoneIndex]['key']);
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_HIDE_ERROR_MODAL});

        VoterActions.saveVoterContact(this.props.dispatch, voterKey, voterData, voterPhonesData, true, phonesToDelete);
    }

    updateAllModalPhones(deleteAll) {
        var deleteAll = !this.props.deleteAllPhonesModal;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_UPDATE_DELETE_ALL,
                             deleteAllPhones: deleteAll});

        for ( let phoneIndex = 0; phoneIndex < this.props.votersWithSamePhones.length; phoneIndex++ ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_CHECK_UPDATE_PHONE_TO_DELETE,
                                 phoneIndex: phoneIndex,
                                 toDelete: deleteAll});
        }
    }

    getDeleteAllCheckbox(voterPhoneIndex) {
        for ( let phoneIndex = 0; phoneIndex < this.props.votersWithSamePhones.length; phoneIndex++ ) {
            if ( phoneIndex == voterPhoneIndex ) {
                if ( this.props.votersWithSamePhones[phoneIndex].toDelete ) {
                    return false;
                }
            } else {
                if ( !this.props.votersWithSamePhones[phoneIndex].toDelete ) {
                    return false;
                }
            }
        }

        return true;
    }

    updateModalPhoneToDelete(voterPhoneIndex) {
        var toDelete = !this.props.votersWithSamePhones[voterPhoneIndex].toDelete;

        if ( !toDelete ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_UPDATE_DELETE_ALL,
                                 deleteAllPhones: false});
        } else {
            if ( this.getDeleteAllCheckbox(voterPhoneIndex) ) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_UPDATE_DELETE_ALL,
                                     deleteAllPhones: true});
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_CHECK_UPDATE_PHONE_TO_DELETE,
                             phoneIndex: voterPhoneIndex, toDelete: toDelete});
    }

    renderVotersWithSamePhonesModal() {
        var modalContent = '';
        var modalRows = '';
        var that = this;

        if ( !this.props.showVoterCommonPhonesModal ) {
            this.modalContent = '\u00A0';
            return;
        }

        modalRows = this.props.votersWithSamePhones.map(function (voterPhoneItem, index) {
            return (
                <tr key={index}>
                    <td>{voterPhoneItem.first_name + ' ' + voterPhoneItem.last_name}</td>
                    <td>{voterPhoneItem.phone_number}</td>
                    <td>
                        <input type="checkbox" value="1"
                               onChange={that.updateModalPhoneToDelete.bind(that, index)}
                               checked={voterPhoneItem.toDelete}/>
                    </td>
                </tr>
            );
        });

        this.modalContent =
            <div>
                <div style={this.modalWarningStyle}>{this.modalWarningText}</div>
                <div style={this.modalWarningMultiplePhoneContainerStyle}>
                <table className="table table-bordered table-striped">
                    <thead style={{backgroundColor: '#eeeeee'}}>
                    <tr>
                        <th>שם</th>
                        <th>טלפון</th>
                        <th><input type="checkbox" value="1"
                                   onChange={this.updateAllModalPhones.bind(this)}
                                   checked={this.props.deleteAllPhonesModal}/></th>
                    </tr>
                    </thead>

                    <tbody>
                    {modalRows}
                    </tbody>
                </table>
                </div>
            </div>
    }

    /**
     * This function deletes a phone
     * from the state.
     *
     * Note: This is not a deletion from
     *       database. To delete the phone permanently you have
     *       click save for saving the changes.
     */
    deletePhoneFromState() {
        var deletePhoneIndex = this.props.deletePhoneIndex;

        // If the phone is the main phone and it's being
        // deleted, then no phone is the main phone.
        if ( deletePhoneIndex == this.props.main_phone_index  ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_PHONE_CHANGE,
                                 newMainPhoneIndex: -1});
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_DELETE_PHONE,
                             phoneIndex: deletePhoneIndex});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_HIDE_WARNING_PHONE_DELETION_MODAL});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    hideWarningPhoneDeletionModal() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_HIDE_WARNING_PHONE_DELETION_MODAL});
    }

    hidePhonesModal() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_HIDE_ERROR_MODAL});
    }

    addPhone() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PHONE_ADD_NEW_PHONE});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    buildVoterDataToServer() {
        let email = this.props.voterDetails.email;
        let contactViaEmail = "";
        let voterData = [];

        if ( this.props.voterDetails.email == "" ) {
            email = null;
        }

        if ( email == null ) {
            contactViaEmail = 0;
        } else {
            contactViaEmail = this.props.voterDetails.contact_via_email;
        }

        voterData = {email: email, contact_via_email: contactViaEmail,
                     main_voter_phone_id: this.props.voterDetails.main_voter_phone_id};

        return voterData;
    }

    buildVoterPhonesToServer() {
        let phoneIndex = 0;
        let voterPhones = this.props.voterPhones;
        let mainPhone = null;
        let voterPhonesData = [];

        for ( phoneIndex = 0; phoneIndex < voterPhones.length; phoneIndex++) {
            if ( !voterPhones[phoneIndex].deleted ) {
                if ( phoneIndex == this.props.voterDetails.main_phone_index ) {
                    mainPhone = true;
                } else {
                    mainPhone = false;
                }

                voterPhonesData.push(
                    {
                        id: voterPhones[phoneIndex].id,
                        key: voterPhones[phoneIndex].key,
                        phone_number: voterPhones[phoneIndex].phone_number.split('-').join(''),
                        call_via_tm: voterPhones[phoneIndex].call_via_tm,
                        sms: voterPhones[phoneIndex].sms,
                        phone_type_id: voterPhones[phoneIndex].phone_type_id,
                        main_phone: mainPhone,
                        wrong: voterPhones[phoneIndex].wrong
                    }
                );
            }
        }

        return voterPhonesData;
    }

    saveContact(e) {
        // Prevent page refresh
        e.preventDefault();

        if ( !this.validInputs ) {
            return;
        }

        let voterData = [];
        let voterPhonesData = [];
        let voterKey = this.props.router.params.voterKey;

        voterData = this.buildVoterDataToServer();

        voterPhonesData = this.buildVoterPhonesToServer();

        VoterActions.saveVoterContact(this.props.dispatch, voterKey, voterData, voterPhonesData, false, []);
    }

    contactEmailChange() {
        var contact_via_email = '';

        if ( this.props.voterDetails.contact_via_email == 1) {
            contact_via_email = 0;
        } else {
            contact_via_email = 1;
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_CONTACT_EMAIL_CHANGE,
                             contact_via_email: contact_via_email});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    validateEmail() {
        if ( 0 == this.props.voterDetails.email.length ) {
            return true;
        }

        return validateEmail(this.props.voterDetails.email);
    }

    emailChange(e) {
        var email = e.target.value;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_EMAIL_INPUT_CAHNGE, email: email});

        if ( 0 == email.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_CONTACT_EMAIL_CHANGE,
                                 contact_via_email: 0});
        } else if ( validateEmail(email) ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_CONTACT_EMAIL_CHANGE,
                                 contact_via_email: 1});
        }

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    validatePhones() {
        var voterPhones = this.props.voterPhones;
        var phoneIndex = 0;

        for (phoneIndex = 0; phoneIndex < voterPhones.length; phoneIndex++) {
            if ( !voterPhones[phoneIndex].deleted && !voterPhones[phoneIndex].defined ) {
                return false;
            }
        }

        return true
    }

    validateVariables() {
        this.validInputs = true;

        if ( this.validateEmail() ) {
            this.emailDivClass = "form-group";
            this.emailErrorText = "";
        } else {
            this.validInputs = false;
            this.emailDivClass = "form-group has-error";
            this.emailErrorText = 'דוא"ל לא תקני';
        }

        if ( !this.validatePhones() ) {
            this.validInputs = false;
        }
    }

    initVariables() {
        this.emailDivClass = "form-group";

        this.allowEmailEdit = false;
        this.allowAddPohone = false;
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.allowEmailEdit = true;
            this.allowAddPohone = true;
            return;
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.contact_details.email.edit'] == true) {
            this.allowEmailEdit = true;
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data.contact_details.phone.add'] == true &&
            this.props.currentUser.permissions['elections.voter.additional_data.contact_details.phone.edit'] == true) {
            this.allowAddPohone = true;
        }
    }

    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.contactHasChanged = false;
        } else {
            this.contactHasChanged = true;
        }
    }

    renderPhones() {
        if ( !this.props.currentUser.admin &&
             this.props.currentUser.permissions['elections.voter.additional_data.contact_details.phone'] != true) {
            return '\u00A0';
        }

        this.phonesRows = this.props.voterPhones.map(function (phoneItem, index) {
            if ( !phoneItem.deleted ) {
                return <VoterPhoneItem key={index} phoneIndex={index} item={phoneItem}/>
            }
        });

        return this.phonesRows;
    }

    /**
     * This function renders the
     * Add phone button.
     *
     * @returns {XML}
     */
    renderAddPhone() {
        // If the current user is permitted to add phone,
        // then print the add phone button.
        if (this.allowAddPohone) {
            return(
                <div className="addPhoneNo">
                    <a title={this.addPhoneText} style={this.addNewPhoneStyle}
                       onClick={this.addPhone.bind(this)}>
                        <span className="glyphicon glyphicon-earphone" aria-hidden="true"/>
                        {this.addPhoneText}
                    </a>
                </div>
            );
        }
    }

    renderEmailSection() {
        var email_max_length = require('../../../libs/constants').email_max_length;

        if ( !this.props.currentUser.admin &&
             this.props.currentUser.permissions['elections.voter.additional_data.contact_details.email'] != true ) {
            return '\u00A0';
        }

        if ( this.allowEmailEdit ) {
            return (
                <div className={this.emailDivClass}>
                    <label htmlFor="inputEmail" className="col-sm-2 control-label">
                        {this.labels.email}
                    </label>
                    <div className="col-sm-6">
                        <input type="text" className="form-control" id="inputEmail"
                               placeholder={this.placeholders.email}
                               onChange={this.emailChange.bind(this)}
                               maxLength={email_max_length} value={this.props.voterDetails.email}
                        />

                        <span className="help-block">
                            {this.emailErrorText}
                        </span>
                    </div>
                    <div className="checkbox col-sm-4 styleCheckbox">
                        <label>
                            <input type="checkbox" value="1"
                                   onChange={this.contactEmailChange.bind(this)}
                                   checked={this.props.voterDetails.contact_via_email}/>
                            {this.enableEmailText}
                        </label>
                    </div>
                </div>
            );
        } else {
            return(
                <div className={this.emailDivClass}>
                    <label htmlFor="inputEmail" className="col-sm-2 control-label">
                        {this.labels.email}
                    </label>
                    <div className="col-sm-6" style={{paddingTop: "7px"}}>{this.props.voterDetails.email}</div>
                    <div className="checkbox col-sm-4">{'\u00A0'}</div>
                </div>
            );
        }
    }

    renderSaveButton() {
        var displayButton = false;
        var undoClassButton = "";

        if ( this.props.currentUser.admin ) {
            displayButton = true;
        } else {
            if ( this.props.currentUser.permissions['elections.voter.additional_data.contact_details.phone.edit'] == true ||
                this.props.currentUser.permissions['elections.voter.additional_data.contact_details.email.edit'] == true
               ) {
                displayButton = true;
            }
        }

        if ( displayButton ) {
            // Checking if any phone has changed
            // in order to decide whether to
            // display the undo changes button.
            if ( !this.contactHasChanged ) {
                undoClassButton = "btn btn-danger pull-left hidden";
            } else {
                undoClassButton = "btn btn-danger pull-left";
            }

            return (
                <div className="col-lg-12">
                    <div className="form-group">
                        <div className="">
                            <button type="submit" className="btn btn-primary saveChanges"
                                    onClick={this.saveContact.bind(this)}
                                    disabled={!this.validInputs || !this.contactHasChanged || this.props.savingChanges}>
                                {this.saveButtonText}
                            </button>
                            <button className={undoClassButton}
                                    style={this.undoButtonStyle}
                                    title={this.tooltip.undoChanges}
                                    onClick={this.undoContactChanges.bind(this)}
                                    disabled={this.props.savingChanges}>
                                <i className="fa fa-undo fa-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    render() {

	
	
        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        this.checkAnyChanges();

        this.renderVotersWithSamePhonesModal();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.infoContact}>
                <div className="row CollapseContent">
                    <div className="col-lg-6">
                        {this.renderPhones()}

                        {this.renderAddPhone()}
                    </div>

                    <div className="col-lg-6">
                        <div className="form-horizontal">
                            {this.renderEmailSection()}
                        </div>
                    </div>
                    
                    {this.renderSaveButton()}

                    <ModalWindow show={this.props.showVoterCommonPhonesModal}
                                 buttonOk={this.savePhonesAndModalPhones.bind(this)}
                                 buttonCancel={this.hidePhonesModal.bind(this)}
                                 title={this.props.voterCommonPhonesModalHeader}
                                 style={{zIndex: '9001'}}>
                        <div>{this.modalContent}</div>
                    </ModalWindow>

                    <ModalWindow show={this.props.showWarningPhoneDeletionModal}
                                 buttonOk={this.deletePhoneFromState.bind(this)}
                                 buttonCancel={this.hideWarningPhoneDeletionModal.bind(this)}
                                 title={this.props.warningPhoneDeletionModalHeader}
                                 style={{zIndex: '9001'}}>
                        <div>{this.warningPhoneDeletionModalContent}</div>
                    </ModalWindow>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        voterDetails: state.voters.voterDetails,
        oldVoterDetails: state.voters.oldVoterDetails,
        voterPhones: state.voters.voterDetails.phones,
        oldVoterPhones: state.voters.oldVoterDetails.phones,
        showVoterCommonPhonesModal: state.voters.voterScreen.showVoterCommonPhonesModal,
        voterCommonPhonesModalHeader: state.voters.voterScreen.voterCommonPhonesModalHeader,
        voterCommonPhonesModalContent: state.voters.voterScreen.voterCommonPhonesModalContent,
        votersWithSamePhones: state.voters.voterScreen.votersWithSamePhones,
        deleteAllPhonesModal: state.voters.voterScreen.deleteAllPhonesModal,
        showWarningPhoneDeletionModal: state.voters.voterScreen.showWarningPhoneDeletionModal,
        warningPhoneDeletionModalHeader: state.voters.voterScreen.warningPhoneDeletionModalHeader,
        deletePhoneIndex: state.voters.voterScreen.deletePhoneIndex,
        main_phone_index: state.voters.voterDetails.main_phone_index,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterContact));