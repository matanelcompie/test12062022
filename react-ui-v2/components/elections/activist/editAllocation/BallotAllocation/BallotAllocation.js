import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import AllocatedBallots from './AllocatedBallots';
import BallotSearch from './BallotSearch';
import BallotSearchResult from './BallotSearchResult';
import BallotsLoadingData from './BallotsLoadingData';

import * as ElectionsActions from 'actions/ElectionsActions';

class BallotAllocation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activistAllocatedShifts: {},
            searchBallotObj: {}
        };

        this.initConstants();  
    }

    componentWillMount() {
        if (this.isBallotRole() && (this.props.activistDetails.id != null)) {
            this.getAllocatedShifts(this.props.activistDetails.election_roles_by_voter);
        }        
    }
    isBallotRole (nextProps = null ){
        let currentProps = nextProps ? nextProps : this.props;
        return (currentProps.currentTabRoleSystemName == this.electionRoleSytemNames.ballotMember) ||
        (currentProps.currentTabRoleSystemName == this.electionRoleSytemNames.counter) ||
        (currentProps.currentTabRoleSystemName == this.electionRoleSytemNames.observer)
    }
    getBallotMiId(ballotMiId) {
        if (ballotMiId == undefined) return '';
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.editBallotFlag && nextProps.editBallotFlag) {
            this.getAllocatedShifts(nextProps.activistDetails.election_roles_by_voter);
        }
        let needToRefreshAllocatedShifts = this.isBallotRole(nextProps) &&
         (this.props.currentTabRoleSystemName != nextProps.currentTabRoleSystemName 
            || this.props.activistDetails != nextProps.activistDetails);

        if(needToRefreshAllocatedShifts){
            this.getAllocatedShifts(nextProps.activistDetails.election_roles_by_voter);
        }
        /*
        if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.observer &&
            nextProps.currentTabRoleSystemName == this.electionRoleSytemNames.observer ) {
            this.getAllocatedShifts(nextProps.activistDetails.election_roles_by_voter);
        }

        if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ballotMember &&
            nextProps.currentTabRoleSystemName == this.electionRoleSytemNames.ballotMember ) {
            this.getAllocatedShifts(nextProps.activistDetails.election_roles_by_voter);
        }

        if (((this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ballotMember) ||
            (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.observer)) && 
            (this.props.activistDetails != nextProps.activistDetails)) {
            this.getAllocatedShifts(nextProps.activistDetails.election_roles_by_voter);
        }
        */
    }

    getAllocatedShifts(electionsRolesByVoter) {
        let activistAllocatedShifts = {};
        let roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ballotMember);
        if ( roleIndex > -1 ) {
            for ( let ballotIndex = 0; ballotIndex < electionsRolesByVoter[roleIndex].activists_allocations_assignments.length; ballotIndex++ ) {
                let electionRoleShiftSystemName = electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].election_role_shift_system_name;

                activistAllocatedShifts[electionRoleShiftSystemName] = {
                    electionRoleName: electionsRolesByVoter[roleIndex].election_role_name,
                    electionRoleShiftName: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].election_role_shift_name,
                    clusterName: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].cluster_name,
                    ballotBoxMiId: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].mi_id
                };
            }
        }

        roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.observer);
        if ( roleIndex > -1 ) {
            for ( let ballotIndex = 0; ballotIndex < electionsRolesByVoter[roleIndex].activists_allocations_assignments.length; ballotIndex++ ) {
                let electionRoleShiftSystemName = electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].election_role_shift_system_name;

                activistAllocatedShifts[electionRoleShiftSystemName] = {
                    electionRoleName: electionsRolesByVoter[roleIndex].election_role_name,
                    electionRoleShiftName: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].election_role_shift_name,
                    clusterName: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].cluster_name,
                    ballotBoxMiId: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].mi_id
                };
            }
        }
        roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.counter);
        if ( roleIndex > -1 ) {
            for ( let ballotIndex = 0; ballotIndex < electionsRolesByVoter[roleIndex].activists_allocations_assignments.length; ballotIndex++ ) {
                let electionRoleShiftSystemName = electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].election_role_shift_system_name;

                activistAllocatedShifts[electionRoleShiftSystemName] = {
                    electionRoleName: electionsRolesByVoter[roleIndex].election_role_name,
                    electionRoleShiftName: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].election_role_shift_name,
                    clusterName: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].cluster_name,
                    ballotBoxMiId: electionsRolesByVoter[roleIndex].activists_allocations_assignments[ballotIndex].mi_id
                };
            }
        }

        this.setState({activistAllocatedShifts});
    }

    shouldComponentBeRendered() {
        
        if ( !this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists.ballot_member'] != true &&
             this.props.currentUser.permissions['elections.activists.observer'] != true &&
             this.props.currentUser.permissions['elections.activists.counter'] != true
             ) {
            return false;
        }

        if ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ballotMember ||
             this.props.currentTabRoleSystemName == this.electionRoleSytemNames.observer ||
             this.props.currentTabRoleSystemName == this.electionRoleSytemNames.counter
             ) {
            return true;
        } else {
            return false;
        }
    }

    isLoadingBallots() {
        switch (this.props.currentTabRoleSystemName) {
            case this.electionRoleSytemNames.observer:
                return this.props.loadingObserverBallots;
            case this.electionRoleSytemNames.ballotMember:
                return this.props.loadingBallotMemberBallots;
            case this.electionRoleSytemNames.counter:
                return this.props.loadingCounterBallots;
        }
    }
    searchBallots(searchBallotObj = null) {
        let  searchObj;
        let searchElectionRoleKey = this.getElectionRoleKey();
         if (searchBallotObj) {
             this.setState({ searchBallotObj: searchBallotObj });
             searchObj = searchBallotObj;
             searchObj.searchElectionRoleKey = searchElectionRoleKey;
         } else {
             searchObj = this.state.searchBallotObj
         }
         
         ElectionsActions.ballotsSearch(this.props.dispatch, searchElectionRoleKey, this.props.currentTabRoleSystemName, searchObj , 1);
     }
     getElectionRoleKey() {
         let electionRoleIndex = this.props.electionRoles.findIndex(item => item.id == this.props.currentTabRoleId);
        let roleKey = null;
         if(electionRoleIndex){
            roleKey = this.props.electionRoles[electionRoleIndex].key;
        }
        return roleKey;
     }
    render() {
       
        if ( this.shouldComponentBeRendered() ) {
            return(
               
                <div role="tabpanel" className={(this.props.display) ? "tab-pane active" : "tab-pane"}>
                    <div className="ContainerCollapse">
                        <AllocatedBallots currentTabRoleId={this.props.currentTabRoleId}
                                          currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                          currentAllocationTab={this.props.currentAllocationTab}
                                          activistAllocatedShifts={this.state.activistAllocatedShifts}
                                          getBallotMiId={this.getBallotMiId.bind(this)}/>

                        <BallotSearch currentTabRoleId={this.props.currentTabRoleId}
                                      currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                      currentAllocationTab={this.props.currentAllocationTab}
                                      searchBallots={this.searchBallots.bind(this)}
                                      />

                        { (this.isLoadingBallots() ) &&
                            <BallotsLoadingData/>
                        }

                        <BallotSearchResult currentTabRoleId={this.props.currentTabRoleId}
                                            currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                            activistAllocatedShifts={this.state.activistAllocatedShifts}
                                            getAllocatedShifts={this.getAllocatedShifts.bind(this)}
                                            getBallotMiId={this.getBallotMiId.bind(this)}
                                            searchBallotObj={this.state.searchBallotObj}
                                            />
                    </div>
                </div>
            );
        } else {
            return <div>{'\u00A0'}</div>;
        }
    }
}

function mapStateToProps(state) {
    return {
        activistDetails: state.elections.activistsScreen.activistDetails,

        loadingBallotMemberBallots: state.elections.activistsScreen.ballotsSearchResult.loadingBallotMemberBallots,
        loadingObserverBallots: state.elections.activistsScreen.ballotsSearchResult.loadingObserverBallots,
        editBallotFlag: state.elections.activistsScreen.editBallotFlag,
        electionRoles: state.elections.activistsScreen.electionRoles

    };
}

export default connect(mapStateToProps) (BallotAllocation);