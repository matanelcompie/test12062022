import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Pagination from 'components/global/Pagination';
import ClusterItem from './ClusterItem';
import AlertUpdateMotivatorModal from './AlertUpdateMotivatorModal';
import AlertUpdateLeaderModal from './AlertUpdateLeaderModal';
import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';

import * as ElectionsActions from 'actions/ElectionsActions';


class ClusterSearchResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: null,

            currentPageClusters: [],

            activistAllocatedClusters: {},

            alertUpdateMotivatorModal: {
                show: false,
                clusterKey: null,
                clusterName: ''
            },

            alertUpdateLeaderModal: {
                show: false,
                clusterKey: null,
                clusterName: '',
                clusterLeader: {
                    first_name: '',
                    last_name: '',
                    personal_identity: '',
                    verified_status: ''
                }
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;

        this.clustersPerPage = 30;
    }

    componentWillReceiveProps(nextProps) {
        if ( !this.props.loadingClustersFlag && nextProps.loadingClustersFlag ) {
            this.setState({currentPage: 1, currentPageClusters: []});
        }

        if ( !this.props.loadedClustersFlag && nextProps.loadedClustersFlag && nextProps.totalClustersSearchResult > 0 ) {
            this.setState({currentPage: 1});

            this.loadPageClusters(1, nextProps);
        }

        if ( !this.props.editRoleFlag && nextProps.editRoleFlag) {
            switch ( nextProps.currentTabRoleSystemName ) {
                case this.electionRoleSytemNames.clusterLeader:
                    this.getClusterLeaderAllocatedClusters(nextProps.activistDetails.election_roles_by_voter);
                    break;

                case this.electionRoleSytemNames.motivator:
                    this.getMotivatorAllocatedClusters(nextProps.activistDetails.election_roles_by_voter);
                    break;
            }
        }

        if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.clusterLeader &&
             nextProps.currentTabRoleSystemName == this.electionRoleSytemNames.clusterLeader ) {
            this.getClusterLeaderAllocatedClusters(nextProps.activistDetails.election_roles_by_voter);
        }

        if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.motivator &&
            nextProps.currentTabRoleSystemName == this.electionRoleSytemNames.motivator ) {
            this.getMotivatorAllocatedClusters(nextProps.activistDetails.election_roles_by_voter);
        }
    }

     getClusterLeaderAllocatedClusters(electionsRolesByVoter) {
        let activistAllocatedClusters = {};
        let roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.clusterLeader);

        for ( let clusterIndex = 0; clusterIndex < electionsRolesByVoter[roleIndex].activists_allocations_assignments.length; clusterIndex++ ) {
            let clusterKey =  electionsRolesByVoter[roleIndex].activists_allocations_assignments[clusterIndex].key;

            activistAllocatedClusters[clusterKey] = 1;
        }

        this.setState({activistAllocatedClusters});
    }

    getMotivatorAllocatedClusters(electionsRolesByVoter) {
        let activistAllocatedClusters = {};
        let roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.motivator);

        for ( let clusterIndex = 0; clusterIndex < electionsRolesByVoter[roleIndex].activists_allocations_assignments.length; clusterIndex++ ) {
            let clusterKey =  electionsRolesByVoter[roleIndex].activists_allocations_assignments[clusterIndex].cluster_key;

            activistAllocatedClusters[clusterKey] = 1;
        }

        this.setState({activistAllocatedClusters});
    }

    loadPageClusters(currentPage, nextProps = null) {
        let currentPageClusters = [];
        let clustersSearchResult = [];
        let totalClustersSearchResult = 0;
        let electionsRolesByVoter = [];
        let currentTabRoleSystemName = null;

        let bottomIndex = (currentPage - 1) * this.clustersPerPage;
        let topIndex = (currentPage * this.clustersPerPage) - 1;

        this.setState({currentPageClusters: []});

        if ( null == nextProps ) {
            clustersSearchResult= this.props.clustersSearchResult;
            totalClustersSearchResult = this.props.totalClustersSearchResult;

            currentTabRoleSystemName = this.props.currentTabRoleSystemName;
            electionsRolesByVoter = this.props.activistDetails.election_roles_by_voter;
        } else {
            clustersSearchResult = nextProps.clustersSearchResult;
            totalClustersSearchResult = nextProps.totalClustersSearchResult;

            currentTabRoleSystemName = nextProps.currentTabRoleSystemName;
            electionsRolesByVoter = nextProps.activistDetails.election_roles_by_voter;
        }

        if ( topIndex > (totalClustersSearchResult - 1) ) {
            topIndex = totalClustersSearchResult - 1;
        }

        for ( let clusterIndex = bottomIndex; clusterIndex <= topIndex; clusterIndex++ ) {
            currentPageClusters.push(clustersSearchResult[clusterIndex]);
        }

        this.setState({currentPageClusters});

        switch ( currentTabRoleSystemName ) {
            case this.electionRoleSytemNames.clusterLeader:
                this.getClusterLeaderAllocatedClusters(electionsRolesByVoter);
                break;

            case this.electionRoleSytemNames.motivator:
                this.getMotivatorAllocatedClusters(electionsRolesByVoter);
                break;
        }
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageClusters(pageIndex);
    }

    addGeoClusterToActivistRole(clusterKey) {
        let activistItem = this.props.activistDetails;
        let electionRoleByVoterKey = null;

        let roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);
        electionRoleByVoterKey = activistItem.election_roles_by_voter[roleIndex].key;

        ElectionsActions.addGeoClusterToActivistRole(this.props.dispatch, electionRoleByVoterKey, clusterKey, this.props.currentTabRoleId);
    }


    updateActivistRoleCluster(clusterKey) {
        switch ( this.props.currentTabRoleSystemName ) {
            case this.electionRoleSytemNames.clusterLeader:
                this.hideAlertUpdateLeaderModal();
                ElectionsActions.updateClusterLeader(this.props.dispatch, clusterKey, this.props.activistDetails.key);
                break;

            case this.electionRoleSytemNames.motivator:
                this.hideAlertUpdateMotivatorModal();
                this.addGeoClusterToActivistRole(clusterKey);
                break;
        }
    }

    replaceAssignmetClusterLeaderToCurrentActivist($assignmentClusterLeader){
        
        let that=this;
        AllocationAndAssignmentActions.deleteAssignmentClusterLeaderAndConnectAllocationToActivist(this.props.dispatch,$assignmentClusterLeader.activists_allocations_assignment_id,this.props.activistDetails.key).then(function(newAssignmentClusterLeader){
            that.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.MAKE_ACTIVIST_A_CLUSTER_LEADER, clusterDetails: newAssignmentClusterLeader });
            that.hideAlertUpdateLeaderModal();
        })
    }

    hideAlertUpdateLeaderModal() {
        let alertUpdateLeaderModal = this.state.alertUpdateLeaderModal;

        alertUpdateLeaderModal.show = false;
        alertUpdateLeaderModal.clusterKey = null;
        alertUpdateLeaderModal.clusterName = '';
        alertUpdateLeaderModal.clusterLeader = {
            first_name: '',
            last_name: '',
            personal_identity: '',
            verified_status: ''
        };
        this.setState({alertUpdateLeaderModal});
    }

    showAlertUpdateLeaderModal(clusterKey, clusterName, clusterLeader) {
        let alertUpdateLeaderModal = this.state.alertUpdateLeaderModal;
        alertUpdateLeaderModal.show = true;
        alertUpdateLeaderModal.clusterKey = clusterKey;
        alertUpdateLeaderModal.clusterName = clusterName;
        alertUpdateLeaderModal.clusterLeader = clusterLeader;
        this.setState({alertUpdateLeaderModal});
    }

    hideAlertUpdateMotivatorModal() {
        let alertUpdateMotivatorModal = this.state.alertUpdateMotivatorModal;

        alertUpdateMotivatorModal.show = false;
        alertUpdateMotivatorModal.clusterKey = null;
        alertUpdateMotivatorModal.clusterName = '';
        this.setState({alertUpdateMotivatorModal});
    }

    showAlertUpdateMotivatorModal(clusterKey, clusterName) {
        let alertUpdateMotivatorModal = this.state.alertUpdateMotivatorModal;

        alertUpdateMotivatorModal.show = true;
        alertUpdateMotivatorModal.clusterKey = clusterKey;
        alertUpdateMotivatorModal.clusterName = clusterName;
        this.setState({alertUpdateMotivatorModal});
    }

    isActivistLocked() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);

        return (activistItem.election_roles_by_voter[roleIndex].user_lock_id != null);
    }

    renderClusters() {
        let that = this;

		let clusters = null;
		if(this.state.currentPageClusters){
			clusters = this.state.currentPageClusters.map( function(clusterItem, index) {
				return <ClusterItem key={index} item={clusterItem} roleClustersHash={that.props.roleClustersHash}
                                currentUser={that.props.currentUser} currentTabRoleSystemName={that.props.currentTabRoleSystemName}
                                updateActivistRoleCluster={that.updateActivistRoleCluster.bind(that)}
                                showAlertUpdateModal={that.props.currentTabRoleSystemName == that.electionRoleSytemNames.clusterLeader
                                                      ? that.showAlertUpdateLeaderModal.bind(that)
                                                      : that.showAlertUpdateMotivatorModal.bind(that)}
                                activistAllocatedClusters={that.state.activistAllocatedClusters}
                                isActivistLocked={that.isActivistLocked()}/>
			});
		
			return <tbody>{clusters}</tbody>;
		}
		else{
			return null;
		}
    }

    getCounterTitle() {
        let counterTitle = 'מציג תוצאות ';
        let bottomIndex = (this.state.currentPage - 1) * this.clustersPerPage + 1;
        let topIndex = this.state.currentPage * this.clustersPerPage;

        if ( this.props.totalClustersSearchResult == 0 ) {
            return counterTitle;
        }

        if ( topIndex > this.props.totalClustersSearchResult ) {
            topIndex = this.props.totalClustersSearchResult;
        }

        counterTitle += bottomIndex + '-' + topIndex;

        return counterTitle;
    }

    render() {
        return (
            <div className={"containerStrip activists-clusters" + (this.props.loadingClustersFlag ? " hidden" : "")}>
                <div className="row rsltsTitleRow">
                    <div className="col-sm-4 rsltsTitle">
                        <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{this.props.totalClustersSearchResult}</span> אשכולות</h3>
                        <div className="showingCounter">{this.getCounterTitle()}</div>
                    </div>

                </div>
                <div className="tableList attribtnRslts">
                    <div className="table-responsive">
                        <table className="table table-frame standard-frame table-striped tableNoMarginB table-activist-clusters">
                            <thead>
                            <tr>
                                <th>עיר</th>
                                <th>שם אשכול</th>
                                <th>כתובת</th>
                                <th>מספר קלפיות</th>
                                <th>סטטוס שיבוץ</th>
                                <th>{'\u00A0'}</th>
                            </tr>
                            </thead>

                            {this.renderClusters()}
                        </table>
                    </div>
                </div>

                {( this.props.totalClustersSearchResult > this.clustersPerPage ) &&
                <div className="row">
                    <Pagination resultsCount={this.props.totalClustersSearchResult}
                                displayItemsPerPage={this.clustersPerPage}
                                currentPage={this.state.currentPage}
                                navigateToPage={this.navigateToPage.bind(this)}/>
                </div>
                }

                { (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.motivator) &&
                    <AlertUpdateMotivatorModal show={this.state.alertUpdateMotivatorModal.show}
                                               activistDetails={this.props.activistDetails}
                                               clusterKey={this.state.alertUpdateMotivatorModal.clusterKey}
                                               clusterName={this.state.alertUpdateMotivatorModal.clusterName}
                                               hideModal={this.hideAlertUpdateMotivatorModal.bind(this)}
                                               updateActivistRoleCluster={this.updateActivistRoleCluster.bind(this)}/>
                }

                { (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.clusterLeader) &&
                    <AlertUpdateLeaderModal show={this.state.alertUpdateLeaderModal.show}
                                            activistDetails={this.props.activistDetails}
                                            clusterKey={this.state.alertUpdateLeaderModal.clusterKey}
                                            clusterName={this.state.alertUpdateLeaderModal.clusterName}
                                            clusterLeader={this.state.alertUpdateLeaderModal.clusterLeader}
                                            hideModal={this.hideAlertUpdateLeaderModal.bind(this)}
                                            replaceAssignmetClusterLeaderToCurrentActivist={this.replaceAssignmetClusterLeaderToCurrentActivist.bind(this)}/>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activistDetails: state.elections.activistsScreen.activistDetails,

        loadingClustersFlag: state.elections.activistsScreen.loadingClustersFlag,
        loadedClustersFlag: state.elections.activistsScreen.loadedClustersFlag,

        clustersSearchResult: state.elections.activistsScreen.clustersSearchResult,
        totalClustersSearchResult: state.elections.activistsScreen.totalClustersSearchResult,

        clustersSearchFields: state.elections.activistsScreen.clustersSearchFields,

        editRoleFlag: state.elections.activistsScreen.editRoleFlag
    };
}

export default connect(mapStateToProps) (ClusterSearchResult);