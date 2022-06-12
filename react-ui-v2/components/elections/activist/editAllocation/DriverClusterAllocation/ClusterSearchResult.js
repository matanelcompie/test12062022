import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Pagination from 'components/global/Pagination';
import ClusterItem from './ClusterItem';

import * as ElectionsActions from 'actions/ElectionsActions';


class ClusterSearchResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedClusters: {},

            currentPage: null,

            currentPageClusters: [],

            activistAllocatedClusters: {}
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;

        this.clustersPerPage = 30;
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.editDriverClusterFlag && nextProps.editDriverClusterFlag) {
            this.setState({selectedClusters: {}});
        }

        if ( !this.props.loadingClusters && nextProps.loadingClusters ) {
            this.setState({currentPage: 1, currentPageClusters});
        }

        if ( !this.props.loadedClusters && nextProps.loadedClusters && nextProps.totalClustersSearchResult > 0 ) {
            this.setState({currentPage: 1});

            this.loadPageClusters(1, nextProps);
        }

        if ( !this.props.editDriverClusterFlag && nextProps.editDriverClusterFlag) {
            this.loadPageClusters(this.state.currentPage, nextProps);
        }
    }

    getAllocatedClusters(electionsRolesByVoter) {
        let activistAllocatedClusters = {};
        let roleIndex = electionsRolesByVoter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.driver);

        for ( let clusterIndex = 0; clusterIndex < electionsRolesByVoter[roleIndex].activists_allocations_assignments.length; clusterIndex++ ) {
            let clusterKey =  electionsRolesByVoter[roleIndex].activists_allocations_assignments[clusterIndex].cluster_key;

            activistAllocatedClusters[clusterKey] = 1;
        }

        this.setState({activistAllocatedClusters});

        return activistAllocatedClusters;
    }

    loadPageClusters(currentPage, nextProps = null) {
        let currentPageClusters = [];
        let clustersSearchResult = [];
        let totalClustersSearchResult = 0;
        let electionsRolesByVoter = [];

        let bottomIndex = (currentPage - 1) * this.clustersPerPage;
        let topIndex = (currentPage * this.clustersPerPage) - 1;

        this.setState({currentPageClusters: []});

		
        if ( null == nextProps ) {
            clustersSearchResult= this.props.clustersSearchResult;
            totalClustersSearchResult = this.props.totalClustersSearchResult;
            electionsRolesByVoter = this.props.activistDetails.election_roles_by_voter;
        } else {
            clustersSearchResult = nextProps.clustersSearchResult;
            totalClustersSearchResult = nextProps.totalClustersSearchResult;

            electionsRolesByVoter = nextProps.activistDetails.election_roles_by_voter;
        }

        if ( topIndex > (totalClustersSearchResult - 1) ) {
            topIndex = totalClustersSearchResult - 1;
        }

        let activistAllocatedClusters = this.getAllocatedClusters(electionsRolesByVoter);
		 
        for ( let clusterIndex = bottomIndex; clusterIndex <= topIndex; clusterIndex++ ) {
			if(clustersSearchResult[clusterIndex]){
				currentPageClusters.push(clustersSearchResult[clusterIndex]);
			}
        }
 

        this.setState({currentPageClusters});
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageClusters(pageIndex);
    }

    changeClickedCluster(clusterKey) {
        let selectedClusters = this.state.selectedClusters;

        if ( 1 == selectedClusters[clusterKey] ) {
            delete selectedClusters[clusterKey];
        } else {
            selectedClusters[clusterKey] = 1;
        }

        this.setState({selectedClusters});
    }
	
	selectUnselectAll(e) {
		let selectedClusters = [];
		if(e.target.checked){
        
			for(let i = 0 ; i < this.state.currentPageClusters.length ; i++){
				let clusterKey =  this.state.currentPageClusters[i].key;
				selectedClusters[clusterKey] = 1;
       
			}
		}
 
        this.setState({selectedClusters}); 
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
                                clusterChecked={that.state.selectedClusters[clusterItem.key] == 1}
                                changeClickedCluster={that.changeClickedCluster.bind(that)}
                                activistAllocatedClusters={that.state.activistAllocatedClusters}
                                isActivistLocked={that.isActivistLocked()} editPermission={that.checkEditPermissions()}/>
			});

			return <tbody>{clusters}</tbody>;
		}
		else{
			return null;
		}
    }

    getSelectedClustersNumber() {
        let title = '';

        if ( Object.keys(this.state.selectedClusters).length > 0 ) {
            title = 'נבחרו: ' + Object.keys(this.state.selectedClusters).length + ' אשכולות';
        } else {
            title = 'לא נבחרו אשכולות';
        }

        return title;
    }

    addClustersToDrivers() {
        let activistItem = this.props.activistDetails;
        let electionRoleByVoterKey = null;

        let driverClusters = [];
        let clusterKey = '';

        let roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == this.props.currentTabRoleId);
        electionRoleByVoterKey = activistItem.election_roles_by_voter[roleIndex].key;

		
        for ( clusterKey in this.state.selectedClusters ) {
			if(clusterKey != 'sum'){
				driverClusters.push(clusterKey);
			}
        }
        ElectionsActions.addClustersToDriver(this.props.dispatch, electionRoleByVoterKey, driverClusters, this.props.currentTabRoleId);
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

    checkEditPermissions() {
        return ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.driver.edit'] == true) ;
    }

    /**
     * This function renders the add button if
     * the current user has edit driver permission.
     *
     * @returns {*}
     */
    renderAddButton() {
        if ( !this. isActivistLocked() && this.checkEditPermissions() ) {
            return (
                <button title="הוסף" className="btn btn-primary srchBtn"
                        disabled={Object.keys(this.state.selectedClusters).length == 0}
                        onClick={this.addClustersToDrivers.bind(this)}>
                    <span>הוסף</span>
                </button>
            );
        } else {
            return '\u00A0';
        }
    }

    render() {
        return (
            <div className={"driver-clusters containerStrip" + (this.props.loadingClusters ? " hidden" : "")}>
                <div className="row rsltsTitleRow">
                    <div className="col-sm-4 rsltsTitle">
                        <h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{this.props.totalClustersSearchResult}</span> אשכולות</h3>
                        <div className="showingCounter">{this.getCounterTitle()}</div>
                    </div>

                    <div className="col-lg-8 rsltsTitle flexed-center flex-end">
                        <div className="item-space">{this.getSelectedClustersNumber()}</div>
                        {this.renderAddButton()}
                    </div>
                </div>

                <div className="tableList attribtnRslts">
                    <div className="table-responsive">
                        <table className="table table-frame table-multi-line table-striped tableNoMarginB">
                            <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" onChange={this.selectUnselectAll.bind(this)}
                                           disabled={!this.checkEditPermissions() || this.isActivistLocked()}/>
                                </th>
                                <th>שם אשכול</th>
                                <th>כתובת</th>
                                <th>מספר קלפיות</th>
                                <th>סטטוס שיבוץ</th>
                                <th>כמות הסעות</th>
                                <th>כמות הסעות נכה</th>
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
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activistDetails: state.elections.activistsScreen.activistDetails,

        loadingClusters:  state.elections.activistsScreen.loadingClusters,
        loadedClusters: state.elections.activistsScreen.loadedDriverClustersFlag,
        totalClustersSearchResult: state.elections.activistsScreen.totalDriverClustersSearchResult,
        clustersSearchResult: state.elections.activistsScreen.driversClustersSearchResult,

        clustersSearchFields: state.elections.activistsScreen.driverClustersSearchFields,

        editDriverClusterFlag: state.elections.activistsScreen.editDriverClusterFlag
    };
}

export default connect(mapStateToProps) (ClusterSearchResult);