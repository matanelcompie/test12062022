import Axios from 'axios';
import * as types from './actionTypes';
import {getNextQuestionId, isNeedToDeleteQuestionRoute} from 'libs/helperFunctions';
import * as systemActions from 'actions/systemActions';

export function setActionAreaValidationStatus(dispatch, areaName, isValid) {
    dispatch({ type: types.SET_ACTION_AREA_VALIDATION_STATUS, areaName, isValid });
}
export function onNextQuestionClick() {
    return function(dispatch, getState) {
        let state = getState();
        let nextQuestionId = getNextQuestionId(state);
        dispatch(setActiveQuestion(nextQuestionId));
    }
}


export function onPrevQuestionClick() {
    return function(dispatch, getState) {
        let state = getState();
        let activeQuestionIndex = state.ui.questionnaire.viewedQuestions.indexOf(state.ui.questionnaire.activeQuestionId);
        let prevQuestionId = state.ui.questionnaire.viewedQuestions[activeQuestionIndex - 1];
        dispatch(setActiveQuestion(prevQuestionId));
    }
}

export function setActiveQuestion(questionId) {
    return function(dispatch, getState) {
        let state = getState();
        let nextQuestionId = getNextQuestionId(state);
        let deleteQuestionRoute = isNeedToDeleteQuestionRoute(state, nextQuestionId);
        dispatch({
            type: types.SET_ACTIVE_QUESTION,
            questionId,
            deleteQuestionRoute,
            isNextQuestion: nextQuestionId == questionId
        });
        if(deleteQuestionRoute) {
            dispatch(systemActions.showAlertMessage("שינית את התשובה לשאלה ולכן השאלה הבאה השתנתה" ,"שים לב!"));
        }
    }
}

export function onMenuClick(componentName) {
	return {
        type: types.ON_ACTION_AREA_MENU_CLICK,
        componentName,
    }
}

export function onHouseholdSupportStatusChange(supportStatusKey) {
	return {
        type: types.ON_HOUSEHOLD_SUPPORT_STATUS_CHANGE,
        supportStatusKey,
    }
}

export function onHouseholdVottingStatusChange(vottingStatusKey) {
	return {
        type: types.ON_HOUSEHOLD_VOTTING_STATUS_CHANGE,
        vottingStatusKey,
    }
}

export function onUpdatePhoneClick(phoneKey) {
    return {
        type: types.ON_UPDATE_PHONE_CLICK,
        phoneKey
    }
}

export function resetQuestionnaire(dispatch, firstQuestionId = null) {
    dispatch({type: types.RESET_QUESTIONNAIRE, firstQuestionId});
}

export function calculateQuestionMarginBottom(dispatch, marginBottom) {
    dispatch({type: types.UPDATE_QUESTION_MARGIN_BOTTOM, marginBottom});
}

export function updateActiveHouseholdPhone(dispatch, householdIndex, phoneIndex) {
    dispatch({type: types.UPDATE_ACTIVE_HOUSEHOLD_PHONE, householdIndex, phoneIndex});
}

export function showDeleteHouseholdPhoneModal(dispatch, householdIndex, phoneIndex) {
    dispatch({type: types.SHOW_DELETE_HOUSEHOLD_PHONE_MODAL, householdIndex, phoneIndex});
}

export function hideDeleteHouseholdPhoneModal(dispatch) {
    dispatch({type: types.HIDE_DELETE_HOUSEHOLD_PHONE_MODAL});
}

export function resetUiCallData(dispatch) {
    dispatch({type: types.RESET_UI_CALL_DATA});
}

export function allowEditTransportation(dispatch) {
    dispatch({type: types.ALLOW_EDIT_TRANSPORTATION});
}

export function hideDriversListBlock(dispatch) {
    dispatch({type: types.HIDE_TRANSPORTATION_DRIVERS_LIST});
}

export function loadFakeDrivers(dispatch) {
    dispatch({type: types.LOAD_FAKE_DRIVERS});
}

export function resetUiData(dispatch) {
    dispatch({type: types.RESET_UI_DATA});
}

export function showActualAddressCorrectModal(dispatch) {
    dispatch({type: types.SHOW_ACTUAL_ADDRESS_CORRECT_MODAL});
}

export function hideActualAddressCorrectModal(dispatch) {
    dispatch({type: types.HIDE_ACTUAL_ADDRESS_CORRECT_MODAL});
}

export function showSendSmsModal(dispatch) {
    dispatch({type: types.SHOW_SEND_SMS_MODAL});
}

export function hideSendSmsModal(dispatch) {
    dispatch({type: types.HIDE_SEND_SMS_MODAL});
}

export function enableSendSmsOkStatus(dispatch) {
    dispatch({type: types.ENABLE_SEND_SMS_OK_STATUS_BUTTON});
}

export function disableSendSmsOkStatus(dispatch) {
    dispatch({type: types.DISABLE_SEND_SMS_OK_STATUS_BUTTON});
}

export function changeSmsInputField(dispatch, fieldName, fieldValue) {
    dispatch({type: types.CHANGE_SMS_INPUT_FIELD, fieldName, fieldValue});
}

export function showSendEmailModal(dispatch) {
    dispatch({type: types.SHOW_SEND_EMAIL_MODAL});
}

export function hideSendEmailModal(dispatch) {
    dispatch({type: types.HIDE_SEND_EMAIL_MODAL});
}

export function enableSendEmailOkStatus(dispatch) {
    dispatch({type: types.ENABLE_SEND_EMAIL_OK_STATUS_BUTTON});
}

export function disableSendEmailOkStatus(dispatch) {
    dispatch({type: types.DISABLE_SEND_EMAIL_OK_STATUS_BUTTON});
}

export function changeSendEmailInputField(dispatch, fieldName, fieldValue) {
    dispatch({type: types.CHANGE_SEND_EMAIL_INPUT_FIELD, fieldName, fieldValue});
}

export function showDeletePhoneModal(dispatch, phoneIndex, modalHeader) {
    dispatch({type: types.SHOW_DELETE_PHONE_MODAL, phoneIndex, modalHeader});
}

export function hideDeletePhoneModal(dispatch) {
    dispatch({type: types.HIDE_DELETE_PHONE_MODAL});
}

export function changeCampaignFile(dispatch, selectedFile) {
    dispatch({type: types.CAMPAIGN_FILE_CHANGE, selectedFile});
}