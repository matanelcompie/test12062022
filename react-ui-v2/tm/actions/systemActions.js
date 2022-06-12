import Axios from 'axios';

export const types = {
    GET_OPTION_LABELS_SUCCESS: 'GET_OPTION_LABELS_SUCCESS',
    GET_ALL_LISTS_SUCCESS: 'GET_ALL_LISTS_SUCCESS',
    OPEN_CONFIRM_ALERT: 'OPEN_CONFIRM_ALERT',
    CLOSE_CONFIRM_ALERT: 'CLOSE_CONFIRM_ALERT',
    LOADING_CTI_PERMISSIONS_LIST: 'LOADING_CTI_PERMISSIONS_LIST',
    LOADED_CTI_PERMISSIONS_LIST: 'LOADED_CTI_PERMISSIONS_LIST',
    ADD_BREADCRUMBS: 'ADD_BREADCRUMBS',
    UPDATE_BREADCRUMBS: 'UPDATE_BREADCRUMBS',
    SET_SYSTEM_TITLE: 'SET_SYSTEM_TITLE',
    TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY: 'TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY',
    SAVING_CHANGES: 'SAVING_CHANGES',
    CHANGES_SAVED: 'CHANGES_SAVED',
    CHANGES_NOT_SAVED: 'CHANGES_NOT_SAVED',
    SET_AUDIO_STATE: 'SET_AUDIO_STATE',
    
};

function getOptionLabelsSuccess(data) {
    return {
        type: types.GET_OPTION_LABELS_SUCCESS,
        data
    }
}

export function getOptionLabels() {
    return function(dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/tm/option_labels',
            method: "get"
        }).then(result => {
            dispatch(getOptionLabelsSuccess(result.data.data))
        }, error => {
            console.log('getOptionLabels failed')
        })        
    }
}

function getAllListsSuccess(data) {
    return {
        type: types.GET_ALL_LISTS_SUCCESS,
        data
    }
}

export function getAllLists() {
    return function(dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/tm/lists',
            method: "get"
        }).then(
            result => dispatch(getAllListsSuccess(result.data.data))
        ).catch(
            error => console.log('getAllLists failed')
        )
    }
}

export function showConfirmMessage(actionFile, confirmFuncName, params, messageText, messageTitle) {
    return function(dispatch) {
        dispatch({
            type: types.OPEN_CONFIRM_ALERT,
            actionFile,
            confirmFuncName,
            params,
            messageText,
            messageTitle
        })
    }
}

export function showAlertMessage(messageText, messageTitle) {
    return function(dispatch) {
        dispatch({
            type: types.OPEN_CONFIRM_ALERT,
            messageText,
            messageTitle
        })
    }
}

export function closeConfirmAlert() {
    return function(dispatch) {
        dispatch({
            type: types.CLOSE_CONFIRM_ALERT
        })
    }
}

/**
 * Load Cti permissions list

 * @return function
 */

export function getCtiPermissionsList() {
    return function (dispatch) {
        dispatch({type: types.LOADING_CTI_PERMISSIONS_LIST});
        Axios({
            url: window.Laravel.baseURL + 'api/tm/lists/cti_permissions',
            method: 'get'
        }).then(result => {
            dispatch({
                type: types.LOADED_CTI_PERMISSIONS_LIST,
                permissions: result.data.data
            })
        },
        error => {
            console.log('error loading cti permissions list');
        });
    }
}
