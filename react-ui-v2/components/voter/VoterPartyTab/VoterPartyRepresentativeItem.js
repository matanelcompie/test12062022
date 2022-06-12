import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import Combo from '../../global/Combo';
import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../libs/globalFunctions';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterPartyRepresentativeItem extends React.Component {

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

        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };

        this.setDirtyTarget = "elections.voter.political_party.shas_representative";
    }

    editRepresentativeInState() {
        if (!this.validInputs) {
            return;
        }

        let data = {
            city_id: this.props.item.city_id,
            city_name: this.props.item.city_name,
            role_id: this.props.item.role_id,
            role_name: this.props.item.role_name,
            start_date: this.props.item.start_date,
            end_date: this.props.item.end_date
        };

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_REPRESENTATIVE_IN_STATE,
                             data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DISABLE_EDITING});
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_INPUT_CHANGE,
                             role: newRole, representativeIndex: this.props.representativeItemIndex});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == newRole.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_ID_INPUT_CHANGE,
                                 role_id: 0,
                                 representativeIndex: this.props.representativeItemIndex});

            return;
        }

        roleId = this.getRoleId(newRole);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_ID_INPUT_CHANGE,
                             role_id: roleId,
                             representativeIndex: this.props.representativeItemIndex});
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

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_INPUT_CHANGE,
                             city: newCity, representativeIndex: this.props.representativeItemIndex});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        if ( 0 == newCity.length ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_ID_INPUT_CHANGE,
                                 city_id: 0,
                                 representativeIndex: this.props.representativeItemIndex});

            return;
        }

        cityId = this.getCityId(newCity);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_ID_INPUT_CHANGE,
                             city_id: cityId,
                             representativeIndex: this.props.representativeItemIndex});
    }

    showDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_SHOW_MODAL_DIALOG,
                             deleteRepresentativeKey: this.props.item.key,
                             deleteRepresentativeIndex: this.props.representativeItemIndex});
    }

    disableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_BACKUP_FROM_STATE});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DISABLE_EDITING});
    }

    enableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ENABLE_EDITING,
                             editingRepresentativeKey: this.props.item.key,
                             editingRepresentativeIndex: this.props.representativeItemIndex});
    }

    renderEditingModeRow() {
        return (<tr>
            <td>
                <Combo items={this.props.cities} itemIdProperty="id" itemDisplayProperty='name'
                       maxDisplayItems={10}
                       inputStyle={this.cityStyle} value={this.props.item.city_name}
                       className="form-combo-table"
                       onChange={this.cityChange.bind(this)}/>
            </td>
            <td>
                <Combo items={this.props.representativeRoles} itemIdProperty="id" itemDisplayProperty='name'
                       maxDisplayItems={10} inputStyle={this.roleStyle} value={this.props.item.role_name}
                       className="form-combo-table"
                       onChange={this.roleChange.bind(this)}/>
            </td>
            <td>
                <ReactWidgets.DateTimePicker
                    isRtl={true} time={false}
                    value={parseDateToPicker(this.props.item.start_date)}
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
                    value={parseDateToPicker(this.props.item.end_date)}
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
                    <button className="btn btn-success btn-xs" title={this.tooltip.saveTitle}
                            onClick={this.editRepresentativeInState.bind(this)}
                            disabled={!this.validInputs}>
                        <i className="fa fa-floppy-o"/>
                    </button>
                    {'\u00A0'}
                    <button className="btn btn-danger btn-xs" title={this.tooltip.cancelTitle}
                            onClick={this.disableEditing.bind(this)}>
                        <i className="fa fa-times"/>
                    </button>
                </span>
            </td>
        </tr>
        )
    }

    /**
     * This function renders the buttons
     * of edit & delete representative.
     *
     * The user must have an edit permission
     * and delete permission for deleting a
     * representative.
     *
     * @returns {XML}
     */
    renderNonEditTdActions() {
        if (!this.props.enable_editing) {
            return <td>{'\u00A0'}</td>;
        }

        if ( this.allowEditRepresentative ) {
            // User must have a edit representative permission
            // for deleting a group.
            if ( this.allowDeleteRepresentative ) {
                return (
                    <td>
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                                    onClick={this.enableEditing.bind(this)}>
                                <i className="fa fa-pencil-square-o"/>
                            </button>
                            {'\u00A0'}
                            <button type="button" className="btn btn-danger btn-xs" title={this.tooltip.deleteTitle}
                                    onClick={this.showDeleteModalDialog.bind(this)}>
                                <i className="fa fa-trash-o"/>
                            </button>
                        </span>
                    </td>
                );
            } else {
                // The user doesn't have a delete permission and has
                // an edit representative permission.
                return (
                    <td>
                        <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                                onClick={this.enableEditing.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                    </td>
                );
            }
        } else {
            // the user doesn't have an edit permission
            return <td>{'\u00A0'}</td>;
        }
    }

    renderNonEditingModeRow() {
        return (
            <tr key={this.props.item.id}>
                <td>{this.props.item.city_name}</td>
                <td>{this.props.item.role_name}</td>
                <td>{dateTimeReversePrint(this.props.item.start_date, false)}</td>
                <td>{dateTimeReversePrint(this.props.item.end_date, false)}</td>
                {this.renderNonEditTdActions()}
            </tr>
        );
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.allowEditRepresentative = true;
            this.allowDeleteRepresentative = true;

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_representative.role.edit'] == true) {
            this.allowEditRepresentative = true;
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_representative.role.delete'] == true) {
            this.allowDeleteRepresentative = true;
        }
    }

    initVariables() {

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

        this.allowEditRepresentative = false;
        this.allowDeleteRepresentative = false;
    }

    validateRole() {
        var role = this.props.item.role_name;
        var roleId = this.props.item.role_id;

        if ( 0 ==  role.length || 0 == roleId) {
            return false;
        } else {
            return true;
        }
    }

    validateCity() {
        var city = this.props.item.city_name;
        var cityId = this.props.item.city_id;

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

        if ( !this.validateDate(this.props.item.start_date) ) {
            this.startDateStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.startDateStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateDate(this.props.item.end_date) ) {
            this.endDateStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.endDateStyle.borderColor = this.borderColor.valid;
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions()

        this.validateVariables();

        let entity_mode = this.props.editing_mode;

        if ( entity_mode ) {
            return this.renderEditingModeRow();
        } else {
            return this.renderNonEditingModeRow();
        }
    }

}


function mapStateToProps(state) {
    return {
        cities: state.system.cities,
        representativeRoles: state.voters.voterScreen.representativeRoles,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterPartyRepresentativeItem));