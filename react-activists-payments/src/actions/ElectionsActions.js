import Axios from 'axios';
import _ from 'lodash';
import * as SystemActions from './SystemActions';
// import * as VoterActions from './VoterActions';
import errors from '../libs/errors'
import constants from '../libs/constants';

export const DragTypes = {
    EXAMPLE_DND_SORT: "EXAMPLE_DND_SORT",
    CANDIDATE_ROW_DND_ROW: "CANDIDATE_ROW_DND_ROW",
    COUNCIL_MEMBER_ROW_DND_ROW: "COUNCIL_MEMBER_ROW_DND_ROW"
}

export const ActionTypes = {
    
    GENERAL:{
        iTEM_CHANGE: 'iTEM_CHANGE',
    },
    ACTIVIST: {
        CLEAN_SCREEN: 'ACTIVIST.CLEAN_SCREEN',
        LOAD_CURRENT_USER_GEOGRAPHIC_FILTERS: 'ACTIVIST.LOAD_CURRENT_USER_GEOGRAPHIC_FILTERS',
        LOAD_ELECTION_ROLES: 'ACTIVIST.LOAD_ELECTION_ROLES',/*yes*/
        LOAD_ELECTION_ROLES_BUDGET: 'ACTIVIST.LOAD_ELECTION_ROLES_BUDGET',/*yes*/
        LOAD_CITY_ELECTION_ROLES_BUDGET: 'ACTIVIST.LOAD_CITY_ELECTION_ROLES_BUDGET',
        LOAD_ELECTION_ROLES_SHIFTS: 'ACTIVIST.LOAD_ELECTION_ROLES_SHIFTS',/*yes*/
        SEARCH_INPUT_FIELD_CHANGE: 'ACTIVIST.SEARCH_INPUT_FIELD_CHANGE',
        LOAD_ACTIVISTS_SEARCH_RESULT: 'ACTIVIST.LOAD_ACTIVISTS_SEARCH_RESULT',/*yes*/
        RESET_ACTIVISTS_SEARCH_RESULT: 'ACTIVIST.RESET_ACTIVISTS_SEARCH_RESULT',/*yes*/
        LOADING_REPORT_RESULTS_STATUS_CHANGED: 'ACTIVIST.LOADING_REPORT_RESULTS_STATUS_CHANGED',/*yes*/
    }

};

// var electionDayDashboardCancelTokensList = [];

var activistSearchCancelToken = Axios.CancelToken;
var activistSearchSource;

// var generalReportCancelToken = Axios.CancelToken;
// var generalReportSource;

// var statusCancelToken = Axios.CancelToken;
// var statusSource;

// var ballotCancelToken = Axios.CancelToken;
// var ballotSource;

// var captain50CancelToken = Axios.CancelToken;
// var captain50Source;

// var clusterReportCancelToken = Axios.CancelToken;
// var clusterReportSource;

// var householdSearchCancelToken = Axios.CancelToken;
// var householdSearchSource;




/**---------------------------- */



export function loadElectionRolesCampaignBudget(dispatch, campaignKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/campaigns/' + campaignKey + '/budgets/roles',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_ELECTION_ROLES_SHIFTS, electionRolesShiftsBudgets: response.data.data });
    }, function (error) {
    });
}

//--/*needs */
export function searchElectionsActivists(dispatch, searchObj,nameDispatch=false) {
    activistSearchSource = activistSearchCancelToken.source();

    dispatch({ type: ActionTypes.ACTIVIST.RESET_ACTIVISTS_SEARCH_RESULT });
    dispatch({ type: ActionTypes.ACTIVIST.LOADING_REPORT_RESULTS_STATUS_CHANGED, isLoadingResults: true });
    Axios({
        url: window.Laravel.baseURL + 'api/elections/activists/search',
        method: 'get',
        params: searchObj,
        cancelToken: activistSearchSource.token
    }).then(function (response) {
        let activists = response.data.data.voters;
        let totalRecords = response.data.data.recordsCount;
        if(!nameDispatch)
        dispatch({ type: ActionTypes.ACTIVIST.LOAD_ACTIVISTS_SEARCH_RESULT, activists, totalRecords });
        else
        dispatch({ type: ActionTypes.ACTIVIST[nameDispatch], activists, totalRecords });

        dispatch({ type: ActionTypes.ACTIVIST.LOADING_REPORT_RESULTS_STATUS_CHANGED, isLoadingResults: false });
    }, function (error) {
        dispatch({ type: ActionTypes.ACTIVIST.LOADING_REPORT_RESULTS_STATUS_CHANGED, isLoadingResults: false });
        console.log(error);
    });
}
// Need to Add in api!!/*needs */
/*needs */
export function loadElectionRoles(dispatch) {
    debugger
    Axios({
        url: window.Laravel.baseURL + 'api/elections/roles',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.ACTIVIST.LOAD_ELECTION_ROLES, electionRoles: response.data.data });
    }, function (error) {
        console.log(error);
    });
}
export function loadElectionRolesBudget(dispatch, cityKey = null) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/roles/budget',
        method: 'get',
        params: { city_key: cityKey }
    }).then(function (response) {
        dispatch({ type: ActionTypes.ACTIVIST.LOAD_ELECTION_ROLES_BUDGET, electionRolesBudget: response.data.data });
    }, function (error) {
        console.log(error);
    });
}


/*needs */
export function loadElectionRolesShifts(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/roles/shifts',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.ACTIVIST.LOAD_ELECTION_ROLES_SHIFTS, electionRolesShifts: response.data.data });
    }, function (error) {
        console.log(error);
    });
}

/*needs */
export function loadCurrentElectionRolesCampaignBudget(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/campaigns/budgets/shift/roles',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_CURRENT_ELECTION_ROLES_SHIFTS, electionRolesShiftsBudgets: response.data.data });
    }, function (error) {
    });
}
export function loadElectionRolesForElectionsCampaigns(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/roles',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_ELECTION_ROLES, electionRoles: response.data.data });
    }, function (error) {
    });
}


/**
 * @function
 * display error message modal
 * @param error - error data;
 * Need to replace all the errors with this function.
 * @returns void.
 */
// function displayErrorMessage(error, dispatch){
//     let response = error.response || false;
//     if (response) {
//         let data = response.data || false;
//         // console.log(data);
//         if (data) {
//             let errorCode = data.error_code || false;
//             if (errorCode && errors[errorCode]) {
//                 dispatch({ type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: errors[errorCode] });
//             }
//         }
//     }

// }
