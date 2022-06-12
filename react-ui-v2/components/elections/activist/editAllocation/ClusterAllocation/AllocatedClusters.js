import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import AllocatedClusterItem from './AllocatedClusterItem';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';


class AllocatedClusters extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: null
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.activistAllocationsTabs = constants.activists.allocationsTabs;
    }

    componentWillReceiveProps(nextProps) {
        if ( this.props.currentAllocationTab != this.activistAllocationsTabs.clusterAllocation &&
             nextProps.currentAllocationTab == this.activistAllocationsTabs.clusterAllocation ) {
            let roleIndex = nextProps.activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == nextProps.currentTabRoleSystemName);

            switch ( nextProps.currentTabRoleSystemName ) {
                case this.electionRoleSytemNames.clusterLeader:
                    if (  nextProps.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.length > 0 ) {
                        this.setState({collapsed: true});
                    } else {
                        this.setState({collapsed: false});
                    }
                    break;

                case this.electionRoleSytemNames.motivator:
                    if (  nextProps.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.length > 0 ) {
                        this.setState({collapsed: true});
                    } else {
                        this.setState({collapsed: false});
                    }
                    break;
            }
        }
    }

    deleteActivistRoleGeoCluster(clusterKey) {
        let roleIndex = -1;
        let geoIndex = -1;
        let activistItem = this.props.activistDetails;
        let electionRoleByVoterGeographicAreasKey = null;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);

        geoIndex = activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.cluster_key == clusterKey);
        electionRoleByVoterGeographicAreasKey = activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].key;

        ElectionsActions.deleteActivistRoleGeo(this.props.dispatch, electionRoleByVoterGeographicAreasKey, this.props.currentTabRoleId);
    }

    deleteActivistRoleCluster(assignment) {
        let that=this;
        AllocationAndAssignmentActions.deleteActivistAllocationAssignment(this.props.dispatch, assignment.id,false).then(function(success){
           if(success)
            that.props.dispatch({ type: AllocationAndAssignmentActions.ActionTypes.DELETE_CLUSTER_ASSIGNMENT,electionRoleByVoterId:assignment.election_role_by_voter_id, clusterId: assignment.cluster_id });
        });
    }

    renderAllocatedClusters() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;
        let that = this;
        let clusters = [];

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);
        let electionRoleByVoter = activistItem.election_roles_by_voter[roleIndex];
        let activistUserLockId = electionRoleByVoter.user_lock_id;
        switch (this.props.currentTabRoleSystemName) {
            case this.electionRoleSytemNames.clusterLeader:
			    if(electionRoleByVoter.activists_allocations_assignments){
					clusters = electionRoleByVoter.activists_allocations_assignments.map( function (clusterItem, index) {
						return <AllocatedClusterItem key={index} item={clusterItem} currentTabRoleSystemName={that.props.currentTabRoleSystemName}
                                                 currentUser={that.props.currentUser} isActivistLocked={activistUserLockId != null}
                                                 electionRoleByVoterKey={electionRoleByVoter.key}
                                                 deleteActivistRoleCluster={that.deleteActivistRoleCluster.bind(that)}/>
					});
				}
                break;

            case this.electionRoleSytemNames.motivator:
				if(electionRoleByVoter.activists_allocations_assignments){
					clusters = electionRoleByVoter.activists_allocations_assignments.map( function (clusterItem, index) {
						return <AllocatedClusterItem key={index} item={clusterItem} currentTabRoleSystemName={that.props.currentTabRoleSystemName}
                                                 currentUser={that.props.currentUser} isActivistLocked={activistUserLockId != null}
                                                 electionRoleByVoterKey={electionRoleByVoter.key}
                                                 deleteActivistRoleCluster={that.deleteActivistRoleCluster.bind(that)}/>
					});
				}
                break;
        }

        return <tbody>{clusters}</tbody>;
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    renderTitle() {
        let numOfClusters = 0;
        let roleIndex = this.props.activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);

        switch ( this.props.currentTabRoleSystemName ) {
            case this.electionRoleSytemNames.clusterLeader:
                numOfClusters = this.props.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.length;
                break;

            case this.electionRoleSytemNames.motivator:
                numOfClusters = this.props.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.length;
                break;
        }

        if ( numOfClusters > 0 ) {
            return (
                [
                    <span key={0}>אשכולות משובצים</span>,
                    <span key={1} className="badge">{numOfClusters}</span>
                ]
            );
        } else {
            return <span>אשכולות משובצים</span>;
        }
    }

    render() {
        return (
            <div className="containerStrip" style={{borderBottom: 'none'}}>
                <a onClick={this.updateCollapseStatus.bind(this)}
                   aria-expanded={this.state.collapsed}>
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <div className="collapseTitle" style={{marginBottom: '13px'}}>{this.renderTitle()}</div>
                    </div>
                </a>

                <div className={"allocated-clusters" + (this.state.collapsed ? "" : " hidden")}>
                    <table className="table table-frame standard-frame table-striped tableNoMarginB householdLIst">
                        <thead>
                        <tr>
                            <th>עיר</th>
                            <th>רובע</th>
                            <th>קוד אשכול</th>
                            <th>שם אשכול</th>
                            <th>כתובת</th>
                            <th>מספר קלפיות</th>
                            <th>כתב מינוי</th>
                            <th>{'\u00A0'}</th>
                        </tr>
                        </thead>

                        {this.renderAllocatedClusters()}
                    </table>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activistDetails: state.elections.activistsScreen.activistDetails
    }
}

export default connect(mapStateToProps) (AllocatedClusters);