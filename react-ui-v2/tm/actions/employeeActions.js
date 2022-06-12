import Axios from 'axios';
import * as SystemActions from './systemActions';
import * as CampaignActions from './campaignActions';
import errors from 'libs/errors';

export const types = {
    GET_EMPLOYEES_SUCCESS: 'GET_EMPLOYEES_SUCCESS',
    ADD_EMPLOYEE_SUCCESS: 'ADD_EMPLOYEE_SUCCESS',
    ON_EDIT_EMPLOYEE: 'ON_EDIT_EMPLOYEE',
    ON_EDITED_EMPLOYEE_CHANGE: 'ON_EDITED_EMPLOYEE_CHANGE',
    UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE: 'UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE',
    GET_EMPLOYEE_SUCCESS: 'GET_EMPLOYEE_SUCCESS',
    ON_CANCEL_UPDATE_EMPLOYEE: 'ON_CANCEL_UPDATE_EMPLOYEE',
    DELETE_EMPLOYEE_SUCCESS: 'DELETE_EMPLOYEE_SUCCESS',
    UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE: 'UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE',
    ON_OPEN_MODAL_ADD_EMPLOYEE: 'ON_OPEN_MODAL_ADD_EMPLOYEE',
    ON_CLOSE_MODAL_ADD_EMPLOYEE: 'ON_CLOSE_MODAL_ADD_EMPLOYEE',
    LOADED_TEAMS: 'LOADED_TEAMS',
    LOADED_ROLES: 'LOADED_ROLES',
}

export function getEmployeeList(campaignKey, onInitEmployeeTable = false) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}/employees`,
            method: "get"
        }).then(result => {
            dispatch(getEmployeeListSuccess(result.data.data));
            if(!onInitEmployeeTable){
                dispatch({ type: SystemActions.types.CHANGES_SAVED });
            }

        }).catch(error => {
            displayErrorMessage(error, dispatch);
        })
    }
}

function getEmployeeListSuccess(data) {
    return { type: types.GET_EMPLOYEES_SUCCESS, data };
}

export function onEditEmployee(employeeKey) {
    return {
        type: types.ON_EDIT_EMPLOYEE,
        employeeKey
    }
}

export function onEditedEmployeeChange(employee) {
    return {
        type: types.ON_EDITED_EMPLOYEE_CHANGE,
        employee
    }
}

export function onUpdateEmployee(employeeKey, updateDetails, campaignKey) {
    return function (dispatch) {
        dispatch({type: SystemActions.types.SAVING_CHANGES});
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}/employees/${employeeKey}`,
            method: "put",
            data: updateDetails
        }).then(result => {
            getEmployeeList(campaignKey)(dispatch);
        }, error => {
            displayErrorMessage(error, dispatch);
        })
    }
}

export function onCancelUpdateEmployee() {
    return {type: types.ON_CANCEL_UPDATE_EMPLOYEE}
}

export function onUpdateAddEmployeeErrorMsg(errorMessage) {
    return {type:types.UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE,errorMessage}
}

export function onCancelAddNewEmployee(employeeKey) {
    return {type: types.DELETE_EMPLOYEE_SUCCESS,employeeKey}
}

export function deleteEmployee(employeeKey, campaignKey) {
    return function (dispatch) {
        dispatch({type: SystemActions.types.SAVING_CHANGES});
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}/employees/${employeeKey}`,
            method: "delete"
        }).then(result => {
            getEmployeeList(campaignKey)(dispatch);
        }).catch(error => {
            displayErrorMessage(error, dispatch);
        })
    }
}

export function onOpenModalAddEmployee() {
    return {
        type: types.ON_OPEN_MODAL_ADD_EMPLOYEE
    }
}

export function onCloseModalAddEmployee() {
    return {
        type: types.ON_CLOSE_MODAL_ADD_EMPLOYEE
    }
}

export function searchEmployee(personalIdentity) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/tm/campaigns/employees?identity=' + personalIdentity,
            method: "get"
        }).then(result => {
            dispatch({ type: types.ADD_EMPLOYEE_SUCCESS, employee: result.data.data });
        }, error => {
            dispatch({ type: types.UPDATE_ADD_EMPLOYEE_ERROR_MESSAGE,errorMessage:'לא קיים משתמש עם ת"ז שהוזן' });
        })
    }
}

export function addEmployee(employee, campaignKey) {
 
    return function (dispatch) {
        dispatch({type: SystemActions.types.SAVING_CHANGES});
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}/employees`,
            method: "post",
            data: employee
        }).then(result => {
            getEmployeeList(campaignKey)(dispatch);
        }, error => {
            dispatch({ type: SystemActions.types.CHANGES_NOT_SAVED });
            displayErrorMessage(error, dispatch);
        })
    }
}

export function loadTeams(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/teams',
        method: "get"
    }).then(function (result) {
        dispatch({ type: types.LOADED_TEAMS, data: result.data.data });
    })

}

export function loadRoles(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/allRoles',
        method: "get"
    }).then(function (result) {
        dispatch({ type: types.LOADED_ROLES, data: result.data.data });
    });

}

export function updateCampaignData(dispatch, campaignKey, data) {
    dispatch({type: SystemActions.types.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}`,
        method: "put",
        data: data
    }).then(function (result) {
        //load current campaign
        CampaignActions.getCampaign(campaignKey)(dispatch);
        //load team members
        getEmployeeList(campaignKey)(dispatch);
    });

}
/**
 * @function
 * display error message modal
 * @param error - error data;
 * Need to replace all the errors with this function.
 * @returns void.
 */
function displayErrorMessage(error, dispatch){
    let response = error.response || false;
    if (response) {
        let data = response.data || false;
        if (data) {
            let errorCode = data.error_code || false;
            if (errorCode && errors[errorCode]) {
                dispatch({ type: SystemActions.types.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: errors[errorCode] });
            }
        }
    }

}


