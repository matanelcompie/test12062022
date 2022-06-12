import Axios from 'axios';
import * as GlobalActions from '../actions/GlobalActions';
import * as VoterActions from '../actions/VoterActions';
import * as SystemActions from '../actions/SystemActions';

/*
 * Crm components action types
 */
export const ActionTypes = {
    UNKNOWN_VOTER: {
        CHANGE_DATA_ITEM_VALUE: "UNKNOWN_VOTER.CHANGE_DATA_ITEM_VALUE",
    },
    LISTS: {
        LOADED_CITIES: "LISTS.LOADED_CITIES",
        LOADED_COUNTRIES: "LISTS.LOADED_COUNTRIES",
        LOADED_TEAMS: "LISTS.LOADED_TEAMS",
        LOADED_TOPICS: "LISTS.LOADED_TOPICS",
        LOADED_PRIORITY: "LISTS.LOADED_PRIORITY",
        LOADED_STATUS: "LISTS.LOADED_STATUS",
        LOADED_STATUS_TYPE: "LISTS.LOADED_STATUS_TYPE",
        LOADED_USERS: "LISTS.LOADED_USERS",
        LOADED_ACTION_TYPES: "LISTS.LOADED_ACTION_TYPES",
        LOADED_ROLE_TEAMS: "LISTS.LOADED_ROLE_TEAMS",
    },
    SEARCH: {
        FILTER_VALUE_UPDATED: "SEARCH.FILTER_VALUE_UPDATED",
        COMBO_VALUE_UPDATED: "SEARCH.COMBO_VALUE_UPDATED",
        UPDATE_SUB_TOPICS_LIST: "SEARCH.UPDATE_SUB_TOPICS_LIST",
        UPDATE_TEAM_USERS_LIST: "SEARCH.UPDATE_TEAM_USERS_LIST",
        UPDATE_DATE_VALUE: "SEARCH.UPDATE_DATE_VALUE",
        CONTAINER_COLLAPSE_TOGGLE: "SEARCH.CONTAINER_COLLAPSE_TOGGLE",
        RESET_FILTERS: "SEARCH.RESET_FILTERS",
        REQUEST_RESULTS_RECEIVED: "SEARCH.REQUEST_RESULTS_RECEIVED",
        STARTED: "SERACH.STARTED",
        BUTTON_PRESSED: "SERACH.BUTTON_PRESSED",
        UPDATE_ERROR_MESSAGE: "SEARCH.UPDATE_ERROR_MESSAGE",
        NEW_USER_SELECTED: "SEARCH.NEW_USER_SELECTED",
        ORDER_RESULTS: "SEARCH.ORDER_RESULTS",
        TABLE_CONTENT_UPDATED: "SEARCH.TABLE_CONTENT_UPDATED",
    },
    REQUESTS: {
        TOGGLE_MODAL_WINDOW: 'REQUESTS.TOGGLE_MODAL_WINDOW', // show or hide a specific modal window
        REDIRECT_TO_REQUEST_PAGE: 'REQUESTS.REDIRECT_TO_REQUEST_PAGE',
    },
    REQUEST: {
        CLEAN_TEMP_VOTER_DATA: 'REQUEST.CLEAN_TEMP_VOTER_DATA' ,
        NEW_EMAIL_CHANGE:'REQUEST.NEW_EMAIL_CHANGE' ,
        SET_CREATE_EMAIL_DIALOG_OPENED : 'REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED',
        FIRST_DESC_CHANGE: 'REQUEST.FIRST_DESC_CHANGE',
        PERSONAL_ID_CHANGE: 'REQUEST.PERSONAL_ID_CHANGE',
        SEARCH_BEGIN: 'REQUEST.SEARCH_BEGIN',
        SEARCH_END: 'REQUEST.SEARCH_END',
        DATE_CHANGE: 'REQUEST.DATE_CHANGE',
        TOPIC_CHANGE: 'REQUEST.TOPIC_CHANGE',
        SEARCH_TOPIC_BEGIN: 'REQUEST.SEARCH_TOPIC_BEGIN',
        SEARCH_TOPIC_END: 'REQUEST.SEARCH_TOPIC_END',
        SEARCH_SUB_TOPIC_END: 'REQUEST.SEARCH_SUB_TOPIC_END',
        SUB_TOPIC_CHANGE: 'REQUEST.SUB_TOPIC_CHANGE',
        STATUS_CHANGE: 'REQUEST.STATUS_CHANGE',
        SEARCH_STATUS_BEGIN: 'REQUEST.SEARCH_STATUS_BEGIN',
        SEARCH_STATUSES_END: 'REQUEST.SEARCH_STATUSES_END',
        SEARCH_STATUS_TYPES_END: 'REQUEST.SEARCH_STATUS_TYPES_END',
        SEARCH_STATUS_END: 'REQUEST.SEARCH_STATUS_END',
        STATUS_TYPE_CHANGE: 'REQUEST.STATUS_TYPE_CHANGE',
        CLOSE_DATE_CHANGE: 'REQUEST.CLOSE_DATE_CHANGE', // מועד סגירה:
        CREATOR_CHANGE: 'REQUEST.CREATOR_CHANGE',
        CREATION_DATE_CHANGE: 'REQUEST.CREATION_DATE_CHANGE',
        UPDATER_CHANGE: 'REQUEST.UPDATER',
        UPDATE_DATE_CHANGE: 'REQUEST.UPDATE_DATE_CHANGE',
        SUBMITTED_DATE_CHANGE: 'REQUEST.SUBMITTED_DATE_CHANGE', // תאריך פניה
        USER_HANDLER_CHANGE: 'REQUEST.USER_HANDLER_CHANGE',
        TEAM_HANDLER_CHANGE: 'REQUEST.TEAM_HANDLER_CHANGE',
        PRIORITY_CHANGE: 'REQUEST.PRIORITY_CHANGE',
        SEARCH_PRIORITY_BEGIN: 'REQUEST.SEARCH_PRIORITY_BEGIN',
        SEARCH_PRIORITY_END: 'REQUEST.SEARCH_PRIORITY_END',
        REQUEST_SOURCE_CHANGE: 'REQUEST.REQUEST_SOURCE_CHANGE',
        REQUEST_SOURCE_ID_CHANGE: 'REQUEST.REQUEST_SOURCE_ID_CHANGE',
        SEARCH_REQUEST_SOURCE_BEGIN: 'REQUEST.SEARCH_REQUEST_SOURCE_BEGIN',
        SEARCH_REQUEST_SOURCE_END: 'REQUEST.SEARCH_REQUEST_SOURCE_END',
        ESTIMATED_CLOSE_DATE_CHANGE: 'REQUEST.ESTIMATED_CLOSE_DATE_CHANGE',
        SET_ACTIVE_TAB_PANEL: 'REQUEST.SET_ACTIVE_TAB_PANEL',
        GRAB_ACTION_BEGIN: 'REQUEST.GRAB_ACTION_BEGIN',
        GRAB_ACTION_END: 'REQUEST.GRAB_ACTION_END',
        GRAB_HISTORY_BEGIN: 'REQUEST.GRAB_HISTORY_BEGIN',
        GRAB_HISTORY_END: 'REQUEST.GRAB_HISTORY_END',
        GRAB_CALLBIZ_BEGIN: 'REQUEST.GRAB_CALLBIZ_BEGIN',
        GRAB_CALLBIZ_END: 'REQUEST.GRAB_CALLBIZ_END',
        GRAB_OLD_CALLBIZ_END: 'REQUEST.GRAB_OLD_CALLBIZ_END',
        GRAB_DOCUMENT_BEGIN: 'REQUEST.GRAB_DOCUMENT_BEGIN',
        GRAB_DOCUMENT_END: 'REQUEST.GRAB_DOCUMENT_END',
        LOAD_FIRST_TEAMS: 'REQUEST.LOAD_FIRST_TEAMS',
        CLEAR_REQUEST_FORM: 'REQUEST.CLEAR_REQUEST_FORM',
        SAVED_REQUEST: 'REQUEST.SAVED_REQUEST',
        ADDING_REQUEST: 'REQUEST.ADDING_REQUEST',
        ADDED_REQUEST: 'REQUEST.ADDED_REQUEST',
        OPEN_MISSING_REQUEST_DETAILS: 'REQUEST.OPEN_MISSING_REQUEST_DETAILS',
        CLOSE_MODAL_DIALOG: 'REQUEST.CLOSE_MODAL_DIALOG',
        CLOSE_CONFIRM_DIALOG: 'REQUEST.CLOSE_CONFIRM_DIALOG',
        OPEN_CONFIRM_DIALOG: 'REQUEST.OPEN_CONFIRM_DIALOG',
        SHOW_ADD_ACTION_TO_REQUEST_SCREEN: 'REQUEST.SHOW_ADD_ACTION_TO_REQUEST_SCREEN',
        SHOW_ADD_CALLBIZ_TO_REQUEST_SCREEN: 'REQUEST.SHOW_ADD_CALLBIZ_TO_REQUEST_SCREEN',
        HIDE_ADD_ACTION_TO_REQUEST_SCREEN: 'REQUEST.HIDE_ADD_ACTION_TO_REQUEST_SCREEN',
        HIDE_ADD_CALLBIZ_TO_REQUEST_SCREEN: 'REQUEST.HIDE_ADD_CALLBIZ_TO_REQUEST_SCREEN',
        NEW_TYPE_ADDED: 'REQUEST.NEW_TYPE_ADDED',
        NEW_OPERATION_CONVERSATION_WITH_CHANGED: 'REQUEST.NEW_OPERATION_CONVERSATION_WITH_CHANGED',
        NEW_OPERATION_DETAILS_CHANGED: 'REQUEST.NEW_OPERATION_DETAILS_CHANGED',
        NEW_OPERATION_DATE_CHANGED: 'REQUEST.NEW_OPERATION_DATE_CHANGED',
        SEARCH_REQUEST_ACTION_TYPE_END: 'REQUEST.SEARCH_REQUEST_ACTION_TYPE_END',
        NEW_ACTION_TYPE_CHANGE: 'REQUEST.NEW_ACTION_TYPE_CHANGE',
        NEW_ACTION_TOPIC_CHANGE: 'REQUEST.NEW_ACTION_TOPIC_CHANGE',
        SEARCH_REQUEST_ACTION_TOPICS_END: 'REQUEST.SEARCH_REQUEST_ACTION_TOPICS_END',
        SEARCH_REQUEST_ACTION_STATUSES_END: 'REQUEST.SEARCH_REQUEST_ACTION_STATUSES_END',
        NEW_ACTION_STATUS_CHANGE: 'REQUEST.NEW_ACTION_STATUS_CHANGE',
        NEW_ACTION_DIRECTION_CHANGE: 'REQUEST.NEW_ACTION_DIRECTION_CHANGE',
        MISSING_REQUEST: 'REQUEST.MISSING_REQUEST',
        SET_CALLBIZ_EDITING: 'REQUEST.SET_CALLBIZ_EDITING',
        SET_DOCUMENT_EDITING: 'REQUEST.SET_DOCUMENT_EDITING',
        SET_CALLBIZ_ID: 'REQUEST.SET_CALLBIZ_ID',
        SET_CALLBIZ_DATETIME: 'REQUEST.SET_CALLBIZ_DATETIME',
        SET_CALLBIZ_DETAILS: 'REQUEST.SET_CALLBIZ_DETAILS',
        UNDO_EDIT_CALLBIZ: 'REQUEST.UNDO_EDIT_CALLBIZ',
        NEW_REQUEST_CALLBIZ_ID_CHANGE: 'REQUEST.NEW_REQUEST_CALLBIZ_ID_CHANGE',
        NEW_REQUEST_CALLBIZ_DATETIME_CHANGE: 'REQUEST.NEW_REQUEST_CALLBIZ_DATETIME_CHANGE',
        NEW_REQUEST_CALLBIZ_DETAILS_CHANGE: 'REQUEST.NEW_REQUEST_CALLBIZ_DETAILS_CHANGE',
        DELETED_CALLBIZ_ROW: 'REQUEST.DELETED_CALLBIZ_ROW',
        SAVED_CALLBIZ_ROW: 'REQUEST.SAVED_CALLBIZ_ROW',
        ADDED_CALLBIZ_ROW: 'REQUEST.ADDED_CALLBIZ_ROW',
        CLEAN_CRM_INPUT_DATA: 'REQUEST.CLEAN_CRM_INPUT_DATA',
        OPEN_GENERAL_ERROR_MODAL: 'REQUEST.OPEN_GENERAL_ERROR_MODAL',
        ADDED_UNKNOWN_VOTER_SUCCESSFULLY: 'REQUEST.ADDED_UNKNOWN_VOTER_SUCCESSFULLY',
        SET_TEMP_VOTER_EDITING: 'REQUEST.SET_TEMP_VOTER_EDITING',
        TOGGLE_SEND_EMAIL_MODAL_DIALOG_DISPLAY: 'REQUEST.TOGGLE_SEND_EMAIL_MODAL_DIALOG_DISPLAY',
        UPDATE_EMAIL_CONTENT: 'REQUEST.UPDATE_EMAIL_CONTENT',
        SET_REQUEST_ACTION_EDITING:'REQUEST.SET_REQUEST_ACTION_EDITING',
        SET_DISPLAY_CONFIRM_ACTION_DELETE:'REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE',
        CHANGE_EDIT_ACTION_ROW_FIELD:'REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD',
        SET_MODAL_DISPLAY_DELAY_TIME_SHOW:'REQUEST.SET_MODAL_DISPLAY_DELAY_TIME_SHOW',
        SET_MODAL_CANCEL_REQUEST_SHOW:'REQUEST.SET_MODAL_CANCEL_REQUEST_SHOW',
        REQUEST_SOURCE_CHANGE_DOCUMENT_FAX_NUMBER: 'REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_FAX_NUMBER',
        REQUEST_SOURCE_ADD_FILE_UPLOAD_CHANGE: 'REQUEST.REQUEST_SOURCE_ADD_FILE_UPLOAD_CHANGE',
        REQUEST_SOURCE_CHANGE_DOCUMENT_NAME: 'REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_NAME',
        HIDE_REQUEST_SOURCE_FAX_MODAL: 'REQUEST.HIDE_REQUEST_SOURCE_FAX_MODAL',
        OPEN_REQUEST_SOURCE_FAX_MODAL: 'REQUEST.OPEN_REQUEST_SOURCE_FAX_MODAL',
        CLOSE_REQUEST_SOURCE_FAX_MODAL: 'REQUEST.CLOSE_REQUEST_SOURCE_FAX_MODAL',
        HIDE_REQUEST_SOURCE_EMAIL_MODAL: 'REQUEST.HIDE_REQUEST_SOURCE_EMAIL_MODAL',
        OPEN_REQUEST_SOURCE_EMAIL_MODAL: 'REQUEST.OPEN_REQUEST_SOURCE_EMAIL_MODAL',
        CLOSE_REQUEST_SOURCE_EMAIL_MODAL: 'REQUEST.CLOSE_REQUEST_SOURCE_EMAIL_MODAL',
        REQUEST_SOURCE_CHANGE_DOCUMENT_EMAIL: 'REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_EMAIL',
        REQUEST_SOURCE_CHANGE_VOTER_ORIGINAL_EMAIL: 'REQUEST.REQUEST_SOURCE_CHANGE_VOTER_ORIGINAL_EMAIL',
        CLEAN_REQUEST_SOURCE_DOCUMENT_DATA: 'REQUEST.CLEAN_REQUEST_SOURCE_DOCUMENT_DATA',
        HIDE_REQUEST_SOURCE_OTHER_MODAL: 'REQUEST.HIDE_REQUEST_SOURCE_OTHER_MODAL',
        OPEN_REQUEST_SOURCE_OTHER_MODAL: 'REQUEST.OPEN_REQUEST_SOURCE_OTHER_MODAL',
        CLOSE_REQUEST_SOURCE_OTHER_MODAL: 'REQUEST.CLOSE_REQUEST_SOURCE_OTHER_MODAL',        
        OPEN_REQUEST_SOURCE_INFO_MODAL: 'REQUEST.OPEN_REQUEST_SOURCE_INFO_MODAL',
        HIDE_REQUEST_SOURCE_INFO_MODAL: 'REQUEST.HIDE_REQUEST_SOURCE_INFO_MODAL',
        CLOSE_REQUEST_SOURCE_INFO_MODAL: 'REQUEST.CLOSE_REQUEST_SOURCE_INFO_MODAL',
        REQUEST_SOURCE_CHANGE_FIRST_NAME: 'REQUEST.REQUEST_SOURCE_CHANGE_FIRST_NAME',
        REQUEST_SOURCE_CHANGE_LAST_NAME: 'REQUEST.REQUEST_SOURCE_CHANGE_LAST_NAME',
        REQUEST_SOURCE_CHANGE_PHONE: 'REQUEST.REQUEST_SOURCE_CHANGE_PHONE',
        CLOSE_REQUEST_SOURCE_CALLBIZ_MODAL: 'REQUEST.CLOSE_REQUEST_SOURCE_CALLBIZ_MODAL',        
        OPEN_REQUEST_SOURCE_CALLBIZ_MODAL: 'REQUEST.OPEN_REQUEST_SOURCE_CALLBIZ_MODAL',
        HIDE_REQUEST_SOURCE_CALLBIZ_MODAL: 'REQUEST.HIDE_REQUEST_SOURCE_CALLBIZ_MODAL',
        CLOSE_TRANSFER_REQUEST_MODAL: 'REQUEST.CLOSE_TRANSFER_REQUEST_MODAL',        
        OPEN_TRANSFER_REQUEST_MODAL: 'REQUEST.OPEN_TRANSFER_REQUEST_MODAL',
        HIDE_TRANSFER_REQUEST_MODAL: 'REQUEST.HIDE_TRANSFER_REQUEST_MODAL',
        MODAL_TRANSFER_REQUEST_USER_HANDLER_CHANGE: 'REQUEST.MODAL_TRANSFER_REQUEST_USER_HANDLER_CHANGE',
        MODAL_TRANSFER_REQUEST_TEAM_HANDLER_CHANGE: 'REQUEST.MODAL_TRANSFER_REQUEST_TEAM_HANDLER_CHANGE',
        MODAL_CLOSE_REQUEST_STATUS_CHANGE: 'REQUEST.MODAL_CLOSE_REQUEST_STATUS_CHANGE',
        MODAL_CLOSE_REQUEST_REASON_CHANGE: 'REQUEST.MODAL_CLOSE_REQUEST_REASON_CHANGE',
        MODAL_CLOSE_REQUEST_DETAILS_CHANGE: 'REQUEST.MODAL_CLOSE_REQUEST_DETAILS_CHANGE',
        MODAL_CLOSE_REQUEST_VOTER_SATISFACTION_CHANGE: 'REQUEST.MODAL_CLOSE_REQUEST_VOTER_SATISFACTION_CHANGE',
        MODAL_CLOSE_REQUEST_SEND_EMAIL_CHANGE: 'REQUEST.MODAL_CLOSE_REQUEST_SEND_EMAIL_CHANGE',
        MODAL_CLOSE_REQUEST_INCLUDE_CLOSING_REASON_CHANGE: 'REQUEST.MODAL_CLOSE_REQUEST_INCLUDE_CLOSING_REASON_CHANGE',
        SEARCH_REQUEST_CLOSURE_REASON_END: 'REQUEST.SEARCH_REQUEST_CLOSURE_REASON_END',   
        SEARCH_REQUEST_SATISFACTION_END: 'REQUEST.SEARCH_REQUEST_SATISFACTION_END',   
        OPEN_CLOSE_REQUEST_MODAL: 'REQUEST.OPEN_CLOSE_REQUEST_MODAL',
        HIDE_CLOSE_REQUEST_MODAL: 'REQUEST.HIDE_CLOSE_REQUEST_MODAL',
        CLOSE_REQUEST_SEARCH_STATUSES_FILTERED_END: 'REQUEST.CLOSE_REQUEST_SEARCH_STATUSES_FILTERED_END',
        OPEN_CANCEL_REQUEST_MODAL: 'REQUEST.OPEN_CANCEL_REQUEST_MODAL',
        HIDE_CANCEL_REQUEST_MODAL: 'REQUEST.HIDE_CANCEL_REQUEST_MODAL',
        MODAL_CANCEL_REQUEST_STATUS_CHANGE: 'REQUEST.MODAL_CANCEL_REQUEST_STATUS_CHANGE',
        MODAL_CANCEL_REQUEST_DETAILS_CHANGE: 'REQUEST.MODAL_CANCEL_REQUEST_DETAILS_CHANGE',
        CANCEL_REQUEST_SEARCH_STATUSES_FILTERED_END: 'REQUEST.CANCEL_REQUEST_SEARCH_STATUSES_FILTERED_END', 
        SET_UNKNOWN_VOTER_KEY: 'REQUEST.SET_UNKNOWN_VOTER_KEY',
        SET_DISPLAY_REDIRECT_TO_NEW_REQUEST: 'REQUEST.SET_DISPLAY_REDIRECT_TO_NEW_REQUEST',
        UNKNOWN_VOTER_PERSONAL_IDENTITY: 'REQUEST.UNKNOWN_VOTER_PERSONAL_IDENTITY',
        REQUEST_CHANGE_FIELD:'REQUEST_CHANGE_FIELD',
    }
};

