import Axios from 'axios';
import * as types from './actionTypes';

function getCurrentUserSuccess(data) {
    var user = data;
    var permissions = {};

    user.permissions.forEach(function (permission) {
        permissions[permission.operation_name] = true;
    });
    user.permissions = permissions;

    return {
        type: types.GET_CURRENT_USER_SUCCESS,
        user
    }
}

export function getCurrentUser() {
    return function(dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/system/users/current',
            method: "get"
        }).then(
            result => dispatch(getCurrentUserSuccess(result.data.data))
        ),(
            error => {console.log('getCurrentUser failed')}
        )
    }
}

function getAllListsSuccess(data) {
    return {
        type: types.GET_ALL_LISTS_SUCCESS,
        data
    }
}

function getAllListsFailed(error) {
    return {
        type: types.GET_ALL_LISTS_FAILED,
        error
    }
}

export function getAllLists() {
    return function(dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/cti/lists',
            method: "get"
        }).then(
            result => dispatch(getAllListsSuccess(result.data.data))
        ).catch(
            error => dispatch(getAllListsFailed(error))
        )
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

export function updateWebSocketConnectionStatus(dispatch, connectionStatus) {
    dispatch({
        type: types.UPDATE_WEB_SOCKET_CONNECTION_STATUS,
        connectionStatus
    });
}

export function getWebDialerConfig(dispatch, activeCampaignKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/campaigns/' + activeCampaignKey + '/extension',
        method: "get"
    }).then( function(response) {
        //let sipnumber = response.data.data.dialer_user_id;
        //let authorizationUser = response.data.data.dialer_user_id;
        //let password = response.data.data.password;

        dispatch({
            type: types.GET_WEB_DIALER_CONFIG,
            extension: response.data.data
        });
    }).catch(function (error) {
        console.log(error);
    });
}

export function updateWebDialerStatus(dispatch, status) {
    dispatch({
        type: types.UPDATE_WEB_DIALER_STATUS,
        status
    });
}

/**
 * This function resets the WebDialer.
 * If a user leaves the call screen, then
 * the connection is reset.
 *
 * @param dispatch
 */
export function resetWebDialer(dispatch) {
    dispatch({type: types.RESET_WEB_DIALER});
}

export function loadMetaDataVolunteerKeys(dispatch) {
    var keyNames = [];

    keyNames[0] = 'willing_volunteer';
    keyNames[1] = 'agree_sign';
    keyNames[2] = 'explanation_material';

    Axios({
        url: window.Laravel.baseURL + 'api/cti/metadata/keys',
        method: 'get',
        params: {
            key_names: keyNames
        }
    }).then(function (response) {
        dispatch({
            type: types.LOAD_META_DATA_VOLUNTEER_KEYS,
            metaDataKeys: response.data.data
        });
    });
}

export function loadMetaDataValues(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/metadata/values',
        method: 'get'
    }).then(function (response) {
        dispatch({
            type: types.LOAD_ALL_META_DATA_VALUES,
            metaDataValues: response.data.data
        });
    });
}

/**
 * Set interval for system status
 *
 * @param object store
 * @return void
 */
export function setSystemStatusInterval(store) {
    setInterval(function() {checkSystemStatus(store);}, 60*1000);
}
/**
 * Check system status
 * If maintenance date exists - show it
 * If not authenticated reload the page
 *
 * @param object store
 * @return void
 */
export function checkSystemStatus(store) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/status',
    }).then(function(result) {
        if (result.data.data.maintenance != undefined) {
            store.dispatch({ type: types.MAINTENANCE_DATE, maintenanceDate: result.data.data.maintenance});
        }
        if (!result.data.data.authenticated) {
            setTimeout(function () {
                location.reload();
            }, 1000);
        }
    });
}

/**
 * Set logout timer and API call response interceptor
 *
 * @param store
 */

const excludedMessagesList = [
    'maximum execution time'
];

export function setLogoutTimer(store) {
    Axios.interceptors.response.use(function (response) {
        //????????????????????????????????
        // if (!response.request.responseURL.endsWith('api/system/status')) store.dispatch({ type: types.LAST_API_CALL });
        return response;
    }, function (error) {
        //????????????????????????????????
        // if (store.getState().system.systemSettings.show_system_errors) {
            let response = error.response || false;
            if (response) {
                let data = response.data || false;
                if (data) {
                    let errorCode = data.error_code || false;
                    let errorMessage = data.message || '';

                    //check that there is message and it's not exist in the excluded list
                    let showMessage = (errorMessage.length > 0) && (!(new RegExp(excludedMessagesList.join("|")).test(errorMessage.toLowerCase())));
                    console.log(data);
                    if (errorCode == 'S071') {
                        store.dispatch({ type: types.MAINTENANCE_MODE});
                    }else if (!errorCode  && showMessage) {
                        store.dispatch({ type: types.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage });
                    }
                }
            }
        return Promise.reject(error);
    });
}

/**
 * Change audio input
 *
 * @param boolean input
 * @return function
 */
export function changeAudioInput(input) {
    return function(dispatch) {
        dispatch({type: types.AUDIO_INPUT, input});
    }
}

/**
 * Close error message dislog
 *
 * @return function
 */
export function closeErrorMsgDialog() {
    return function(dispatch) {
        dispatch({type: types.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: false, errorMessage: ''});
    }
}

/** 
 * Send ui error
 * 
 * @param string errorMessage
 * @param string url
 * @param integer lineNumber
 * @return void
 */
export function sendError(errorMessage, url, lineNumber) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/system/errors',
        method: "post",
        data: {
            url: url,
            line_number: lineNumber,
            message: errorMessage
        }
    }).then(function(result) {

    });   
}

/**
 * Update web dialer unregistered seconds
 *
 * @params function diaptch
 * @params integer seconds
 * @return void
 */
export function updateUnregisteredSeconds(dispatch, unregisteredSeconds) {
    dispatch({type: types.UPDATE_UNREGISTERED_SECONDS, unregisteredSeconds: unregisteredSeconds});
}