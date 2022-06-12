import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import ModalWindow from 'components/global/ModalWindow';

import constants from 'libs/constants';

import RoleDetails from './RoleDetails';
import VerifyDetails from "./VerifyDetails";

import * as ElectionsActions from 'actions/ElectionsActions';


class AllocationDetails extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.state = {
            showDeleteModal: false
        }
    }
    displayDeleteRoleModal(bool){
        let activistItem = this.props.activistDetails;

        this.roleDeleteIndex = -1;
        if (bool) {
            this.roleDeleteIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
           
            this.deleteTitleText = ' מחיקת תפקיד ' + '"' + activistItem.election_roles_by_voter[this.roleDeleteIndex].election_role_name
             + '"' + ' לפעיל ' + activistItem.first_name +' '+ activistItem.last_name ;

        }
        this.setState({ showDeleteModal: bool })
    }

    deleteElectionActivistRole() {
        let activistItem = this.props.activistDetails;
        ElectionsActions.deleteElectionActivistRole(this.props.dispatch, this.props.router,
                                                    activistItem.election_roles_by_voter[this.roleDeleteIndex].key,
                                                    activistItem.election_roles_by_voter.length);
        this.displayDeleteRoleModal(false);
    }

    getBlockClass() {
        let blockClass = "tab-pane election-activist-allocation";
        if ( this.props.display ) {
            blockClass += " active";
        }

        return blockClass;
    }

    displayVerifyDetails() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty) {
            roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
        }

        if ( roleIndex > -1 && activistItem.election_roles_by_voter[roleIndex].system_name != this.electionRoleSytemNames.ministerOfFifty ) {
            return true;
        } else {
            return false;
        }
    }

    renderVerifyDetails() {
        if ( !this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists.captain_of_fifty'] != true ) {
            return false
        }

        let roleIndex = 0;

        for ( roleIndex = 0; roleIndex < this.props.activistsRolesHash.length; roleIndex++ ) {
            if ( this.props.activistsRolesHash[roleIndex] != undefined && this.props.activistsRolesHash[roleIndex] != null ) {
                if ( this.props.activistsRolesHash[roleIndex].system_name != this.electionRoleSytemNames.ministerOfFifty ) {
                    return true;
                }
            }
        }

        return false;
    }

    initVariables() {
        this.capatainItem = {
            allocationKey: null,
            user_create_first_name: '',
            user_create_last_name: '',
            created_at: '',
            total_households: 0,
            total_voters: 0
        };

        let roleIndex = -1;
        let geoIndex = -1;
        let activistItem = this.props.activistDetails;
        let electionRoleByVoterGeographicAreasKey = null;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);
        if ( roleIndex > -1 ) {
            this.capatainItem.allocationKey = activistItem.election_roles_by_voter[roleIndex].key;

            this.capatainItem.user_create_first_name = activistItem.election_roles_by_voter[roleIndex].user_create_first_name;
            this.capatainItem.user_create_last_name = activistItem.election_roles_by_voter[roleIndex].user_create_last_name;
            this.capatainItem.created_at = activistItem.election_roles_by_voter[roleIndex].created_at;

            this.capatainItem.total_households = (activistItem.election_roles_by_voter[roleIndex].captain50_households ? activistItem.election_roles_by_voter[roleIndex].captain50_households.length : 0);

            for ( let householdIndex = 0; householdIndex < this.capatainItem.total_households; householdIndex++ ) {
                this.capatainItem.total_voters += activistItem.election_roles_by_voter[roleIndex].captain50_households[householdIndex].household_members_count;
            }
        }
    }

    render() {
        
        this.initVariables();
        let activistMissingAllocationMessage = null
        if(this.props.displayAllocationRemovedMessage){
            activistMissingAllocationMessage = (
              <h4 className="col-md-12 text-danger">
                 לתפקיד זה לא קיים שיוך לקלפי, לכן התפקיד ימחק 
                <b> שעה </b> לאחר הקמתו (או לאחר מחיקת השיבוץ האחרון)
              </h4>
            );
        }
        return (
            <div role="tabpanel" className={this.getBlockClass()}>
                <div className="containerStrip">
                    <div className="row panelContent">
                        {activistMissingAllocationMessage}
                        <div className="col-md-5 borderL dtlsSubBox1 election-activist-allocation-details">
                            <RoleDetails currentTabRoleId={this.props.currentTabRoleId}
                                         currentTabRoleSystemName={this.props.currentTabRoleSystemName}/>
                        </div>

                        <div className="col-md-7 dtlsSubBox2 attrbtrDtls">
                            <VerifyDetails display={this.displayVerifyDetails()} currentTabRoleId={this.props.currentTabRoleId}
                                           currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                           deleteElectionActivistRole={this.displayDeleteRoleModal.bind(this,true)}
                                           renderCaptainComponent={this.props.renderCaptainComponent}
                                           capatainItem={this.capatainItem}
                                           />
                             
                        </div>
                    </div>
                </div>
                <div className="deleteElectionRoleActivist" >
                    <ModalWindow

                        title={this.deleteTitleText}
                        showCancel={true}
                        show={this.state.showDeleteModal}
                        buttonX={this.displayDeleteRoleModal.bind(this, false)}
                        buttonOk={this.deleteElectionActivistRole.bind(this)}
                        buttonCancel={this.displayDeleteRoleModal.bind(this, false)}
                    ><div style={{ width: '200px' }}>האם אתה בטוח/ה ?</div></ModalWindow>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        activistDetails: state.elections.activistsScreen.activistDetails
    }
}

export default connect(mapStateToProps) (withRouter(AllocationDetails));