export function addTempVoter(dispatch, router, objTmpVoter, genderID, cityID , streetID , birthDate, birthDateType, age) {

    let objData = {};
    if (objTmpVoter.personal_identity != undefined && objTmpVoter.personal_identity.length > 0) {
        objData.personal_identity = objTmpVoter.personal_identity;
    }
    if (objTmpVoter.first_name != undefined && objTmpVoter.first_name.length > 0) {
        objData.first_name = objTmpVoter.first_name;
    }
    if (objTmpVoter.last_name != undefined && objTmpVoter.last_name.length > 0) {
        objData.last_name = objTmpVoter.last_name;
    }
    if (objTmpVoter.neighborhood != undefined && objTmpVoter.neighborhood.length > 0) {
        objData.neighborhood = objTmpVoter.neighborhood;
    }
    if (streetID != undefined ) {
        objData.street_id = streetID;
    }
    if (objTmpVoter.house != undefined && objTmpVoter.house.length > 0) {
        objData.house = objTmpVoter.house;
    }
    if (objTmpVoter.house_entry != undefined && objTmpVoter.house_entry.length > 0) {
        objData.house_entry = objTmpVoter.house_entry;
    }
    if (objTmpVoter.flat != undefined && objTmpVoter.flat.length > 0) {
        objData.flat = objTmpVoter.flat;
    }
    if (objTmpVoter.zip != undefined && objTmpVoter.zip.length > 0) {
        objData.zip = objTmpVoter.zip;
    }
    if (objTmpVoter.email != undefined && objTmpVoter.email.length > 0) {
        objData.email = objTmpVoter.email;
    }
    if (objTmpVoter.phone1 != undefined && objTmpVoter.phone1.length > 0) {
        objData.phone1 = objTmpVoter.phone1;
    }
    if (objTmpVoter.phone2 != undefined && objTmpVoter.phone2.length > 0) {
        objData.phone2 = objTmpVoter.phone2;
    }
    if (objTmpVoter.passport != undefined && objTmpVoter.passport.length > 0) {
        objData.passport = objTmpVoter.passport;
    }

    if (genderID != -1) {
        objData.gender_id = genderID;
    }
    if (cityID != -1) {
        objData.city_id = cityID;
    }
    if (birthDateType != -1 && birthDate.length == 10) {
        objData.birth_date_type = birthDateType;
        objData.birth_date = birthDate;
    }

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/voters/unknown',
        method: 'post',
        data: objData
    }).then(function (result) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        if (result.data.data == false) { //error - id elready exists
            dispatch({type: ActionTypes.REQUEST.OPEN_GENERAL_ERROR_MODAL, header: 'שגיאה', content: 'ת"ז קיימת כבר אצל תושב קיים'});
        } else {
            dispatch({type: ActionTypes.REQUEST.ADDED_UNKNOWN_VOTER_SUCCESSFULLY, data: result.data.data, age});
            router.push('crm/requests/new');
        }

    }).catch(function (error) {
            dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}


export function deleteAction(dispatch, reqKey, actionKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/actions/' + actionKey,
        method: 'delete'
    }).then(function (response) {
        getRequestActionByRequestKey(dispatch, reqKey);
        dispatch({type: ActionTypes.REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE,
                  deleteIndex: -1 , isShow:false});
    });
}
export function editAction(dispatch, reqKey, actionKey , objData , rowIndex) {
   dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
   Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/actions/' + actionKey,
        method: 'put' , 
        data: objData
    }).then(function (response) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        getRequestActionByRequestKey(dispatch, reqKey);
    }).catch(function (error) {
            dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function editTempVoter(dispatch, router, objTmpVoter, genderID, cityID , streetID, birthDate, birthDateType, age) {

    let objData = {};
    if (objTmpVoter.personal_identity != undefined && objTmpVoter.personal_identity.length > 0) {
        objData.personal_identity = objTmpVoter.personal_identity;
    }
    if (objTmpVoter.first_name != undefined && objTmpVoter.first_name.length > 0) {
        objData.first_name = objTmpVoter.first_name;
    }
    if (objTmpVoter.last_name != undefined && objTmpVoter.last_name.length > 0) {
        objData.last_name = objTmpVoter.last_name;
    }
    if (objTmpVoter.neighborhood != undefined && objTmpVoter.neighborhood.length > 0) {
        objData.neighborhood = objTmpVoter.neighborhood;
    }
    if (streetID != undefined ) {
        objData.street_id = streetID;
    }
    if (objTmpVoter.house != undefined && objTmpVoter.house.length > 0) {
        objData.house = objTmpVoter.house;
    }
    if (objTmpVoter.house_entry != undefined && objTmpVoter.house_entry.length > 0) {
        objData.house_entry = objTmpVoter.house_entry;
    }
    if (objTmpVoter.flat != undefined && objTmpVoter.flat.length > 0) {
        objData.flat = objTmpVoter.flat;
    }
    if (objTmpVoter.zip != undefined && objTmpVoter.zip.length > 0) {
        objData.zip = objTmpVoter.zip;
    }
    if (objTmpVoter.email != undefined && objTmpVoter.email.length > 0) {
        objData.email = objTmpVoter.email;
    }
    if (objTmpVoter.phone1 != undefined && objTmpVoter.phone1.length > 0) {
        objData.phone1 = objTmpVoter.phone1;
    }
    if (objTmpVoter.phone2 != undefined && objTmpVoter.phone2.length > 0) {
        objData.phone2 = objTmpVoter.phone2;
    }
    if (objTmpVoter.passport != undefined && objTmpVoter.passport.length > 0) {
        objData.passport = objTmpVoter.passport;
    }

    if (genderID != -1) {
        objData.gender_id = genderID;
    }
    if (cityID != -1) {
        objData.city_id = cityID;
    }
    if (birthDateType != -1 && birthDate.length == 10) {
        objData.birth_date_type = birthDateType;
        objData.birth_date = birthDate;
    }

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/voters/unknown/' + objTmpVoter.key,
        method: 'put',
        data: objData
    }).then(function (result) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        if (result.data.data == false) { //error - id elready exists
            dispatch({type: ActionTypes.REQUEST.OPEN_GENERAL_ERROR_MODAL, header: 'שגיאה', content: 'ת"ז קיימת כבר אצל תושב קיים'});
        } else {
            dispatch({type: ActionTypes.REQUEST.SET_TEMP_VOTER_EDITING, data: false});
            //dispatch({type: ActionTypes.REQUEST.ADDED_UNKNOWN_VOTER_SUCCESSFULLY, data:result.data.data , age});
            //router.push('crm/requests/new');
        }

    }).catch(function (error) {
            dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

/**
 * Get chunks(aka per page) of request records.
 *
 * @param dispatch
 * @param searchParam
 * @param pageFor
 */
export function searchRequests(dispatch, searchParam, pageFor) {

    dispatch({type: ActionTypes.REQUESTS.FETCH_DATA_BEGIN});

    let tmpData = {}, tmp;

    for (let idx in searchParam) {
        tmp = searchParam[idx];
        if (tmp.length > 0) {
            tmpData[idx] = tmp;
        }
    }

    tmpData['page'] = pageFor;
 
    Axios({
        /*url: window.Laravel.baseURL + 'api/crm/requests/search/',*/
        url: window.Laravel.baseURL + 'api/crm/requests',
        method: 'get',
        params: tmpData
    }).then(function (result) {

        let requestData = result.data.data;
        /*console.log('Actions=' + JSON.stringify(requestData));*/
        if (undefined != requestData['rowsCount']) {
            dispatch({type: ActionTypes.REQUESTS.SET_ROW_COUNT, searchRequestCount: requestData['rowsCount']});
            requestData = requestData[0];
        }
        //console.log('Actions len=' + requestData.length);
        dispatch({type: ActionTypes.REQUESTS.FETCH_DATA_END, searchRequestDataChunk: requestData});
    }).catch(function (error) {
        console.log(error);
    });
}

export function deleteCallbizRow(dispatch, router, bizcallKey, reqKey) {
    Axios({

        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/callbiz',
        method: 'delete',
        data: {
            callbiz_key: bizcallKey

        }
    }).then(function (result) {
        dispatch({type: ActionTypes.REQUEST.DELETED_CALLBIZ_ROW, data: result.data.data});
    }).catch(function (error) {
        console.log(error);
    });
}

export function editCallbizRow(dispatch, router, bizcallKey, reqKey, newID, newDate, newDetails) {
    let newFormattedDateTimeArr = [];
    let newFormattedDateArr = [];
    if (newDate.length == 19) {
        newFormattedDateTimeArr = newDate.split(' ');
        newFormattedDateArr = newFormattedDateTimeArr[0].split('/');
        newDate = (newFormattedDateArr[2] + '-' + newFormattedDateArr[1] + '-' + newFormattedDateArr[0]) + ' ' + newFormattedDateTimeArr[1];
    } else if (newDate.length == 17) {
        newFormattedDateTimeArr = newDate.split(' ');
        newFormattedDateArr = newFormattedDateTimeArr[0].split('/');
        newDate = ('20' + newFormattedDateArr[2] + '-' + newFormattedDateArr[1] + '-' + newFormattedDateArr[0]) + ' ' + newFormattedDateTimeArr[1];
    } else if (newDate.length == 14) {
        newFormattedDateTimeArr = newDate.split(' ');
        newFormattedDateArr = newFormattedDateTimeArr[0].split('/');
        newDate = ('20' + newFormattedDateArr[2] + '-' + newFormattedDateArr[1] + '-' + newFormattedDateArr[0]) + ' ' + newFormattedDateTimeArr[1] + ':00';
    } else if (newDate.length == 16) {
        newFormattedDateTimeArr = newDate.split(' ');
        newFormattedDateArr = newFormattedDateTimeArr[0].split('/');
        newDate = (newFormattedDateArr[2] + '-' + newFormattedDateArr[1] + '-' + newFormattedDateArr[0]) + ' ' + newFormattedDateTimeArr[1] + ':00';
    } else if (newDate.length == 10) {
        newFormattedDateTimeArr = newDate.split('/');
        newDate = (newFormattedDateTimeArr[2] + '-' + newFormattedDateTimeArr[1] + '-' + newFormattedDateTimeArr[0]);
    } else if (newDate.length == 8) {
        newFormattedDateTimeArr = newDate.split(' ');
        newFormattedDateArr = newFormattedDateTimeArr[0].split('/');
        newDate = ('20' + newFormattedDateArr[2] + '-' + newFormattedDateArr[1] + '-' + newFormattedDateArr[0]);
    }
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({

        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/callbiz',
        method: 'put',
        data: {
            callbiz_key: bizcallKey,
            callbiz_id: newID,
            date: newDate,
            details: newDetails

        }
    }).then(function (result) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        dispatch({type: ActionTypes.REQUEST.SAVED_CALLBIZ_ROW, data: result.data.data});
    }).catch(function (error) {
        dispatch({type: ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה', content: error.response.data.message});
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function addCallbizRow(dispatch, router, reqKey, newID, newDate, newDetails) {
    let newFormattedDateTimeArr = [];
    let newFormattedDateArr = [];
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({

        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/callbiz',
        method: 'post',
        data: {
            callbiz_id: newID,
            date: newDate,
            details: newDetails

        }
    }).then(function (result) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        dispatch({type: ActionTypes.REQUEST.ADDED_CALLBIZ_ROW, data: result.data.data});
    }).catch(function (error) {
        dispatch({type: ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה', content: error.response.data.message});
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

/**
 *
 * @param dispatch
 * @param router
 * @param reqKey
 * @param topicID
 * @param subTopicID
 * @param statusID
 * @param priorityID
 * @param userID
 * @param teamID
 * @param targetCloseDate
 */
export function editRequest(dispatch, router, reqKey, topicID, subTopicID, statusID, requestSourceID, requestSourceFax, requestSourceEmail, requestSourcePhone,
        requestSourceFirstName, requestSourceLastName, priorityID, userID, teamID, targetCloseDate, requestDate,
        originalTopicName, originalSubTopicName, originalStatusName, originalRequestSourceName, originalRequestSourceFax, originalRequestSourceEmail, 
        originalRequestSourcePhone, originalRequestSourceFirstName, originalRequestSourceLastName, originalPriorityName, originalUserName, originalTeamName, originalCloseDate, 
        originalDate, newTopicName, newSubTopicName, newStatusName, newRequestSourceName, newRequestSourceFax, newRequestSourceEmail, 
        newRequestSourcePhone, newRequestSourceFirstName, newRequestSourceLastName, newPriorityName, newUserName, newTeamName, newCloseDate, newDate , 
        newDescription , oldDescription, newCallbizID , newCallbizDateTime , newCallbizDetails, newActionDetails, actionType, 
        requestClosureReasonID, voterSatisfaction, isSendEmail, isIncludeClosingReason, originalDataRequest , setUpdatedSavedRequest) 
        {

    let countEdits = 0;
    let paramsObject = {};
    if (topicID != null) {
        paramsObject.topic_id = topicID;
        paramsObject.old_topic_name = originalTopicName;
        paramsObject.topic_name = newTopicName;
        countEdits++;
    }
    if (subTopicID != null) {
        paramsObject.sub_topic_id = subTopicID;
        paramsObject.old_sub_topic_name = originalSubTopicName;
        paramsObject.sub_topic_name = newSubTopicName;
        countEdits++;
    }
    if (statusID != null) {
        paramsObject.status_id = statusID;
        paramsObject.old_status_name = originalStatusName;
        paramsObject.status_name = newStatusName;
        countEdits++;
    }
    if (requestSourceID != null) {
        paramsObject.request_source_id = requestSourceID;
        paramsObject.old_request_source_name = originalRequestSourceName;
        paramsObject.request_source_name = newRequestSourceName;
        countEdits++;
    }
    if (requestSourceFax != null) {
        paramsObject.old_request_source_fax = originalRequestSourceFax;
        paramsObject.request_source_fax = newRequestSourceFax;
        countEdits++;
    }
    if (requestSourceEmail != null) {
        paramsObject.old_request_source_email = originalRequestSourceEmail;
        paramsObject.request_source_email = newRequestSourceEmail;
        countEdits++;
    }
    if (requestSourcePhone != null) {
        paramsObject.old_request_source_phone = originalRequestSourcePhone;
        paramsObject.request_source_phone = newRequestSourcePhone;
        countEdits++;
    }
    if (requestSourceFirstName != null) {
        paramsObject.old_request_source_first_name = originalRequestSourceFirstName;
        paramsObject.request_source_first_name = newRequestSourceFirstName;
        countEdits++;
    }
    if (requestSourceLastName != null) {
        paramsObject.old_request_source_last_name = originalRequestSourceLastName;
        paramsObject.request_source_last_name = newRequestSourceLastName;
        countEdits++;
    }    
    if (priorityID != null) {
        paramsObject.request_priority_id = priorityID;
        paramsObject.old_priority_name = originalPriorityName;
        paramsObject.priority_name = newPriorityName;
        countEdits++;
    }
    if (userID != null) {
        paramsObject.user_handler_id = userID;
        paramsObject.old_user_name = originalUserName;
        paramsObject.user_name = newUserName;
        paramsObject.user_handle_name = newUserName;
        countEdits++;
    }
    if (teamID != null) {
        paramsObject.team_handler_id = teamID;
        paramsObject.old_team_name = originalTeamName;
        paramsObject.team_name = newTeamName;
        paramsObject.team_handle_name = newTeamName;
        countEdits++;
    }
    if (targetCloseDate != null) {
        paramsObject.target_close_date = targetCloseDate;
        paramsObject.old_close_date = originalCloseDate;
        paramsObject.close_date = newCloseDate;
        countEdits++;
    }
    if (requestDate != null) {
        paramsObject.request_date = newDate;
        paramsObject.old_request_date = originalDate;
        countEdits++;
    }
    if (newDescription != null && oldDescription != null) {
        paramsObject.new_description = newDescription;
        paramsObject.old_description = oldDescription;
        countEdits++;
    }
    paramsObject.static_topic_name = originalTopicName;
    paramsObject.static_sub_topic_name = originalSubTopicName;
    paramsObject.static_team_handle_name = originalTeamName;

    paramsObject.new_callBiz_ID = newCallbizID;
    paramsObject.new_callBiz_datetime = newCallbizDateTime;    
    paramsObject.new_callBiz_details = newCallbizDetails;
    paramsObject.new_action_details = newActionDetails;
    paramsObject.new_action_type = actionType;
    paramsObject.static_request_closure_reason = requestClosureReasonID;
    paramsObject.static_voter_satisfaction = voterSatisfaction; 
    paramsObject.static_is_send_email = isSendEmail;
    paramsObject.static_is_include_closing_reason = isIncludeClosingReason;
    // paramsObject.original_data_request = originalDataRequest;
    //console.log('count : ' + countEdits);
	 
    if (countEdits > 0) { /*check if any update occured*/
        dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
        Axios({
            url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey,
            method: 'put',
            data: paramsObject,

        }).then(function (result) {
            dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'crm.requests.general' });
            GlobalActions.getEntityMessages(dispatch, router, 1, reqKey);
            getRequestHistoryByRequestKey(dispatch, reqKey);
            getRequestByKey(dispatch, router, reqKey );
            dispatch({type: ActionTypes.REQUEST.SAVED_REQUEST});
            dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
            if (newCallbizID != null || newCallbizID != ''){
                getRequestCallBizByRequestKey(dispatch, reqKey);
            //    dispatch({type: ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_CALLBIZ_MODAL});
            }
            //if(newDescription != null){
            getRequestActionByRequestKey(dispatch, reqKey);            
            //}
        }).catch(function (error) {
            dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
            SystemActions.displayErrorMessage(error,dispatch);
            
        });
    }
}
 
/**
 *
 * @param dispatch
 * @param router
 * @param reqKey
 * @param topicID
 * @param subTopicID
 * @param statusID
 * @param priorityID
 * @param userID
 * @param teamID
 * @param targetCloseDate
 */
 // USES THIS FUNC IN METHOD:POST ONLY WHEN THERE IS A NEW FILE IN THE EDITED REQUEST, BECAUSE LARAVEL DOESN'T SUPPORT METHOD PUT ON FORMDATA: MULTY PART
 // USING _METHOD = PUT
export function editRequestWithFile(dispatch, router, reqKey, topicID, subTopicID, statusID, requestSourceID, requestSourceFax, requestSourceEmail, requestSourcePhone,
        requestSourceFirstName, requestSourceLastName, priorityID, userID, teamID, targetCloseDate, requestDate,
        originalTopicName, originalSubTopicName, originalStatusName, originalRequestSourceName, originalRequestSourceFax, originalRequestSourceEmail, 
        originalRequestSourcePhone, originalRequestSourceFirstName, originalRequestSourceLastName, originalPriorityName, originalUserName, originalTeamName, originalCloseDate, 
        originalDate, newTopicName, newSubTopicName, newStatusName, newRequestSourceName, newRequestSourceFax, newRequestSourceEmail, 
        newRequestSourcePhone, newRequestSourceFirstName, newRequestSourceLastName, newPriorityName, newUserName, newTeamName, newCloseDate, newDate , 
        newDescription , oldDescription, newDocumentName, newDocumentFile) 
        {

    let countEdits = 0;
    let paramsObject = {};
    if (topicID != null) {
        paramsObject.topic_id = topicID;
        paramsObject.old_topic_name = originalTopicName;
        paramsObject.topic_name = newTopicName;
        countEdits++;
    }
    if (subTopicID != null) {
        paramsObject.sub_topic_id = subTopicID;
        paramsObject.old_sub_topic_name = originalSubTopicName;
        paramsObject.sub_topic_name = newSubTopicName;
        countEdits++;
    }
    if (statusID != null) {
        paramsObject.status_id = statusID;
        paramsObject.old_status_name = originalStatusName;
        paramsObject.status_name = newStatusName;
        countEdits++;
    }
    if (requestSourceID != null) {
        paramsObject.request_source_id = requestSourceID;
        paramsObject.old_request_source_name = originalRequestSourceName;
        paramsObject.request_source_name = newRequestSourceName;
        countEdits++;
    }
    if (requestSourceFax != null) {
        paramsObject.old_request_source_fax = originalRequestSourceFax;
        paramsObject.request_source_fax = newRequestSourceFax;
        countEdits++;
    }
    if (requestSourceEmail != null) {
        paramsObject.old_request_source_email = originalRequestSourceEmail;
        paramsObject.request_source_email = newRequestSourceEmail;
        countEdits++;
    }
    if (requestSourcePhone != null) {
        paramsObject.old_request_source_phone = originalRequestSourcePhone;
        paramsObject.request_source_phone = newRequestSourcePhone;
        countEdits++;
    }
    if (requestSourceFirstName != null) {
        paramsObject.old_request_source_first_name = originalRequestSourceFirstName;
        paramsObject.request_source_first_name = newRequestSourceFirstName;
        countEdits++;
    }
    if (requestSourceLastName != null) {
        paramsObject.old_request_source_last_name = originalRequestSourceLastName;
        paramsObject.request_source_last_name = newRequestSourceLastName;
        countEdits++;
    }    
    if (priorityID != null) {
        paramsObject.request_priority_id = priorityID;
        paramsObject.old_priority_name = originalPriorityName;
        paramsObject.priority_name = newPriorityName;
        countEdits++;
    }
    if (userID != null) {
        paramsObject.user_handler_id = userID;
        paramsObject.old_user_name = originalUserName;
        paramsObject.user_name = newUserName;
        countEdits++;
    }
    if (teamID != null) {
        paramsObject.team_handler_id = teamID;
        paramsObject.old_team_name = originalTeamName;
        paramsObject.team_name = newTeamName;
        countEdits++;
    }
    if (targetCloseDate != null) {
        paramsObject.target_close_date = targetCloseDate;
        paramsObject.old_close_date = originalCloseDate;
        paramsObject.close_date = newCloseDate;
        countEdits++;
    }
    if (requestDate != null) {
        paramsObject.request_date = newDate;
        paramsObject.old_request_date = originalDate;
        countEdits++;
    }
    if (newDescription != null && oldDescription != null) {
        paramsObject.new_description = newDescription;
        paramsObject.old_description = oldDescription;
        countEdits++;
    }
    paramsObject.static_topic_name = originalTopicName;
    paramsObject.static_sub_topic_name = originalSubTopicName;
    paramsObject.static_team_handle_name = originalTeamName;
    //console.log('count : ' + countEdits);
    var data = new FormData();
    data.append('document_name', newDocumentName);
    data.append('file_upload', newDocumentFile);
    data.append('_method', 'PUT');

    //must append all params to data
    for (var key in paramsObject) {
            data.append(key, paramsObject[key]);
    }

    if (countEdits > 0) { /*check if any update occured*/
        dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
        Axios({
            url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey,
            method: 'post',
            data: data,

        }).then(function (result) {
            
            dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'crm.requests.general' });
            GlobalActions.getEntityMessages(dispatch, router, 1, reqKey);
            getRequestHistoryByRequestKey(dispatch, reqKey);
            getRequestByKey(dispatch, router, reqKey);
            dispatch({type: ActionTypes.REQUEST.SAVED_REQUEST});
            dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        //    if(newDescription != null){
                  getRequestActionByRequestKey(dispatch, reqKey);
        //    }
            GlobalActions.getEntityDocuments(dispatch, 1, reqKey);    
            dispatch({type: ActionTypes.REQUEST.CLEAN_REQUEST_SOURCE_DOCUMENT_DATA});

        }).catch(function (error) {
            dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
        });
    }
}

export function updateRequestVoter(dispatch, router, reqKey, voterKey) {
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/voters',
        method: 'put',
        data: {voterKey}
    }).then(function () {
        GlobalActions.getEntityMessages(dispatch, router, 1, reqKey);
        getRequestHistoryByRequestKey(dispatch, reqKey);
        getRequestByKey(dispatch, router, reqKey);
        dispatch({type: ActionTypes.REQUEST.SAVED_REQUEST});
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function updateRequestVoterEmail(dispatch, voterKey , newEmail ,  isUnknownVoter = false) {
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/voters/' + voterKey + '/new_email',
        method: 'put',
        data: {
            new_email : newEmail , 
            unknown_voter:(isUnknownVoter ? '1':'0')
        }
    }).then(function (result) {
         dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
         if(isUnknownVoter){
             dispatch({
                 type: ActionTypes.UNKNOWN_VOTER.CHANGE_DATA_ITEM_VALUE,
                 theKey: 'email', theValue: newEmail
             });
             dispatch({
                 type: ActionTypes.REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED , data:false
             });
         }
         else{
             dispatch({
                type: VoterActions.ActionTypes.VOTER.VOTER_CONTACT_UPDATE_EMAIL , data:newEmail
             });
             dispatch({
                type: ActionTypes.REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED , data:false
             });
         }
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function sendEmailFromVoter(dispatch, voterKey, emailTitle, emailBody) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/send_email',
        method: 'post',
        data: {emailTitle, emailBody}
    }).then(function () {
    });
}

export function sendEmailFromRequest(dispatch, requestKey, emailTitle, emailBody) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + requestKey + '/send_email',
        url: window.Laravel.baseURL + 'api/crm/requests/' + requestKey + '/send_email',
        method: 'post',
        data: {emailTitle, emailBody}
    }).then(function () {
    });
}

export function sendRealSMSViaAPI(requestKey , phoneKey , messageText) {
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/' + requestKey + '/sendSMS',
        method: "post" ,
        data : {
            voter_phone_key:phoneKey,
            message_text:messageText
        }
    }).then(function (result) {

    });
}

