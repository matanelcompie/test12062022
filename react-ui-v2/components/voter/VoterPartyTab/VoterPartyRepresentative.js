import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import VoterPartyRepresentativeItem from './VoterPartyRepresentativeItem';

import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
import {parseDateToPicker, parseDateFromPicker} from '../../../libs/globalFunctions';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterPartyRepresentative extends React.Component {

    constructor(props) {
        super(props);

        momentLocalizer(moment);

        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.newRepButtonText = "תפקיד חדש";
        this.checkboxLabelShasRepresentative = 'נציג ש"ס';
        this.saveButtonText = "שמירה";

        this.mainBtnStyle = {marginBottom:10};

        this.setDirtyTarget = "elections.voter.political_party.shas_representative";
    }

    deleteRepresentativeFromState() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_REPRESENTATIVE_FROM_STATE});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_HIDE_MODAL_DIALOG});
    }

    hideDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_HIDE_MODAL_DIALOG});
    }

    addNewRepresentativeToState() {
        if ( !this.validInputs ) {
            return;
        }

        let data = {
            id: null,
            key: null,
            city_id: this.props.newRepresentativeDetails.city_id,
            city_name: this.props.newRepresentativeDetails.city,
            role_id: this.props.newRepresentativeDetails.role_id,
            role_name: this.props.newRepresentativeDetails.role,
            start_date: this.props.newRepresentativeDetails.start_date,
            end_date: this.props.newRepresentativeDetails.end_date
        };

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ADD_REPRESENTATIVE_TO_STATE,
                             data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_HIDE_NEW_ROW});
    }

    shasRepresentativeChange() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SHAS_REPRESENTATIVE_CHANGE});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    endDateChange(value, format, filter) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_END_DATE_INPUT_CHANGE,
            end_date: value, representativeIndex: this.props.representativeItemIndex});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    startDateChange(value, format, filter) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_START_DATE_INPUT_CHANGE,
            start_date: value, representativeIndex: this.props.representativeItemIndex});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    /**
     * This function returns the role id
     * by the role name.
     *
     * @param roleName
     * @returns {number}
     */
    getRoleId(roleName) {
        let roleList = this.props.representativeRoles;
        let roleIndex = -1;
        let roleId = 0;

        roleIndex = roleList.findIndex(roleItem => roleItem.name == roleName);
        if ( -1 == roleIndex ) {
            return 0;
        } else {
            roleId = roleList[roleIndex].id;
            return roleId;
        }
    }

    /*
     *   This function triggered by event of
     *   a change in the role field
     *
     *   @params e - event object
     */
    roleChange(e) {
        var newRole = e.target.value;
        var roleId = 0;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ROLE_INPUT_CHANGE,
                             role: newRole});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == newRole.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ROLE_ID_INPUT_CHANGE,
                role_id: 0});

            return;
        }

        roleId = this.getRoleId(newRole);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ROLE_ID_INPUT_CHANGE,
            role_id: roleId});
    }

    /**
     * This function returns the city id
     * by the city name.
     *
     * @param cityName
     * @returns {number}
     */
    getCityId(cityName) {
        let cityList = this.props.cities;
        let cityIndex = -1;
        let cityId = 0;

        cityIndex = cityList.findIndex(cityItem => cityItem.name == cityName);
        if ( -1 == cityIndex ) {
            return 0;
        } else {
            cityId = cityList[cityIndex].id;
            return cityId;
        }
    }

    /*
     *   This function triggered by event of
     *   a change in the city field
     *
     *   @params e - event object
     */
    cityChange(e) {
        var newCity = e.target.value;
        var cityId = 0;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_CITY_INPUT_CHANGE,
                             city: newCity});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == newCity.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_CITY_ID_INPUT_CHANGE,
                                 city_id: 0});

            return;
        }

        cityId = this.getCityId(newCity);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_CITY_ID_INPUT_CHANGE,
                             city_id: cityId});
    }

    /*
     *  This function is triggerd by an
     *  event for hiding a row for adding
     *  representative to a voter.
     */
    hideNewRepresentativeRow() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_HIDE_NEW_ROW});
    }

    /*
     *  This function is triggerd by an
     *  event for showing a row for adding
     *  representative to a voter.
     */
    showNewRepresentativeRow() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_SHOW_NEW_ROW});
    }

    /**
     *  This function returns the last
     *  row.
     *  If the boolean showNewRepresentativeRow is true
     *  then it returns a row of input types
     *  else it return a row with the + sign
     *
     * @returns {XML}
     */
    renderLastRow() {
        if ( this.props.showNewRepresentativeRow ) {
            return (<tr>
                    <td>
                        <Combo items={this.props.cities} itemIdProperty="id" itemDisplayProperty='name'
                               maxDisplayItems={10}
                               inputStyle={this.cityStyle} value={this.props.newRepresentativeDetails.city}
                               className="form-combo-table"
                               onChange={this.cityChange.bind(this)}/>
                    </td>
                    <td>
                        <Combo items={this.props.representativeRoles} itemIdProperty="id"
                               itemDisplayProperty='name'
                               maxDisplayItems={10} inputStyle={this.roleStyle}
                               value={this.props.newRepresentativeDetails.role}
                               className="form-combo-table"
                               onChange={this.roleChange.bind(this)}/>
                    </td>
                    <td>
                        <ReactWidgets.DateTimePicker
                            isRtl={true} time={false}
                            value={parseDateToPicker(this.props.newRepresentativeDetails.start_date)}
                            onChange={parseDateFromPicker.bind(this, {callback: this.startDateChange,
                                                              format: "YYYY-MM-DD",
                                                              functionParams: 'dateTime'})
                                     }
                            format="DD/MM/YYYY"
                            style={this.startDateStyle}
                        />
                    </td>
                    <td>
                        <ReactWidgets.DateTimePicker
                            isRtl={true} time={false}
                            value={parseDateToPicker(this.props.newRepresentativeDetails.end_date)}
                            onChange={parseDateFromPicker.bind(this, {callback: this.endDateChange,
                                                              format: "YYYY-MM-DD",
                                                              functionParams: 'dateTime'})
                                     }
                            format="DD/MM/YYYY"
                            style={this.endDateStyle}
                        />
                    </td>
                    <td>
                        <span className="pull-left edit-buttons">
                            <button className="btn btn-success btn-xs"
                                    onClick={this.addNewRepresentativeToState.bind(this)}
                                    disabled={this.saveButtonDisabled}>
                                <i className="fa fa-floppy-o"/>
                            </button>
                            {'\u00A0'}
                            <button className="btn btn-danger btn-xs"
                                    onClick={this.hideNewRepresentativeRow.bind(this)}>
                                <i className="fa fa-times"/>
                            </button>
                        </span>
                    </td>
                </tr>
            )
        }
    }

    renderRepresentativeData() {
        var editingRepresentativeKey = this.props.editingRepresentativeKey;
        var showNewRepresentativeRow = this.props.showNewRepresentativeRow;

        var editingMode = false;
        var enableEditing = false;

        this.representativeRows = this.props.representativesList.map(function (representativeItem, index) {
            // Checking if the representative item is to
            // be edited by comparing the current
            // representative item's key to editing representative key
            // which specifies the representative item's
            // key to be edited
            if ( representativeItem.key == editingRepresentativeKey ) {
                editingMode = true;
            } else { // representative item is not to be deleted
                editingMode = false;

                if ( editingRepresentativeKey ) {
                    // If another representative item is
                    // being edited, then
                    // disable the editing
                    // of the current representative item
                    enableEditing = false;
                } else {
                    // No representative item is to be edited,
                    // then enable editing the current
                    // representative item
                    enableEditing = true;
                }
            }

            if ( showNewRepresentativeRow ) {
                enableEditing = false;
            }

            return <VoterPartyRepresentativeItem key={representativeItem.id}
                                                 representativeItemIndex={index}
                                                 item={representativeItem}
                                                 editing_mode={editingMode} enable_editing={enableEditing}
            />
        });

        return (
            <tbody>
                {this.representativeRows}
                {this.renderLastRow()}
            </tbody>
        );
    }

    initVariables() {
        this.datePlaceholder = 'H:i:s dd/mm/yyyy';

        this.cityStyle = {
            borderColor: this.borderColor.inValid
        };

        this.roleStyle = {
            borderColor: this.borderColor.inValid
        };

        this.startDateStyle = {
            borderColor: this.borderColor.valid
        };

        this.endDateStyle = {
            borderColor: this.borderColor.valid
        };
    }

    saveShasRepresentative(e) {
        // Prevent page refresh
        e.preventDefault();

        let voterKey = this.props.router.params.voterKey;
        let voterRepresentatives = [];
        let representativesList = this.props.representativesList;

        for ( let representativeIndex = 0; representativeIndex < representativesList.length; representativeIndex++ ) {
            voterRepresentatives.push({
                id: representativesList[representativeIndex].id,
                key: representativesList[representativeIndex].key,
                city_id: representativesList[representativeIndex].city_id,
                shas_representative_role_id: representativesList[representativeIndex].role_id,
                start_date: representativesList[representativeIndex].start_date,
                end_date: representativesList[representativeIndex].end_date
            });
        }

        VoterActions.saveRepresentatives(this.props.dispatch, voterKey, this.props.shas_representative,
                                         voterRepresentatives);
    }

    validateRole() {
        var role = this.props.newRepresentativeDetails.role;
        var roleId = this.props.newRepresentativeDetails.role_id;

        if ( 0 ==  role.length || 0 == roleId) {
            return false;
        } else {
            return true;
        }
    }

    validateCity() {
        var city = this.props.newRepresentativeDetails.city;
        var cityId = this.props.newRepresentativeDetails.city_id;

        if ( 0 ==  city.length || 0 == cityId) {
            return false;
        } else {
            return true;
        }
    }

    validateDate(repDate) {
        if ( null == repDate ) {
            return true;
        }

        return moment(repDate, 'YYYY-MM-DD', true).isValid();

        return true;
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateCity() ) {
            this.cityStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.cityStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateRole() ) {
            this.roleStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.roleStyle.borderColor = this.borderColor.valid;
        }

        let startDate = this.props.newRepresentativeDetails.start_date;
        if ( !this.validateDate(startDate) ) {
            this.startDateStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.startDateStyle.borderColor = this.borderColor.valid;
        }

        let endDate = this.props.newRepresentativeDetails.end_date;
        if ( !this.validateDate(endDate) ) {
            this.endDateStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.endDateStyle.borderColor = this.borderColor.valid;
        }

        this.saveButtonDisabled = !this.validInputs;
    }

    /**
     * This function renders the add button
     *
     * @returns {XML}
     */
    renderAddButton() {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
            (this.props.currentUser.permissions['elections.voter.political_party.shas_representative.role.edit'] == true &&
             this.props.currentUser.permissions['elections.voter.political_party.shas_representative.role.add'] == true) ) {
            displayButton = true;
        }

        // If the user has an edit + add group permissions,
        // then display the button
        if ( displayButton ) {
            return (
                <div className="col-sx-6 col-md-6">
                    <button className="btn btn-primary mainBtn pull-left" style={this.mainBtnStyle} 
                            onClick={this.showNewRepresentativeRow.bind(this)}
                            disabled={this.props.showNewRepresentativeRow || this.props.editingRepresentativeKey}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                        {this.newRepButtonText}
                    </button>
                </div>
            );
        } else {
            return <div className="col-sx-6 col-md-6">{'\u00A0'}</div>
        }
    }

    renderSaveButton() {
        var displayButton = false;

        if ( this.props.currentUser.admin ) {
            displayButton = true;
        } else if ( this.props.currentUser.permissions['elections.voter.political_party.shas_representative.role.edit'] == true ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <div className="col-xs-12">
                    <div className="form-group">
                        <div className="">
                            <button className="btn btn-primary saveChanges"
                                    onClick={this.saveShasRepresentative.bind(this)}
                                    disabled={this.props.editingRepresentativeKey ||
                                              this.props.showNewRepresentativeRow ||
                                              !this.representativeHasChanged ||
                                              this.props.savingChanges}>
                                {this.saveButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.representativeHasChanged = false;
        } else {
            this.representativeHasChanged = true;
        }
    }

    render() {

        this.initVariables();

        this.validateVariables();

        this.checkAnyChanges();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.partyRepresentative}>
                <div className="row CollapseContent">
                    <div className="col-sx-6 col-md-6">
                        <div className="checkbox styleCheckbox">
                            <label>
                                <input type="checkbox" value={this.props.shas_representative}
                                       checked={this.props.shas_representative}
                                       onChange={this.shasRepresentativeChange.bind(this)}
                                />
                                {this.checkboxLabelShasRepresentative}
                            </label>
                        </div>
                    </div>

                    {this.renderAddButton()}
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        <table className="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th>עיר</th>
                                <th>תפקיד</th>
                                <th>מתאריך</th>
                                <th>עד תאריך</th>
                                <th>פעולות</th>
                            </tr>
                            </thead>
                            {this.renderRepresentativeData()}
                        </table>
                    </div>
                </div>
                    {this.renderSaveButton()}
                </div>

                <div className="col-md-12 no-padding">
                    <ModalWindow show={this.props.showDeleteRepresentativeModalDialog}
                                 buttonOk={this.deleteRepresentativeFromState.bind(this)}
                                 buttonCancel={this.hideDeleteModalDialog.bind(this)}
                                 title={this.props.deleteModalRepresentativeHeader} style={{zIndex: '9001'}}>
                        <div>{this.props.deleteConfirmText}</div>
                    </ModalWindow>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        showNewRepresentativeRow: state.voters.voterScreen.showNewRepresentativeRow,
        cities: state.system.cities,
        representativeRoles: state.voters.voterScreen.representativeRoles,
        newRepresentativeDetails: state.voters.voterScreen.newRepresentativeDetails,
        editingRepresentativeKey: state.voters.voterScreen.editingRepresentativeKey,
        showDeleteRepresentativeModalDialog: state.voters.voterScreen.showDeleteRepresentativeModalDialog,
        deleteModalRepresentativeHeader: state.voters.voterScreen.deleteModalRepresentativeHeader,
        deleteRepresentativeKey: state.voters.voterScreen.deleteRepresentativeKey,
        deleteConfirmText: state.voters.voterScreen.deleteConfirmText,
        shas_representative: state.voters.voterDetails.shas_representative,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterPartyRepresentative));