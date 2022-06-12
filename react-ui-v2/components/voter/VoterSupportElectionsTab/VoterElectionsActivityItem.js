import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import Combo from '../../global/Combo';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterElectionsActivityItem extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.setDirtyTarget = 'elections.voter.support_and_elections.election_activity';
    }

    addNewRoleGeoItem(){
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_SHOW_MODAL_DIALOG,
                             rowIndex: this.props.roleIndex,
                             roleIndex: this.props.roleIndex,
                             addingNewGeoRole: true,
                             editingExistingGeoRole: false,
                             campName : this.props.item.CampaignName.trim(),
                             roleName :  this.props.item.RoleName.trim(),
                             recordID:this.props.item.id });
    }

    editExistingRoleGeoItem(geoIndex){
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_SHOW_MODAL_DIALOG,
            rowIndex: this.props.roleIndex,
            addingNewGeoRole :false,
            editingExistingGeoRole: true,
            campName: this.props.item.CampaignName.trim(),
            roleName: this.props.item.RoleName.trim(),

            roleIndex: this.props.roleIndex,
            geoIndex: geoIndex,
            recordID:this.props.item.election_roles_geographical[geoIndex].id ,
            roleShiftName:this.props.item.election_roles_geographical[geoIndex].role_shift_name,
            roleArea:this.props.item.election_roles_geographical[geoIndex].area_name,
            roleCity:this.props.item.election_roles_geographical[geoIndex].city_name,
            roleNeighborhood:this.props.item.election_roles_geographical[geoIndex].neighborhood_name,
            roleCluster:this.props.item.election_roles_geographical[geoIndex].cluster_name,
            roleBallot:this.props.item.election_roles_geographical[geoIndex].ballot_name,
            roleKey : this.props.item.election_roles_geographical[geoIndex].key
        });
    }

    deleteRoleGeoItem(geoIndex) {
        this.props.dispatch({
            type: VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_DELETE_ROW_CHANGE,
            roleIndex: this.props.roleIndex,
            geoIndex: geoIndex
        });
    }

    saveVoterRoleInState() {
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.VOTER_ROLE_SAVE_IN_STATE,
                             roleIndex: this.props.roleIndex});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    disableEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.UNSET_ROW_EDITING,
                             rowIndex: this.props.roleIndex,
                             oldRoleName: this.oldRoleName,
                             oldRoleId: this.oldRoleId,
                             oldCampaignName: this.props.item.CampaignName });

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    showDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_DELETE_SHOW_MODAL_DIALOG,
                             voterRoleDeleteIndex: this.props.roleIndex});
    }

    enableEditing() {
        this.oldRoleId = this.props.item.election_role_id;
        this.oldRoleName = this.props.item.RoleName;

        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_ROW_EDITING,
                             rowIndex: this.props.roleIndex});
    }

    getRoleId(roleName) {
        let electionRoles = this.props.electionRoles;
        let roleIndex = -1;
        let roleId = 0;

        roleIndex = electionRoles.findIndex(roleItem => roleItem.name == roleName);
        if ( -1 == roleIndex ) {
            return 0;
        } else {
            roleId = electionRoles[roleIndex].id;
            return roleId;
        }
    }

    roleChange(e) {
        var roleName = e.target.value;
        var roleId = 0;

        roleId = this.getRoleId(roleName);
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ROW_ROLE_ID,
                             rowIndex: this.props.roleIndex,
                             roleId: roleId });

        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_ROW_ROLE,
                             rowIndex: this.props.roleIndex,
                             roleName: roleName });

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    constructGeorpahicEntityPath(area_name , city_name , neighborhood_name , cluster_name , ballot_name){
        let returnedValue = '' ;
        if(area_name != '' && area_name != undefined){
            returnedValue += area_name;
            if(city_name != '' && city_name != undefined){
                returnedValue += ' >> '+ city_name;
                if(neighborhood_name != '' && neighborhood_name != undefined){
                    returnedValue += ' >> '+ neighborhood_name;

                }
                if(cluster_name != '' && cluster_name != undefined){
                    returnedValue +=    ' >> ' + ' אשכול ' + '"' +  cluster_name + '"';
                    if(ballot_name != '' && ballot_name != undefined){
                        returnedValue +=    ' >> ' + ' קלפי ' + '"' +  ballot_name + '"';
                    }
                }

            }
        }

        return returnedValue;
    }

    renderNonEditingLastColumn(roleShiftEntities) {
        if (this.props.enable_editing) {
            return (
                <td>
                    {roleShiftEntities}
                    <span className="edit-buttons pull-left">
                        <button type="button" className={this.editButtonClass}
                                onClick={this.enableEditing.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                        {'\u00A0'}
                        <button type="button" className={this.deleteButtonClass}
                                onClick={this.showDeleteModalDialog.bind(this)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                    </span>
                </td>
            );
        } else {
            return (
                <td>
                    {roleShiftEntities}
                </td>
            );
        }
    }

    renderNonEditingModeRow() {
        var roleEntities = this.props.geographicItems;
        var that = this;

        let geographicEntities = roleEntities.map(function(geoData, index) {
            return (
                <div key={index}>
                    {that.constructGeorpahicEntityPath(geoData.area_name , geoData.city_name,
                                                       geoData.neighborhood_name, geoData.cluster_name,
                                                       geoData.ballot_name)}
                </div>
            );
        });

        let roleShiftEntities =roleEntities.map(function(geoData, index) {
            return (
                <div key={index}>
                    {geoData.role_shift_name}
                </div>
            );
        });

        return (
            <tr key={this.props.item.roleIndex}>
                <td></td>
                <td>{this.props.item.RoleName}</td>
                <td>
                    {geographicEntities}
                </td>
                {this.renderNonEditingLastColumn(roleShiftEntities)}
            </tr>
        );
    }

    renderEditingModeRow() {
        var roleEntities = this.props.geographicItems;
        var that = this;

        let geographicEntities =roleEntities.map(function(geoData, index) {
            return (
                <div key={index}>
                    {that.constructGeorpahicEntityPath(geoData.area_name , geoData.city_name ,
                                                       geoData.neighborhood_name , geoData.cluster_name ,
                                                       geoData.ballot_name)}
                    <span className="edit-buttons pull-left">
                        <button type="button" className="btn btn-success btn-xs"
                                onClick={that.editExistingRoleGeoItem.bind(that, index)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                        <button type="button" className="btn btn-danger btn-xs"
                                onClick={that.deleteRoleGeoItem.bind(that, index)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                    </span>
                </div>
            );
        });

        let roleShiftEntities = roleEntities.map(function(geoData, index) {
            return (
                <div key={index}>
                    {geoData.role_shift_name}
                </div>
            );
        });

        return (
            <tr key={this.props.item.roleIndex}>
                <td></td>
                <td>
                    <Combo id="role_name"
                           items={this.props.electionRoles}
                           maxDisplayItems={10} itemIdProperty="id"
                           itemDisplayProperty='name'
                           className="form-combo-table"
                           value={this.props.item.RoleName}
                           onChange={this.roleChange.bind(this)}
                           inputStyle={this.roleStyle} />
                </td>
                <td>
                    {geographicEntities}
                    <div key={this.props.geographicItems.length}>
                        <button type="button" className="btn btn-success btn-xs"
                                onClick={this.addNewRoleGeoItem.bind(this)}>
                            <i className="fa fa-plus"/>
                        </button>
                    </div>
                </td>
                <td>
                    {roleShiftEntities}
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-success btn-xs"
                                onClick={this.saveVoterRoleInState.bind(this)}
                                disabled={this.saveButtonDisabled}>
                            <i className="fa fa-floppy-o"/>
                        </button>
                        {'\u00A0'}
                        <button type="button" className="btn btn-danger btn-xs"
                                onClick={this.disableEditing.bind(this)}>
                            <i className="fa fa-times"/>
                        </button>
                    </span>
                </td>
            </tr>
        );
    }

    initVariables() {
        this.roleStyle = {
            borderColor: this.borderColor.valid
        };

        this.editButtonClass = "btn btn-success btn-xs hidden";
        this.deleteButtonClass = "btn btn-danger btn-xs hidden";
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.editButtonClass = "btn btn-success btn-xs";
            this.deleteButtonClass = "btn btn-danger btn-xs";

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.election_activity.edit'] == true) {
            this.editButtonClass = "btn btn-success btn-xs";
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.election_activity.delete'] == true) {
            this.deleteButtonClass = "btn btn-danger btn-xs";
        }
    }

    validateRole() {
        var roleName = this.props.item.RoleName;
        var roleId = this.props.item.election_role_id;

        if ( 0 ==  roleName.length || 0 == roleId) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateRole() ) {
            this.roleStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.roleStyle.borderColor = this.borderColor.valid;
        }

        this.saveButtonDisabled = !this.validInputs;
    }

    render() {

        this.initVariables();

        this.checkPermissions();

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
        electionRoles: state.voters.activistScreen.election_roles,
        electionRoleShifts: state.voters.activistScreen.election_role_shifts,
        areas :state.voters.activistScreen.areas,
        cities :state.voters.activistScreen.cities,
        neighborhoods :state.voters.activistScreen.neighborhoods,
        clusters :state.voters.activistScreen.clusters,
        ballots :state.voters.activistScreen.ballots,
        editRoleRowIndex:state.voters.activistScreen.editRoleRowIndex,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps) (withRouter(VoterElectionsActivityItem));