/**
 *
 * @param dispatch
 * @param reqKey
 * function that calls api that adds a new action to existin request
 */
export function addNewAction(dispatch, reqKey, newActionFields) {
    
  dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});

   return Axios({
        url: window.Laravel.baseURL + 'api/system/request/action/' + reqKey,
        method: 'post',
        data: {
            entity_type: 1,
            conversation_with: newActionFields.conversation_with_other,
            action_type: newActionFields.action_type,
            action_topic_id: newActionFields.action_topic_id,
            conversation_direction: newActionFields.conversation_direction,
            action_date: newActionFields.action_date,
            details: newActionFields.description,
            action_status_id: newActionFields.action_status_id
        }
    }).then(function (result) {
        dispatch({type: ActionTypes.REQUEST.NEW_TYPE_ADDED, newActionRecord: result.data.data});
        dispatch({type: ActionTypes.REQUEST.HIDE_ADD_ACTION_TO_REQUEST_SCREEN});
        getRequestActionByRequestKey(dispatch, reqKey);
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        return result
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
        SystemActions.displayErrorMessage(error,dispatch);
    });
}
/**
 *
 * @param dispatch
 * @param router
 * @param voterID
 * @param topicID
 * @param subTopicID
 * @param statusID
 * @param priorityID
 * @param userID
 * @param teamID
 * @param targetCloseDate
 * @param closeDate
 * @param isTempVoter
 * @param temp_identity_number
 * @param temp_first_name
 * @param temp_last_name
 */
