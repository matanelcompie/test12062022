import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux'

import Combo from '../../global/Combo';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import {dateTimeReversePrint} from '../../../libs/globalFunctions';


/**
 *  This component displays an item in
 *  the table of voter's household member
 */
class VoterHouseholdItem extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.voterStyle = {
            backgroundColor: '#33DAFF'
        };

        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };

        this.setDirtyTarget = "elections.voter.household";
    }

    showDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_SHOW_DELETE_STATUS_MODAL_DIALOG,
                             householdIndex: this.props.householdIndex, deleteHouseholdKey: this.props.item.key});
    }

    disableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_DISABLE_EDIT_ITEM_STATUS,
                             householdIndex: this.props.householdIndex,
                             oldSupportStatusId: this.props.oldItem.support_status_id0,
                             oldSupportStatusName: this.props.oldItem.support_status_name0});

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    enableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_ENABLE_EDIT_ITEM_STATUS,
                             editHouseholdKey: this.props.item.key});
    }

    editElectionSupportStatus() {
        var voterKey = this.props.voterKey;
        var householdKey = this.props.item.key;
        var supportStatusId = this.props.item.support_status_id0;
        var voterSupportStatusKey = this.props.item.voter_support_status_key0;

        // Disable Editing
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_DISABLE_EDIT_ITEM_STATUS,
                             householdIndex: this.props.householdIndex,
                             oldSupportStatusId: supportStatusId,
                             oldSupportStatusName: this.props.item.support_status_name0
        });

        VoterActions.editHouseholdStatus(this.props.dispatch, voterKey, householdKey, voterSupportStatusKey,
                                         supportStatusId);
    }

    addElectionSupportStatus() {
        var voterKey = this.props.voterKey;
        var householdKey = this.props.item.key;
        var supportStatusId = this.props.item.support_status_id0;

        // Disable editing
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_DISABLE_EDIT_ITEM_STATUS,
                             householdIndex: this.props.householdIndex,
                             oldSupportStatusId: this.props.oldItem.support_status_id0,
                             oldSupportStatusName: this.props.oldItem.support_status_name0});

        VoterActions.addHouseholdStatus(this.props.dispatch, voterKey, householdKey, supportStatusId);
    }

    saveElectionSupportStatus() {
        if (!this.validInputs) {
            return;
        }

        if ( this.props.item.voter_support_status_id0 == 0 ) {
            this.addElectionSupportStatus()
        } else {
            this.editElectionSupportStatus();
        }
    }

    /**
     * This function returns the city id
     * by the city name.
     *
     * @param cityName
     * @returns {number}
     */
    getSupportStatusId(supportStatusName) {
        let supportStatuses = this.props.supportStatuses;
        let supportStatusIndex = -1;
        let supportStatusId = 0;

        supportStatusIndex = supportStatuses.findIndex(statusItem => statusItem.name == supportStatusName);
        if ( -1 == supportStatusIndex ) {
            return 0;
        } else {
            supportStatusId = supportStatuses[supportStatusIndex].id;
            return supportStatusId;
        }
    }

    supportStatusElectionChange(e) {
        var supportStatusName = e.target.value;
        var supportStatusId = 0;

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        supportStatusId = this.getSupportStatusId(supportStatusName);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_CHANGE_ITEM_ELECTION_STATUS,
                             supportStatusId: supportStatusId, supportStatusName: supportStatusName,
                             householdIndex: this.props.householdIndex});
    }

    /**
     * This function arranges the last
     * column of edited item row in
     * the household table.
     *
     * @returns {XML}
     */
    renderLastEditedColumn() {
        return (
            <td>
                <span className="pull-left edit-buttons">
                    <button className="btn btn-success btn-xs"
                            title={this.tooltip.saveTitle}
                            onClick={this.saveElectionSupportStatus.bind(this)}
                            disabled={!this.validInputs || !this.supportHasChanged || this.props.savingChanges}>
                        <i className="fa fa-floppy-o"/>
                    </button>
                    {'\u00A0'}
                    <button className="btn btn-danger btn-xs"
                            title={this.tooltip.cancelTitle}
                            onClick={this.disableEditing.bind(this)}>
                        <i className="fa fa-times"/>
                    </button>
                </span>
            </td>
        )
    }

    /**
     * This function arranges the last
     * column of a non edited item row in
     * the household table.
     *
     * @returns {XML}
     */
    renderLastNonEditedColumn() {
        var voterSupportStatusKey = this.props.item.voter_support_status_key0;

        // If the user is permitted to edit the household menber
        // support status, then display the buttons.
        if ( this.allowEditSupportStatus ) {
            // if item key has a valid value then
            // add a delete button
            if ( voterSupportStatusKey ) {
                return(
                    <td>
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs"
                                    title={this.tooltip.editTitle}
                                    onClick={this.enableEditing.bind(this)}>
                                <i className="fa fa-pencil-square-o"/>
                            </button>
                            {'\u00A0'}
                            <button type="button" className="btn btn-danger btn-xs"
                                    title={this.tooltip.deleteTitle}
                                    onClick={this.showDeleteModalDialog.bind(this)}>
                                <i className="fa fa-trash-o"/>
                            </button>
                        </span>
                    </td>
                );
            } else {
                return(
                    <td>
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs"
                                    title={this.tooltip.editTitle}
                                    onClick={this.enableEditing.bind(this)}>
                                <i className="fa fa-pencil-square-o"/>
                            </button>
                        </span>
                    </td>
                );
            }
        } else {
            return <td>{'\u00A0'}</td>;
        }
    }

    getAge(birthDate) {
        var currentYear = new Date().getFullYear();

        if ( birthDate == "" ) {
            return '\u00A0';
        }

        let arrOfDateElement = birthDate.split('/');
        let birthYear = arrOfDateElement[2];

        var age = currentYear - birthYear;

        return age;
    }

    redirectToHouseholdVoter(e) {
        e.preventDefault();

        let householdKey = this.props.item.key;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER});

        this.props.router.push('elections/voters/' + householdKey)
    }

    /**
     * This function renders an item
     * row of households table.
     *
     * @param householdItem
     * @param supportElectionName
     * @param supportTmName
     * @returns {XML}
     */
    renderNonEditingRow(householdItem, supportElectionName, supportTmName) {
        var td_birth_date = "";
        var householdAge = "";
        var householdUrl = window.Laravel.baseURL + "elections/voters/" + householdItem.key;

        if ( householdItem.birth_date != null && householdItem.birth_date != "" ) {
            td_birth_date = dateTimeReversePrint(householdItem.birth_date, false);

            householdAge = this.getAge(td_birth_date)
        }

        return (
            <tr>
                <td>
                    <a href={householdUrl} onClick={this.redirectToHouseholdVoter.bind(this)}>
                        {householdItem.personal_identity}
                    </a>
                </td>
                <td>{householdItem.last_name}</td>
                <td>{householdItem.first_name}</td>
                <td>{householdItem.father_name}</td>
                <td>{td_birth_date}</td>
                <td>{householdAge}</td>
                <td>{supportElectionName}</td>
                <td>{supportTmName}</td>
                {this.renderLastNonEditedColumn()}
            </tr>
        )
    }

    /**
     * This function arranges an item
     * row of households table.
     *
     * @param householdItem
     * @param supportElectionName
     * @param supportTmName
     * @returns {XML}
     */
    renderEditingRow(householdItem, supportElectionName, supportTmName) {
        var td_birth_date = "";
        var householdAge = "";

        if ( householdItem.birth_date != null && householdItem.birth_date != "" ) {
            td_birth_date = dateTimeReversePrint(householdItem.birth_date, false);

            householdAge = this.getAge(td_birth_date)
        }

        return (
            <tr>
                <td>{householdItem.personal_identity}</td>
                <td>{householdItem.last_name}</td>
                <td>{householdItem.first_name}</td>
                <td>{householdItem.father_name}</td>
                <td>{td_birth_date}</td>
                <td>{householdAge}</td>
                <td width="10%">
                    <Combo items={this.props.supportStatuses} itemIdProperty="id" itemDisplayProperty='name'
                           maxDisplayItems={10} inputStyle={this.statusStyle}
                           value={this.props.item.support_status_name0}
                           className="form-combo-table"
                           onChange={this.supportStatusElectionChange.bind(this)}/>
                </td>
                <td>{supportTmName}</td>
                {this.renderLastEditedColumn()}
            </tr>
        )
    }


    renderItemRow() {
        var householdItem = this.props.item;
        var td_birth_date = "";
        var householdAge = "";

        if ( householdItem.birth_date != null && householdItem.birth_date != "" ) {
            td_birth_date = dateTimeReversePrint(householdItem.birth_date, false);

            householdAge = this.getAge(td_birth_date)
        }

        var supportElectionName = '';
        var supportTmName = '';

        let editing_mode = this.props.editing_mode;

        if ( householdItem.support_status_name0 ) {
            supportElectionName = householdItem.support_status_name0;
        } else {
            supportElectionName = 'ללא סטטוס';
        }

        if ( householdItem.support_status_name1 ) {
            supportTmName = householdItem.support_status_name1;
        } else {
            supportTmName = 'ללא סטטוס';
        }


        if ( householdItem.key == this.props.voterKey ) {
            // Different styling for a household member who is the voter,
            // and displaying data only for a household menber who is
            // a voter
            return (
                <tr style={this.voterStyle}>
                    <td>{householdItem.personal_identity}</td>
                    <td>{householdItem.last_name}</td>
                    <td>{householdItem.first_name}</td>
                    <td>{householdItem.father_name}</td>
                    <td>{td_birth_date}</td>
                    <td>{householdAge}</td>
                    <td>{supportElectionName}</td>
                    <td>{supportTmName}</td>
                    <td>{'\u00A0'}</td>
                </tr>
            )
        } else {
            // A household member who is not the current voter

            if ( editing_mode ) {
                return this.renderEditingRow(householdItem, supportElectionName, supportTmName);
            } else {
                return this.renderNonEditingRow(householdItem, supportElectionName, supportTmName);
            }
        }
    }

    /**
     * This function validates the
     * voter support status.
     *
     * @returns {boolean}
     */
    validateStatus() {
        var status = this.props.item.support_status_name0;
        var statusId = this.props.item.support_status_id0;

        if ( 0 ==  status.length || 0 == statusId) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        let supportStatusId = this.props.item.support_status_id0;
        let oldSupportStatusId = this.props.oldItem.support_status_id0;

        this.validInputs = true;

        if ( !this.validateStatus() ) {
            this.statusStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.statusStyle.borderColor = this.borderColor.valid;
        }
    }

    initVariables() {
        this.allowEditSupportStatus = false;

        this.statusStyle = {
            borderColor: this.borderColor.inValid
        };
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.household.support_status.edit'] == true) {
            this.allowEditSupportStatus = true;
        }
    }

    /*
     *  This function checks if any changes
     *  have been made in support status.
     *
     *  If no changes have been made
     *  the save button will be disabled
     */
    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.supportHasChanged = false;
        } else {
            this.supportHasChanged = true;
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        this.checkAnyChanges();

        return this.renderItemRow();
    }
}


export default connect()(withRouter(VoterHouseholdItem));