import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import store from '../../../../store';

import ClusterActivistSearch from './ClusterActivistSearch';
import ClusterActivistLoadingData from './ClusterActivistLoadingData';
import ClusterActivistActions from './ClusterActivistActions';
import ClusterActivistSearchResult from './ClusterActivistSearchResult';
import Pagination from '../../../global/Pagination';

import * as SystemActions from '../../../../actions/SystemActions';
import * as ElectionsActions from '../../../../actions/ElectionsActions';


class ClusterActivist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,

            recordsPerPage: 1,

            currentPageRows: [],

            displayClusterInSeperatePage: true
        };
        this.screenPermission = 'elections.reports.cluster_activists';
    }

    componentWillMount() {
        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( !this.props.currentUser.admin && this.props.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission );
        ElectionsActions.loadClusterElectionRoles(this.props.dispatch);

        this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'דוח פעילי אשכול'});
    }

    componentDidMount() {
        let breadcrumbNewLocation = {
            elmentType: 'clusters',
            title: 'דוח פעילי אשכול',
            url: 'elections/reports/cluster-activist'
        };
        this.props.dispatch({type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: breadcrumbNewLocation});
    }

    componentWillReceiveProps(nextProps) {
        // Making sure that current user has been loaded
        if (this.props.currentUser.first_name.length == 0 && nextProps.currentUser.first_name.length > 0) {
            // Checking if user is permitted to use the resource
            if ( !nextProps.currentUser.admin && nextProps.currentUser.permissions[this.screenPermission] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        if ( this.props.summaryResult.length == 0 && nextProps.summaryResult.length > 0 ) {
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
            if (rowIndex <= summaryResult.length - 1) {
                currentPageRows.push(summaryResult[rowIndex]);
            }
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
        ElectionsActions.loadMoreClusterActivistReport(this.props.dispatch, searchFields, currentDbPage);
    }

    navigateToPage(pageIndex) {
        const maxRecoredsFromDb = 100;
        let maxPage = Math.ceil((this.props.totalSummaryResults.length + maxRecoredsFromDb) / this.state.recordsPerPage)
        if (pageIndex > maxPage) {
            pageIndex = maxPage;
        }
        this.setState({currentPage: pageIndex});

        this.loadPageRows(pageIndex);

        this.loadMoreRows(pageIndex + 1);
    }

    recordsPerPageChange(recordsPerPage) {
        if (recordsPerPage > 100) {recordsPerPage = 100;}
        if (recordsPerPage < 0) {recordsPerPage = 0;}
        this.setState({recordsPerPage});
    }

    loadNewPerPageRows() {
        this.navigateToPage(1);
    }

    cancelSearch() {
        ElectionsActions.cancelClusterActivistReport();
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.UNSET_LOADING_DATA_FLAG});
    }

    displayClusterInSeperatePageChange(displayClusterInSeperatePage) {
        this.setState({displayClusterInSeperatePage});

        if ( displayClusterInSeperatePage ) {
            this.setState({recordsPerPage: 1});
        }
    }

    render() {
        return (
            <div className="container cluster-activist-report">
                <div className="row">
                    <div className="col-md-6 text-right">
                        <h1>דוח פעילי אשכול</h1>
                    </div>
                </div>

                <ClusterActivistSearch/>

                { (this.props.loadingData) &&
                    <ClusterActivistLoadingData cancelSearch={this.cancelSearch.bind(this)}/>
                }

                <div className="dtlsBox srchRsltsBox box-content">
                    <ClusterActivistActions displayClusterInSeperatePage={this.state.displayClusterInSeperatePage}
                                            displayClusterInSeperatePageChange={this.displayClusterInSeperatePageChange.bind(this)}
                                            totalSummaryResults={this.props.totalSummaryResults} searchFields={this.props.searchFields}
                                            recordsPerPage={this.state.recordsPerPage}
                                            recordsPerPageChange={this.recordsPerPageChange.bind(this)}
                                            loadNewPerPageRows={this.loadNewPerPageRows.bind(this)}
                                            currentUser={this.props.currentUser}/>

                    { (this.props.totalSummaryResults > 0 ) &&
                        <ClusterActivistSearchResult currentUser={this.props.currentUser}
                                                     totalSummaryResults={this.props.totalSummaryResults}
                                                     currentPageRows={this.state.currentPageRows}
                                                     searchFields={this.props.searchFields} electionRoles={this.props.electionRoles}/>
                    }
                </div>

                { (this.props.totalSummaryResults > this.state.recordsPerPage) &&
                <Pagination resultsCount={this.props.totalSummaryResults}
                            displayItemsPerPage={this.state.recordsPerPage}
                            currentPage={this.state.currentPage}
                            navigateToPage={this.navigateToPage.bind(this)}/>
                }
				<br/><br/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,

        electionRoles: state.elections.clustersScreen.combos.electionRoles,

        loadingData: state.elections.clustersScreen.loadingData,

        searchFields: state.elections.clustersScreen.searchFields,

        totalSummaryResults: state.elections.clustersScreen.result.totalSummaryResults,
        summaryResult: state.elections.clustersScreen.result.summaryResult
    }
}

export default connect(mapStateToProps) (withRouter(ClusterActivist));