export function addRequest(dispatch, router, voterID, topicID, subTopicID, statusID, requestSourceID, priorityID, userID, teamID, targetCloseDate, closeDate, requestDate, /*=*/
        isTempVoter = false, historyTopicName, historySubTopicName, historyRequestSourceName, historyRequestSourceFax, historyRequestSourceEmail, historyRequestSourcePhone,
        historyRequestSourceFirstName, historyRequestSourceLastName, historyPriorityName, historyStatusName, /*=*/
        historyUserHandlerName, historyTeamHandlerName, firstDesc, tempVoterKey = '',documentName, documentFile, CallbizDetailsID , CallbizDetailsDatetime , CallbizDetailsDetails,dataRequest) {

    let targetCloseDateFormatted = targetCloseDate.split(' ')[0];
    targetCloseDateFormatted = targetCloseDateFormatted.split('-');
    targetCloseDateFormatted = targetCloseDateFormatted[2] + '/' + targetCloseDateFormatted[1] + '/' + targetCloseDateFormatted[0];
    dispatch({type: ActionTypes.REQUEST.ADDING_REQUEST});
    let voterParams = {};
    if (isTempVoter == false) {

        voterParams = {
            'voter_id': voterID,
            'topic_id': topicID,
            'topic_name': historyTopicName,
            'sub_topic_id': subTopicID,
            'sub_topic_name': historySubTopicName,
            'status_id': statusID,
            'status_name': historyStatusName,
            'request_source_id': requestSourceID,
            'request_source_name': historyRequestSourceName,
            'request_source_fax': historyRequestSourceFax,
            'request_source_email': historyRequestSourceEmail,
            'request_source_phone': historyRequestSourcePhone,
            'request_source_first_name': historyRequestSourceFirstName,
            'request_source_last_name': historyRequestSourceLastName,
            'request_priority_id': priorityID,
            'priority_name': historyPriorityName,
            'user_handler_id': userID,
            'user_handle_name': historyUserHandlerName,
            'team_handler_id': teamID,
            'team_handle_name': historyTeamHandlerName,
            'target_close_date_timestamp': targetCloseDate,
            'target_close_date': targetCloseDateFormatted,
            'close_date': closeDate,
            'is_temp_voter': 'false',
            'first_desc': firstDesc,
            'request_date': requestDate,
            'callBiz_id': CallbizDetailsID,
            'callbiz_datetime': CallbizDetailsDatetime,
            'callBiz_details': CallbizDetailsDetails,
            'save_voter_phone':dataRequest.save_voter_phone?dataRequest.save_voter_phone:null,
        };
    } else {
        voterParams = {
            'voter_id': '0',
            'topic_id': topicID,
            'topic_name': historyTopicName,
            'sub_topic_id': subTopicID,
            'sub_topic_name': historySubTopicName,
            'status_id': statusID,
            'status_name': historyStatusName,
            'request_source_id': requestSourceID,
            'request_source_name': historyRequestSourceName,
            'request_source_fax': historyRequestSourceFax,
            'request_source_email': historyRequestSourceEmail,
            'request_source_phone': historyRequestSourcePhone,
            'request_source_first_name': historyRequestSourceFirstName,
            'request_source_last_name': historyRequestSourceLastName,            
            'request_priority_id': priorityID,
            'priority_name': historyPriorityName,
            'user_handler_id': userID,
            'user_handle_name': historyUserHandlerName,
            'team_handler_id': teamID,
            'team_handle_name': historyTeamHandlerName,
            'target_close_date_timestamp': targetCloseDate,
            'target_close_date': targetCloseDateFormatted,
            'close_date': closeDate,
            'is_temp_voter': 'true',
            'first_desc': firstDesc,
            'temp_voter_key': tempVoterKey,
            'request_date': requestDate,
            'callBiz_id': CallbizDetailsID,
            'callbiz_datetime': CallbizDetailsDatetime,
            'callBiz_details': CallbizDetailsDetails,
        };
    }
    var data = new FormData();
    data.append('document_name', documentName);
    data.append('file_upload', documentFile);
    //must append all params to data
    for (var key in voterParams) {
            data.append(key, voterParams[key]);
    }

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests',
        method: 'post',
        data: data
    }).then(function (result) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'crm.requests.general'});        
        dispatch({type: ActionTypes.REQUEST.ADDED_REQUEST, reqKey: result.data.data});
        GlobalActions.getEntityMessages(dispatch, router, 1, result.data.data);
        getRequestHistoryByRequestKey(dispatch, result.data.data);     
        router.push('/crm/requests/' + result.data.data);
        if (result.data.data != undefined) {
            getRequestByKey(dispatch, router, result.data.data);
            getRequestActionByRequestKey(dispatch, result.data.data);
        }

    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function getRequestByKey(dispatch, router, reqKey , setUpdatedSavedRequest=null) {
    dispatch({type: ActionTypes.REQUEST.SEARCH_BEGIN});
    var tmpData = {};
    Axios({

        url: window.Laravel.baseURL + 'api/crm/requests/' + reqKey,
        method: 'get',
        params: {}

    }).then(function (response) {
        //console.log(response.data.data);
        let reqData = response.data.data;
         dispatch({type: ActionTypes.REQUEST.SEARCH_END, reqData: reqData});
        getRequestSubTopicsByParentID(dispatch, (reqData.topic_id));
         if(response.data.data.voter_key != null){
              VoterActions.getVoterByKey(dispatch, response.data.data.voter_key, false, false, router);
         }

		 if(setUpdatedSavedRequest){
			 setUpdatedSavedRequest(reqData);
		 }

    }).catch(function (error) {

         //dispatch({type: ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה', content: 'מספר בקשה לא קיים'});
         //router.push('crm/requests');
    });

}

