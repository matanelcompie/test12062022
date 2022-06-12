import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import BallotRoleItem from './VoterElectionsActivityRoles/BallotRoleItem';
import ClusterLeaderItem from './VoterElectionsActivityRoles/ClusterLeaderItem';
import ClusterRoleItem from './VoterElectionsActivityRoles/ClusterRoleItem';
import Captain50Item from './VoterElectionsActivityRoles/Captain50Item';

import * as VoterActions from 'actions/VoterActions';
import * as SystemActions from 'actions/SystemActions';


class VoterElectionsActivity extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.subHeader = "פעילות ביום בחירות";
        this.paneltitle = "פעילות בחירות";
    }

    deleteVoterRoleFromState() {
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.VOTER_ROLE_DELETE_FROM_STATE});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY,
                             target: "elections.voter.support_and_elections.election_activity"});

        this.hideDeleteModalDialog();
    }

    hideDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.ACTIVIST_DELETE_HIDE_MODAL_DIALOG});
    }

    renderActivityRoles() {
        var that = this;
        const electionRoleSytemNames = constants.electionRoleSytemNames;

        this.voterRolesRows = this.props.voterRoles.election_roles_by_voter.map(function(voterRoleItem, index) {

                switch (voterRoleItem.system_name) {
                    case electionRoleSytemNames.ballotMember :
                    case electionRoleSytemNames.observer :
                    case electionRoleSytemNames.counter :
                        return <BallotRoleItem key={voterRoleItem.key} item={voterRoleItem}/>;   
                    case electionRoleSytemNames.clusterLeader:
                        return <ClusterLeaderItem key={voterRoleItem.key} item={voterRoleItem}/>;

                    case electionRoleSytemNames.driver:
                    case electionRoleSytemNames.motivator:
                        return <ClusterRoleItem key={voterRoleItem.key} item={voterRoleItem}/>;

                    case electionRoleSytemNames.ministerOfFifty:
                        return <Captain50Item key={voterRoleItem.key} item={voterRoleItem} cityName={that.props.voterRoles.city_name}/>;
                }
        });

        return (
            <tbody>
                {this.voterRolesRows}
            </tbody>
        );
    }

    initVariables() {
        this.newRoleButtonClass = "row subHeader hidden";

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.election_activity.add'] == true) {
            this.newRoleButtonClass = "row subHeader";
        }
	
    }

    render() {
        this.initVariables();
        let election_roles_by_voter = this.props.voterRoles.election_roles_by_voter;
        return (
            <div className="col-sm-12">
                <div className="subHeader"><h4>{this.paneltitle}</h4></div>

                <div className="election-voter-roles">
					{election_roles_by_voter && election_roles_by_voter.length  &&
                    <table className="table table-bordered table-striped table-election-voter-roles">
                        <thead>
                        <tr>
                            <th>תקופת בחירות</th>
                            <th>תפקיד</th>
                            <th>עיר שיבוץ</th>
                            <th>שיבוץ</th>
							<th>משמרת</th>
							<th>סכום</th>
                        </tr>
                        </thead>

                        {this.renderActivityRoles()}
                    </table>}
					{(!this.props.voterRoles.election_roles_by_voter || (this.props.voterRoles.election_roles_by_voter.length == 0)) &&
                        <div style={{textAlign:'center'}}>לא מוגדרים תפקידים למשתמש</div>
					}
                </div>

 
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        electionRoles: state.voters.activistScreen.election_roles,
        electionRoleShifts: state.voters.activistScreen.election_role_shifts,
        oldVoterRoles: state.voters.activistScreen.old_voter_roles,
        voterRoles: state.voters.activistScreen.voter_roles,
        showDeleteModalDialog: state.voters.activistScreen.showDeleteModalDialog,
        deleteModalHeader: state.voters.activistScreen.deleteModalHeader,
        deleteConfirmText: state.voters.activistScreen.deleteConfirmText,
        voterGeoEntityKey: state.voters.activistScreen.voterGeoEntityKey,
        voterGeoEntityIndex: state.voters.activistScreen.voterGeoEntityIndex,
        addingNewRole:state.voters.activistScreen.addingNewRole,
        addNewRoleData:state.voters.activistScreen.addNewRoleData,
        editingExistingRole:state.voters.activistScreen.editingExistingRole,
        editRoleRowIndex:state.voters.activistScreen.editRoleRowIndex,
        voterRoleDeleteIndex : state.voters.activistScreen.voterRoleDeleteIndex,
        willingVolunteerValuesList:state.voters.activistScreen.willingVolunteerValuesList ,
        agreeSignValuesList:state.voters.activistScreen.agreeSignValuesList ,
        expMaterialValuesList:state.voters.activistScreen.expMaterialValuesList,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps) (withRouter(VoterElectionsActivity));