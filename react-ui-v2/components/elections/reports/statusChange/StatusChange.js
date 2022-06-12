import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import store from '../../../../store';

import StatusChangeSearch from  './StatusChangeSearch';
import StatusChangeActions from './StatusChangeActions';
import StatusChangeSearchResult from './StatusChangeSearchResult';
import StatusChangeLoadingData from './StatusChangeLoadingData';

import * as SystemActions from '../../../../actions/SystemActions';
import * as ElectionsActions from '../../../../actions/ElectionsActions';


class StatusChange extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            recordsPerPage: 30,

            currentPageRows: [],

            sortDetails: {
                byField: null,
                direction: null
            },

            // Make sure no result is displayed
            // when component was just mounted
            buttonSearchClicked: false
        };
        this.screenPermission = 'elections.reports.support_status_changes';
    }

    componentWillMount() {
        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( !this.props.currentUser.admin && this.props.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
        ElectionsActions.loadSupportStatusesForStatusReport(this.props.dispatch);

        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'דו"ח שינויי סטטוסים'});
    }

    componentDidMount() {
        let breadcrumbNewLocation = {
            elmentType: 'statuses',
            title: 'דו"ח שינויי סטטוסים',
            url: 'elections/reports/support_status_change'
        };
        this.props.dispatch({type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: breadcrumbNewLocation});
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

            this.loadMoreRows(3, nextProps);
        }
    }

    buttonSearchClickedChange(value=true) {
        this.setState({buttonSearchClicked: value});
    }

    resetSortDetails() {
        let sortDetails = this.state.sortDetails;

        sortDetails.byField = null;
        sortDetails.direction = null;
        this.setState({sortDetails});
    }

    loadPageRows(currentPage, nextProps = null) {
        let currentPageRows = [];
        let summaryResult = [];
        let totalSummaryResults = 0;

        let bottomIndex = (currentPage - 1) * this.state.recordsPerPage;
        let topIndex = (currentPage * this.state.recordsPerPage) - 1;

        this.setState({currentPageRows: []});

        if ( null == nextProps ) {
            summaryResult= this.props.summaryResult;
            totalSummaryResults = this.props.totalSummaryResults;
        } else {
            summaryResult = nextProps.summaryResult;
            totalSummaryResults = nextProps.totalSummaryResults;
        }

        if ( topIndex > (totalSummaryResults - 1) ) {
            topIndex = totalSummaryResults - 1;
        }

        for ( let rowIndex = bottomIndex; rowIndex <= topIndex; rowIndex++ ) {
            currentPageRows.push(summaryResult[rowIndex]);
        }

        this.setState({currentPageRows});
    }

    loadMoreRows(nextPage, nextProps = null) {
        const maxRecoredsFromDb = 100;

        let totalSummaryResults = (null == nextProps) ? this.props.totalSummaryResults : nextProps.totalSummaryResults;
        let summaryResult = (null == nextProps) ? this.props.summaryResult : nextProps.summaryResult;
        let searchFields = (null == nextProps) ? this.props.searchFields : nextProps.searchFields;

        // total number of pages
        let totalPages = Math.ceil(totalSummaryResults / this.state.recordsPerPage);

        // Checking if we are in the last page
        if (nextPage > totalPages) {
            return;
        }

        // number of rows in pages 1 - nextPage
        let nextPageNumOfRecords= nextPage * this.state.recordsPerPage;

        // If number of rows in pages from 1 till next page
        // are less than summaryResult rows, then there
        // is nothing to load
        if (nextPageNumOfRecords <= summaryResult.length) {
            return;
        }

        let currentDbPage = Math.floor( (nextPage * this.state.recordsPerPage) / maxRecoredsFromDb ) + 1;

        let sortDetails = this.state.sortDetails;
        if ( null == sortDetails.byField ) {
            ElectionsActions.loadMoreStatusChangesReport(this.props.dispatch, searchFields, currentDbPage);
        } else {
            ElectionsActions.loadMoreStatusChangesReport(this.props.dispatch, searchFields, currentDbPage, sortDetails.byField,
                                                         sortDetails.direction);
        }
    }

    navigateToPage(pageIndex) {
        this.setState({currentPage: pageIndex});

        this.loadPageRows(pageIndex);

        this.loadMoreRows(pageIndex + 1);
        this.loadMoreRows(pageIndex + 2);
    }

    recordsPerPageChange(rowsPerPage) {
        this.setState({recordsPerPage: rowsPerPage});
    }

    loadNewPerPageRows() {
        this.navigateToPage(1);
    }

    cancelSearch() {
        ElectionsActions.cancelStatusChangeReport();

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.UNSET_LOADING_DATA_FLAG});
    }

    sortSupportStatus(sortByField, sortDirection) {
        let sortDetails = this.state.sortDetails;

        sortDetails.byField = sortByField;
        sortDetails.direction = sortDirection;
        this.setState({sortDetails});

        ElectionsActions.displayStatusChangeReport(this.props.dispatch, this.props.searchFields, sortByField, sortDirection);
    }

    render() {
        return (
            <div className="stripMain status-change-report">
                <div className="row">
                    <div className="col-md-6 text-right">
                        <h1>דו"ח שינויי סטטוסים</h1>
                    </div>
                </div>

                <StatusChangeSearch resetSortDetails={this.resetSortDetails.bind(this)}
                                    buttonSearchClickedChange={this.buttonSearchClickedChange.bind(this)}/>

                { (this.props.loadingData) &&
                    <StatusChangeLoadingData cancelSearch={this.cancelSearch.bind(this)}/>
                }

                <StatusChangeActions totalSummaryResults={this.props.totalSummaryResults} recordsPerPage={this.state.recordsPerPage}
                                     recordsPerPageChange={this.recordsPerPageChange.bind(this)}
                                     loadNewPerPageRows={this.loadNewPerPageRows.bind(this)} searchFields={this.props.searchFields}
                                     sortByField={this.state.sortDetails.byField} sortDirection={this.state.sortDetails.direction}
                                     loadingData={this.props.loadingData}
                                     buttonSearchClicked={this.state.buttonSearchClicked}/>

                <StatusChangeSearchResult searchFields={this.props.searchFields}
                                          supportStatuses={this.props.supportStatuses}
                                          totalSummaryResults={this.props.totalSummaryResults}
                                          sortSupportStatus={this.sortSupportStatus.bind(this)}
                                          rowOfTotalSums={this.props.rowOfTotalSums} currentPageRows={this.state.currentPageRows}
                                          displayItemsPerPage={this.state.recordsPerPage} currentPage={this.state.currentPage}
                                          navigateToPage={this.navigateToPage.bind(this)}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,

        supportStatuses: state.elections.statusesScreen.combos.supportStatuses,

        loadingData: state.elections.statusesScreen.loadingData,

        searchFields: state.elections.statusesScreen.searchFields,

        totalSummaryResults: state.elections.statusesScreen.result.totalSummaryResults,
        summaryResult: state.elections.statusesScreen.result.summaryResult,
        rowOfTotalSums: state.elections.statusesScreen.result.rowOfTotalSums
    }
}

export default connect(mapStateToProps) (withRouter(StatusChange));