export function setActiveDetailTabPanel(dispatch, activeTab) {

    let requestDetailTab = {'operation': false, 'history': false, 'callBiz': false, 'message': false, 'document': false};

    if (undefined == requestDetailTab[activeTab]) {
        console.log('what to do?');
    } else {
        requestDetailTab[activeTab] = true;
        dispatch({type: ActionTypes.REQUEST.SET_ACTIVE_TAB_PANEL, activeTab: requestDetailTab});
    }

}
/**
 * Get a list of ALL(not deleted!) topics, or a specific one by key.
 * @param dispatch
 * @param topicKey
 */
export function getRequestTopicsByKey(dispatch, topicKey) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request';

    if (null != topicKey) {
        rightURL = rightURL + '/' + topicKey + '/topics';
    } else {
        rightURL = rightURL + '/topics';
    }
    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {
        let tmpList = {}, tmpList1 = [], j = 0;
        /*
         * We'll select the topics unique names from the response.data.data into tmpList1.
         * Two loops will do the trick.
         */
        for (let i in response.data.data) {
            j = j + 1;
            tmpList[response.data.data[i].name] = j;
        }
        for (let i in tmpList) {
            tmpList1.push({'id': tmpList[i], 'name': i});
        }

        dispatch({type: ActionTypes.REQUEST.SEARCH_TOPIC_END, topicList: tmpList1});
        // dispatch({type: ActionTypes.REQUEST.SEARCH_SUB_TOPIC_END, data: response.data.data});
    }).catch(function (error) {
        console.log(error);
    });

}

