import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import store from '../../../../store';

import SearchBallotsData from './SearchBallotsData';
import PollingSummaryActions from './PollingSummaryActions';
import PollingSummaryResult from './PollingSummaryResult';

import * as SystemActions from '../../../../actions/SystemActions';
import * as ElectionsActions from '../../../../actions/ElectionsActions';


class PollingSummary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            recordsPerPage: 30,

            currentPageRows: []
        };
    }

    componentWillMount() {
        this.screenPermission = 'elections.reports.ballots_summary';
        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( !this.props.currentUser.admin && this.props.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
        ElectionsActions.loadSupportStatusesForBallotsPolling(this.props.dispatch);
        ElectionsActions.loadCampaignsForBallotPolling(this.props.dispatch);

        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'דו"ח סיכומי קלפיות'});
    }

    componentDidMount() {
		/*
        let breadcrumbNewLocation = {
            elmentType: 'ballots',
            title: 'דו"ח סיכומי קלפיות',
            url: 'elections/reports/ballots_summary'
        };
        this.props.dispatch({type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: breadcrumbNewLocation});
		*/
	}

    componentWillReceiveProps(nextProps) {
        // Making sure that current user has been loaded
        if ( 0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            // Checking if user is permitted to use the resource
            if ( !nextProps.currentUser.admin && nextProps.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }
        if ( this.props.summaryResult.length == 0 && nextProps.summaryResult.length > 0 ) {
            this.setState({currentPage: 1});

            this.loadPageRows(1, nextProps);
        }
        if(this.state.currentPageRows.length == 0 && nextProps.summaryResult.length > 0 && this.props.summaryResult.length > 0){
            this.setState({currentPage: 1});

            this.loadPageRows(1, nextProps);
        }
		
    }
 

    loadPageRows(currentPage, nextProps = null) {
		 
        let currentPageRows = [];
        let summaryResult = [];
        let totalSummaryResults = 0;
	
        let bottomIndex = (currentPage - 1) * this.state.recordsPerPage;
        let topIndex = (currentPage * this.state.recordsPerPage) - 1;

        if ( !nextProps ) {
            summaryResult= this.props.summaryResult;
            totalSummaryResults = this.props.totalSummaryResults;
        } else {
            summaryResult = nextProps.summaryResult;
            totalSummaryResults = nextProps.totalSummaryResults;
        }
 

        if ( topIndex > (totalSummaryResults - 1) ) {
            topIndex = totalSummaryResults - 1;
        }
        let maxIndex = summaryResult.length;

        if(topIndex > maxIndex){
            topIndex = maxIndex;
        }
        for ( let rowIndex = bottomIndex; rowIndex <= topIndex; rowIndex++ ) {
            if(summaryResult.hasOwnProperty(rowIndex)){
				if(summaryResult[rowIndex]){
					currentPageRows.push(summaryResult[rowIndex]);
				}
            }
        }
        this.setState({currentPageRows});
    }

    loadMoreRows(nextPage, nextProps = null) {
        const maxRecoredsFromDb = 100;

        let totalSummaryResults = !nextProps ? this.props.totalSummaryResults : nextProps.totalSummaryResults;
        let summaryResult = !nextProps ? this.props.summaryResult : nextProps.summaryResult;
        let searchFields = !nextProps ? this.props.searchFields : nextProps.searchFields;
        // total number of pages
        let totalPages = Math.ceil(totalSummaryResults / this.state.recordsPerPage);
	
        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // number of rows in pages 1 - nextPage
        let nextPageNumOfHouseholds = nextPage * this.state.recordsPerPage;

        // If number of rows in pages from 1 till next page
        // are less than summaryResult rows, then there
        // is nothing to load
        if (nextPageNumOfHouseholds <= summaryResult.length) {
            return;
        }

        let currentDbPage = Math.floor( (nextPage * this.state.recordsPerPage) / maxRecoredsFromDb ) + 1;
        if(!this.props.loadingMoreData){ //If not already sent request for more data
            ElectionsActions.loadMoreBallotsPollingSummary(this.props.dispatch, searchFields, currentDbPage , this.loadPageRows.bind(this));
        }
       
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageRows(pageIndex);

        this.loadMoreRows(pageIndex + 1);
    }

    recordsPerPageChange(rowsPerPage) {
        this.setState({recordsPerPage: rowsPerPage});
    }

    loadNewPerPageRows() {
        this.navigateToPage(1);
    }

    render() {
        let currentCampaign= this.props.currentCampaign;
        let electionsCampaignsHash = {...this.props.electionsCampaignsHash}

        if(currentCampaign){
            electionsCampaignsHash['election_' + currentCampaign.id] = currentCampaign;
        }

        return (
            <div className="stripMain ballots-polling-summary">
                <div className="row">
                    <div className="col-md-6 text-right">
                        <h1>דו"ח סיכומי קלפיות</h1>
                    </div>
                </div>

                <SearchBallotsData/>
				
						
                { (this.props.totalSummaryResults > 0) &&
                    <PollingSummaryActions totalSummaryResults={this.props.totalSummaryResults}
                                       recordsPerPage={this.state.recordsPerPage}
                                       recordsPerPageChange={this.recordsPerPageChange.bind(this)}
                                       loadNewPerPageRows={this.loadNewPerPageRows.bind(this)}
                                       searchFields={this.props.searchFields}/>
                }

                { (this.props.totalSummaryResults > 0) &&
                    <PollingSummaryResult 
                                          searchFields={this.props.searchFields}
                                          supportStatuses={this.props.supportStatuses}
                                          electionsCampaignsHash={electionsCampaignsHash}
                                          currentCampaign={this.props.currentCampaign}
                                          currentPageRows={this.state.currentPageRows}
                                          totalSummaryResults={this.props.totalSummaryResults}
                                          displayItemsPerPage={this.state.recordsPerPage}
                                          currentPage={this.state.currentPage}
                                          currentDataLength={this.props.summaryResult.length}
                                          loadingMoreData={this.props.loadingMoreData}
                                          navigateToPage={this.navigateToPage.bind(this)}
                                          rowOfTotalSums={this.props.rowOfTotalSums}/>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,

        supportStatuses: state.elections.ballotsScreen.combos.supportStatuses,
        currentCampaign: state.system.currentCampaign,

        electionCampaigns: state.elections.ballotsScreen.combos.electionCampaigns,
        electionsCampaignsHash: state.elections.ballotsScreen.combos.electionsCampaignsHash,

        searchFields: state.elections.ballotsScreen.searchFields,
        loadingMoreData:state.elections.ballotsScreen.loadingMoreData,
        totalSummaryResults: state.elections.ballotsScreen.result.totalSummaryResults,
        summaryResult: state.elections.ballotsScreen.result.summaryResult,
        rowOfTotalSums: state.elections.ballotsScreen.result.rowOfTotalSums,

    }
}

export default connect(mapStateToProps) (withRouter(PollingSummary));