import React from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';
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
        this.activistAllocationsTabs = constants.activists.allocationsTabs;
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
    }

    componentWillReceiveProps(nextProps) {
        if ( this.props.currentAllocationTab != this.activistAllocationsTabs.driverClusterAllocation &&
            nextProps.currentAllocationTab == this.activistAllocationsTabs.driverClusterAllocation ) {
            let roleIndex = nextProps.activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.driver);

            if (  nextProps.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.length > 0 ) {
                this.setState({collapsed: true});
            } else {
                this.setState({collapsed: false});
            }
        }
    }

    hideDeleteErrorModal() {
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.HIDE_DELETE_DRIVER_CLUSTER_ERROR_MODAL});
    }

    deleteDriverCluster(clusterKey) {
        let roleIndex = -1;
        let geoIndex = -1;
        let activistItem = this.props.activistDetails;
        let that=this;
        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);

        geoIndex = activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.cluster_key == clusterKey);
        let assignment = activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex];
        AllocationAndAssignmentActions.deleteActivistAllocationAssignment(this.props.dispatch, assignment.id,false).then(function(success){
            if(success)
             that.props.dispatch({ type: AllocationAndAssignmentActions.ActionTypes.DELETE_CLUSTER_ASSIGNMENT,electionRoleByVoterId:assignment.election_role_by_voter_id, clusterId: assignment.cluster_id });
         });

        // ElectionsActions.deleteDriverCluster(this.props.dispatch, electionRoleByVoterGeographicAreasKey, this.props.currentTabRoleId);
    }

    renderAllocatedClusters() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;
        let that = this;
        let clusters = [];

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);
        let activistUserLockId = activistItem.election_roles_by_voter[roleIndex].user_lock_id;

		if(activistItem && activistItem.election_roles_by_voter && activistItem.election_roles_by_voter[roleIndex] && activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments){
			clusters = activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments.map( function (clusterItem, index) {
				return <AllocatedClusterItem key={index} item={clusterItem} currentUser={that.props.currentUser}
                                         isActivistLocked={activistUserLockId != null}
                                         deleteDriverCluster={that.deleteDriverCluster.bind(that)}/>
			});
		}
        return <tbody>{clusters}</tbody>;
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    renderTitle() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;
        let numOfDriverClusters = 0;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);
        numOfDriverClusters = activistItem.election_roles_by_voter[roleIndex].activists_allocations_assignments.length;

        if ( numOfDriverClusters > 0 ) {
            this.CollapseStyle={height: 'auto'};
            return (
                [
                    <span key={0}>אשכולות משובצים</span>,
                    <span key={1} className="badge">{numOfDriverClusters}</span>
                ]
            );
        } else {
            this.CollapseStyle={};
            return <span>אשכולות משובצים</span>;
        }
    }

    render() {
        return (
            <div className="containerStrip">
                <a onClick={this.updateCollapseStatus.bind(this)}
                   aria-expanded={this.state.collapsed}>
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <div className="collapseTitle" style={{marginBottom: '13px'}}>
                            {this.renderTitle()}
                        </div>
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
                            <th>{'\u00A0'}</th>
                        </tr>
                        </thead>

                        {this.renderAllocatedClusters()}
                    </table>
                </div>

                <ModalWindow show={this.props.showDeleteDriverClusterErrorModal}
                             title={this.props.deleteDriverClusterErrorModalTitle} style={{zIndex: '9001'}}
                             buttonOk={this.hideDeleteErrorModal.bind(this)} buttonCancel={this.hideDeleteErrorModal.bind(this)}>
                    <div>לא ניתן למחוק את האשכול. לנהג משובצות הסעות באשכול הזה.</div>
                </ModalWindow>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        activistDetails: state.elections.activistsScreen.activistDetails,
        showDeleteDriverClusterErrorModal: state.elections.activistsScreen.showDeleteDriverClusterErrorModal,
        deleteDriverClusterErrorModalTitle: state.elections.activistsScreen.deleteDriverClusterErrorModalTitle
    }
}

export default connect(mapStateToProps) (AllocatedClusters);