export function getAllRequestTopics(dispatch) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request/topics';


    Axios({
        url: rightURL,
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_TOPIC_END, topicList: response.data.data});
    }).catch(function (error) {
        console.log(error);
    });

}

export function getAllRequestsActionsStatuses(dispatch, router) {
    var rightURL = window.Laravel.baseURL + 'api/system/request/action/status';

    Axios({
        url: rightURL,
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_STATUSES_END, actionStatusesList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestActionTopicsByType(dispatch, actionTypeKey) {
    var rightURL = window.Laravel.baseURL + 'api/system/request/action/topics' + ( actionTypeKey ? '/' + actionTypeKey : '' );

    Axios({
        url: rightURL,
        method: 'get',
        params: {}
    }).then(function (response) {
        if (response.data.data == undefined) {
            dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_TOPICS_END, actionTopicsList: []});
        } else {
            dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_TOPICS_END, actionTopicsList: response.data.data});
        }

    }).catch(function (error) {
        console.log(error);
    });
}

export function getActionTypeTopics(dispatch, router) {
    var rightURL = window.Laravel.baseURL + 'api/system/request/action/topics';

    Axios({
        url: rightURL,
        method: 'get',
        params: {
            'entity_type': 1
        }
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_TYPE_END, actionTypesList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}


export function getAllRequestsActionsTypes(dispatch, router, entity_type) {
    var rightURL = window.Laravel.baseURL + 'api/system/request/action/types';

    Axios({
        url: rightURL,
        method: 'get',
        params: {
            'entity_type': entity_type
        }
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_TYPE_END, actionTypesList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestSubTopicsByParentID(dispatch, parentID) {
    var tmpData = {};

    Axios({
        url: window.Laravel.baseURL + 'api/system/request/topics?parent_id=' + parentID,
        method: 'get',
        params: {}

    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_SUB_TOPIC_END, data: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestStatusByKey(dispatch, statusKey) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request';

    if (null != statusKey) {
        rightURL = rightURL + '/' + statusKey + '/status';
    } else {
        rightURL = rightURL + '/status';
    }

    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {

        dispatch({type: ActionTypes.REQUEST.SEARCH_STATUS_END, statusList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });

}
/**
 *
 * @param dispatch
 */
export function getRequestStatusTypes(dispatch) {

    Axios({
        url: window.Laravel.baseURL + 'api/system/request/statusTypes',
        method: 'get',
        params: {}

    }).then(function (response) {

        for (let i in response.data.data) {
        }
        console.log('---getRequestStatusTypes---' + JSON.stringify(response.data.data));
        dispatch({type: ActionTypes.REQUEST.SEARCH_STATUS_TYPES_END, statusList: response.data.data});


    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestStatuses(dispatch) {

    Axios({
        url: window.Laravel.baseURL + 'api/system/request/status',
        method: 'get',
        params: {}

    }).then(function (response) {

        dispatch({type: ActionTypes.REQUEST.SEARCH_STATUSES_END, data: response.data.data});


    }).catch(function (error) {
        console.log("error:" + error);
    });
}

export function getCloseRequestStatusesByType(dispatch, typeKey = null) {

    var rightUrl = window.Laravel.baseURL + 'api/system/request/status/types'
    if (typeKey != undefined && typeKey != null){
        rightUrl = rightUrl + '/' + typeKey
    }
    Axios({
        url: rightUrl,
        method: 'get',
        params: {}

    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.CLOSE_REQUEST_SEARCH_STATUSES_FILTERED_END, data: response.data.data});        

    }).catch(function (error) {
        console.log("error:" + error);
    });
}

export function getCancelRequestStatusesByType(dispatch, typeKey = null) {

    var rightUrl = window.Laravel.baseURL + 'api/system/request/status/types'
    if (typeKey != undefined && typeKey != null){
        rightUrl = rightUrl + '/' + typeKey
    }
    Axios({
        url: rightUrl,
        method: 'get',
        params: {}

    }).then(function (response) {    
        dispatch({type: ActionTypes.REQUEST.CANCEL_REQUEST_SEARCH_STATUSES_FILTERED_END, data: response.data.data});

    }).catch(function (error) {
        console.log("error:" + error);
    });
}

export function getRequestPriorityByKey(dispatch, priorityKey) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request/priority';

    if (null != priorityKey) {
        rightURL = rightURL + '/' + priorityKey;
    }

    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {

        dispatch({type: ActionTypes.REQUEST.SEARCH_PRIORITY_END, priorityList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestSourceByKey(dispatch, requestSourceKey) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request/source';

    if (null != requestSourceKey) {
        rightURL = rightURL + '/' + requestSourceKey;
    }

    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {

        dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_SOURCE_END, requestSourceList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestClosureReasonByKey(dispatch, requestClosureReasonKey) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request/closure_reason';

    if (null != requestClosureReasonKey) {
        rightURL = rightURL + '/' + requestClosureReasonKey;
    }

    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_CLOSURE_REASON_END, requestCloseReasonList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}
export function getRequestSatisfactionVoter(dispatch, requestSatisfactionKey = null) {

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/system/request/satisfaction';

    if (null != requestSatisfactionKey) {
        rightURL = rightURL + '/' + requestClosureReasonKey;
    }

    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.SEARCH_REQUEST_SATISFACTION_END, requestSatisfactionList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });
}
/**
 *
 * @param dispatch
 * @param zKey
 */
export function getRequestActionByRequestKey(dispatch, zKey) {

    dispatch({type: ActionTypes.REQUEST.GRAB_ACTION_BEGIN});

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/crm/requests';

    if (null != zKey) {
        rightURL = rightURL + '/' + zKey + '/actions';
    } else {
        rightURL = rightURL + '/actions';
    }


    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}

    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.GRAB_ACTION_END, operationList: response.data.data});
    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestHistoryByRequestKey(dispatch, zKey) {

    dispatch({type: ActionTypes.REQUEST.GRAB_HISTORY_BEGIN});

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/crm/requests';

    if (null != zKey) {
        rightURL = rightURL + '/' + zKey + '/history';
    } else {
        rightURL = rightURL + '/history';
    }

    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.REQUEST.GRAB_HISTORY_END, historyList: response.data.data});
    }).catch(function (error) {
        console.log(error);
    });
}

export function getRequestCallBizByRequestKey(dispatch, zKey) {
    dispatch({type: ActionTypes.REQUEST.GRAB_CALLBIZ_BEGIN});

    var tmpData = {}, rightURL = window.Laravel.baseURL + 'api/crm/requests';

    if (null != zKey) {
        rightURL = rightURL + '/' + zKey + '/' + 'callbiz';
    } else {
        rightURL = rightURL + '/' + 'callbiz';
    }


    Axios({
        url: rightURL,
        method: 'get',
        /*params: tmpData,*/
        params: {}
    }).then(function (response) {

        var theValue = response.data.data;
        dispatch({type: ActionTypes.REQUEST.GRAB_CALLBIZ_END, callBizList: response.data.data});

    }).catch(function (error) {
        console.log(error);
    });


}

export function redirectToRequestPage(dispatch, router, redirectPath) {

    let requestUrl = 'crm/requests/' + redirectPath;

    router.push(requestUrl);
    dispatch({type: ActionTypes.REQUESTS.REDIRECT_TO_REQUEST_PAGE});
}

/* Get request search lists*/
export function loadCities(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/lists/cities',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_CITIES, list: result.data.data});
    });
}

export function loadTeams(dispatch, viewable) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/teams',
        method: "get",
        params: {
            viewable: viewable
        }
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_TEAMS, list: result.data.data});
    });
}

