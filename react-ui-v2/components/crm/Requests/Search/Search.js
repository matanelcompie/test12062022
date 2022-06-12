import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as CrmActions from '../../../../actions/CrmActions';
import * as SystemActions from '../../../../actions/SystemActions';
import SearchContainer from './SearchContainer';
import SearchResults from './SearchResults';
import globalSaving from '../../../hoc/globalSaving';

class RequestSearch extends React.Component {

    constructor(props) {
        super(props);
        this.isPermissionsLoaded = false;
    }

    componentWillMount() {
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'שאילתת פניות' });
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        this.checkPermissions();
    }

    componentDidUpdate() {
        this.checkPermissions();
    }

    checkPermissions() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['crm.requests.search'])) {
                CrmActions.loadCities(this.props.dispatch);
                CrmActions.loadTeams(this.props.dispatch, 1);
                CrmActions.loadTopics(this.props.dispatch);
                CrmActions.loadPriority(this.props.dispatch);
                CrmActions.loadStatus(this.props.dispatch);
                CrmActions.loadStatusTypes(this.props.dispatch);
                CrmActions.loadUsers(this.props.dispatch);
                CrmActions.requestActionTypes(this.props.dispatch);
                CrmActions.getRequestClosureReasonByKey(this.props.dispatch);
                CrmActions.getRequestSatisfactionVoter(this.props.dispatch);
            } else {
                this.props.router.replace('/unauthorized');
            }
        }
        //     ->name('crm.requests.print'); required permission!
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['crm.requests.print'] == true) {
            this.printResultsItem = 
            <div style={{float:'left'}}>
            <a title="הדפס אקסל" style={{ cursor: 'pointer' ,marginLeft:'7px'}} onClick={this.printResults.bind(this,true)} className="icon-box excel"></a>
              
            <a title="הדפסה" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this)} className="icon-box print"></a>
            </div>
        }
    }
    /**
     * @method printResults
     * print the results
     * @returns void
     */
    printResults(isExcel=false) {
        let clearedSerachFilters = this.props.clearedSerachFilters;
        clearedSerachFilters.order_by = this.props.resultsOrderColumn;
        clearedSerachFilters.direction = this.props.isResultsOrderedAsc ? 'desc' : 'asc';
        var queryString = $.param(clearedSerachFilters); // Convert the search filters to query string params (jquery)
        let url = window.Laravel.baseURL + 'api/crm/requests/search/print?' + queryString;
        if(isExcel){
            url = window.Laravel.baseURL + 'api/crm/requests/search/print_excel?' + queryString;
        }
        
        window.open(url, '_blank');
    }

    
    render() {
        let resultCnt = this.props.searchResults.length ;
        this.searchResultsCountStyle = { fontSize: '24px', fontWeight: '600', color: '#323a6b',marginBottom:'20px',paddingLeft:'15px' };
        let foundResultText = (resultCnt>0) ? ('נמצאו ' + resultCnt + ' רשומות ') : 'לא נמצאו רשומות';

        return (
            <div>
				<h1>שאילתת פניות</h1>
                <SearchContainer />
                <div style={this.searchResultsCountStyle}>
                    <span>{foundResultText}</span>
                   {(resultCnt>0) ? this.printResultsItem : ''}
                </div>
                <SearchResults currentUser={this.props.currentUser} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        clearedSerachFilters: state.crm.requestSearch.clearedSerachFilters,
        searchResults: state.crm.requestSearch.searchResults,
        resultsOrderColumn: state.crm.requestSearch.resultsOrderColumn,
        isResultsOrderedAsc: state.crm.requestSearch.isResultsOrderedAsc,
        currentUser: state.system.currentUser,
    };
}
export default globalSaving(connect(mapStateToProps)(withRouter(RequestSearch)));
