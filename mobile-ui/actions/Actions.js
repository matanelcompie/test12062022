import Axios from 'axios'; 

export const ActionTypes = {
    SET_USER_DATA: 'SET_USER_DATA',
    LOGIN_ERROR: 'LOGIN_ERROR',
    DISPLAY_WARNING_MODAL: 'DISPLAY_WARNING_MODAL',
    USER_LOGOUT: 'USER_LOGOUT',
    SET_VOTER_DATA: 'SET_VOTER_DATA',
    SET_VOTER_AFTER_VOTING_STATE: 'SET_VOTER_AFTER_VOTING_STATE',
    SET_VOTER_REPORTING_HISTORY: 'SET_VOTER_REPORTING_HISTORY',
}
export function login(dispatch, loginDetails){

    Axios({
        url: window.Laravel.baseURL + 'api/votes/reporting/login',
        method: 'post'  ,
        data: loginDetails
    }).then(function (response) {
        dispatch({type: ActionTypes.SET_USER_DATA, userData: response.data.data});
        dispatch({type: ActionTypes.LOGIN_ERROR, errorData: null});
    }, function (error) {
        // errorHandler(error, dispatch);
        let response = error.response || false;
        if (response) {
            let data = response.data || false;
            dispatch({type: ActionTypes.LOGIN_ERROR, errorData: data});
        }

    });
}
export function logout(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/votes/reporting/logout',
        method: 'post',
    }).then(function (response) {
            dispatch({ type: ActionTypes.USER_LOGOUT });
        }, function (error) {
            errorHandler(error, dispatch);
        });
}
export function searchVoter(dispatch, voter_serial_number) {
    let requestData = { voter_serial_number: voter_serial_number };
    Axios({
        url: window.Laravel.baseURL + 'api/votes/reporting/search',
        method: 'get',
        params: requestData
    }).then(function (response) {
        dispatch({ type: ActionTypes.SET_VOTER_DATA, voterData: response.data.data });
    }, function (error) {
        errorHandler(error, dispatch);
    });
}
export function addVoteToVoter(dispatch, voterData){

    Axios({
        url: window.Laravel.baseURL + 'api/votes/reporting/voting/' + voterData.voter_key,
        method: 'put'  ,
    }).then(function (response) {
        getReportingHistory(dispatch);
        if(response.data.data){
            dispatch({type: ActionTypes.SET_VOTER_AFTER_VOTING_STATE});
        }
    }, function (error) {
        errorHandler(error, dispatch);
    });
}
export function cancelVoteToVoter(dispatch, voter_key, voter_serial_number){
    Axios({
        url: window.Laravel.baseURL + 'api/votes/reporting/voting/' + voter_key,
        method: 'delete'  ,
    }).then(function (response) {
        dispatch({ type: ActionTypes.SET_VOTER_REPORTING_HISTORY, data: response.data.data});
        if (voter_serial_number) {
            searchVoter(dispatch, voter_serial_number);
        }
    }, function (error) {
        errorHandler(error, dispatch);
    });
}
export function getReportingHistory(dispatch){

    Axios({
        url: window.Laravel.baseURL + 'api/votes/reporting/history',
        method: 'get'  ,
    }).then(function (response) {
        dispatch({ type: ActionTypes.SET_VOTER_REPORTING_HISTORY, data: response.data.data});
        }, function (error) {
            errorHandler(error, dispatch);
        });
}
function errorHandler(error, dispatch) {
    let response = error.response || false;
    if (response) {
        let data = response.data || false;
        if (response.status == 401) {
            let message = data.error_code == 'M004' ? 'התפקיד נמצא בשימוש' : 'זמן הכניסה עבר';
            dispatch({ type: ActionTypes.DISPLAY_WARNING_MODAL,display:true, message:message });
        } else {
            let errorCode = data.error_code || false;

        }
    }
}