export function loadRoles(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/roles',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_ROLE_TEAMS, list: result.data.data});
    });
}

export function loadTopics(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/lists/requests/topics/all',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_TOPICS, list: result.data.data});
    });
}

export function loadPriority(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/request/priority',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_PRIORITY, list: result.data.data});
    });
}

export function loadStatus(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/lists/request/status',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_STATUS, list: result.data.data});
    });
}

export function loadStatusTypes(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/lists/request/status/types',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_STATUS_TYPE, list: result.data.data});
    });
}

export function loadUsers(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/team_mates',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_USERS, list: result.data.data});
    });
}

export function requestActionTypes(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/lists/request/action/types',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.LISTS.LOADED_ACTION_TYPES, list: result.data.data});
    });
}

/* Requests search */
export function searchRequest(dispatch, filters) {
    Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/search',
        method: "get",
        params: filters
    }).then(function (result) {
        dispatch({type: ActionTypes.SEARCH.REQUEST_RESULTS_RECEIVED, list: result.data.data,searchFilters:filters});
        dispatch({type: ActionTypes.SEARCH.ORDER_RESULTS});
    });
}

export function addEntityDocumentRequest(dispatch, reqKey, newDocumentDetails) {
    var entityUrl = '';
    var data = new FormData();
    dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DELETING_DOCUMENT});
    entityUrl = window.Laravel.baseURL + 'api/crm/requests/' + reqKey + '/documents';

    data.append('document_name', newDocumentDetails.documentName);
    data.append('file_upload', newDocumentDetails.file);

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});

    Axios({
        url: entityUrl,
        method: 'post',
        data: data
    }).then(function (response) {
        
        GlobalActions.getEntityDocuments(dispatch, 1, reqKey);

        dispatch({type: GlobalActions.ActionTypes.DOCUMENT.ADDED_DOCUMENT});
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

/**
 * 
 */
export function updateRequest(dispatch,requestKey,data){
   return Axios({
        url: window.Laravel.baseURL + 'api/crm/requests/' + requestKey,
        method: 'post',
        data: data,
    }).then(function (result) {
      return result;
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
        SystemActions.displayErrorMessage(error,dispatch);
    });
}
