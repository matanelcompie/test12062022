import Axios from 'axios';
import * as types from './actionTypes';


function addNewCallSuccess(data) {
    return {
        type: types.ADD_NEW_CALL_SUCCESS,
        data
    }
}

function addNewCallFailed(error) {
    return {
        type: types.ADD_NEW_CALL_FAILED,
        error
    }
}
export function updateCallStatus(dispatch, callStatus) { // waiting, break, in_call, list
    dispatch({ type: types.UPDATE_CALL_STATUS, callStatus });
}
export function getNextVoterCall(dispatch, campaignKey) {
    let url = window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/calls/manual';

    Axios({
        url: url,
        method: "post",
    }).then(function(result) {
        let phoneData = result.data.data;
        // let voterData = { ...result.data.data.voter_data, household: []}
        // let current_phone = { ...voterData.current_phone, phone_id: voterData.current_phone.id}
        if(!phoneData || phoneData.length == 0){
            setTimeout(() =>{
                getNextVoterCall(dispatch, campaignKey)
            }, 1000)
        }else{

            dispatch({ type: types.SET_MANUAL_VOTER_CALL_DATA, manual_voter_call_data: phoneData[0]});

        }
        // dispatch({ type: types.GET_ACTIVE_CALL_VOTER_FROM_MANUAL_CALL, voterData });

    }, function(error) {

    });
}
export function addNewCall(dispatch, campaignKey, callData, sipNumber) {

    let url = window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/calls';
    dispatch({type: types.NEW_CALL_ERROR, errorCode: null});
    Axios({
        url: url,
        method: "post",
        data: {
            phone_id: callData.phoneId || '',
            sip_number: sipNumber,
            sip_server_key: callData.sipServerKey || ''
        }
    }).then(function(result) {
        
    }, function(error) {
        if (error && error.response && error.response.data && error.response.data.error_code) {
            let errorCode = error.response.data.error_code
            dispatch({type: types.NEW_CALL_ERROR, errorCode});
        } 
    });
}

function getCallSuccess(data) {
    return {
        type: types.GET_CALL_SUCCESS,
        data
    }
}

function getCallFailed(error) {
    return {
        type: types.GET_CALL_FAILED,
        error
    }
}

export function getCallDetails(callKey) {
    return function(dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/tm/calls/' + callKey,
            method: "get"
        }).then(
            result => dispatch(getCallSuccess(result.data.data))
        ).catch(
            error => dispatch(getCallFailed(error))
        )
    }
}

function finishCallSuccess(data) {
    return {
        type: types.FINISH_CALL_SUCCESS,
        data
    }
}

function finishCallFailed(error) {
    return {
        type: types.FINISH_CALL_FAILED,
        error
    }
}

function getAge(birthDate) {
    var date = new Date();
    var currentYear = date.getFullYear();
    var birthYear = "";
    var arrOfDatElements = [];

    arrOfDatElements = birthDate.split('-');
    birthYear = arrOfDatElements[0];

    if ( null == birthDate ) {
        return '\u00A0';
    } else {
        return currentYear - birthYear;
    }
}

export function finishCall() {
    return function(dispatch, getState) {
        let call = getState().call.activeCall;
        let callMeta = {
            voters_answers: getState().callAnswer.voters_answers,
            call_note: getState().callAnswer.call_note,
        };

        Axios({
            url: window.Laravel.baseURL + 'api/tm/calls/' + call.key + '/finish',
            method: "post",
            data: Object.assign({},call,_.omitBy(callMeta,_.isEmpty)) // will add in all the details that are not empty
        }).then(
            result => dispatch(finishCallSuccess(result.data.data))
        ).catch(
            error => dispatch(finishCallFailed(error))
        )
    }
}

export function enterCallScreen(dispatch) {
    dispatch({type: types.ENTER_CALL_SCREEN});
}

export function leaveCallScreen(dispatch) {
    dispatch({type: types.LEAVE_CALL_SCREEN});
}

export function loadFakeData(dispatch) {
    dispatch({type: types.LOAD_FAKE_DATA});
}

export function updateTimer(dispatch) {
    dispatch({type: types.UPDATE_TIMER_TICKS});
}

export function endCall(dispatch) {
    dispatch({type: types.END_CALL});
}

export function startNewCall(dispatch) {
    dispatch({type: types.START_NEW_CALL});
}

export function disableNextCall(dispatch) {
    dispatch({type: types.DISABLE_NEXT_CALL_BUTTON});
}
export function resetCallTimer(dispatch) {
    dispatch({type: types.RESET_CALL_TIMER});
}

export function resetActiveCaller(dispatch) {
    dispatch({type: types.RESET_ACTIVE_CALLER});
}

export function getActiveCallVoterFromSocket(dispatch, voterData) {
    dispatch({type: types.GET_ACTIVE_CALL_VOTER_FROM_SOCKET, voterData});
}

export function setActiveCallKey(dispatch, callKey) {
    dispatch({type: types.SET_ACTIVE_CALL_KEY, callKey});
}

export function getVoterData(dispatch, callKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/calls/' + callKey + '/voter',
        method: "get"
    }).then(function (result) {
        let voterData = result.data.data;
        let household = result.data.data.household;
        let details = result.data.data.details;
        let householdIndex = -1;
        let phoneIndex = -1;
        let voterMetaData = result.data.data.voterMetaData;
        let supportStatusFinal = result.data.data.details.support_status_final;

        for ( householdIndex = 0; householdIndex < household.length; householdIndex++ ) {
            if ( household[householdIndex].birth_date != null ) {
                household[householdIndex].age = getAge(household[householdIndex].birth_date);
            }

            switch (household[householdIndex].vote_status) {
                case 1:
                    household[householdIndex].vote_status = true;
                    break;

                case 0:
                default:
                    household[householdIndex].vote_status = false;
                    break;
            }

            for ( phoneIndex = 0; phoneIndex < household[householdIndex].phones.length; phoneIndex++ ) {
                household[householdIndex].phones[phoneIndex].deleted = false;
                household[householdIndex].phones[phoneIndex].valid = true;
            }
        }

        dispatch({type: types.LOAD_ACTIVE_CALL_VOTER_HOUSEHOLD, household});
        dispatch({type: types.LOAD_ACTIVE_CALL_VOTER_TRANSPORTATION, voterData});
        dispatch({type: types.LOAD_ACTIVE_CALL_VOTER_ADDRESS, details});
        dispatch({type: types.LOAD_ACTIVE_CALL_VOTER_META_DATA, voterMetaData});
        dispatch({type: types.LOAD_ACTIVE_CALL_VOTER_SUPPORT_STATUS_FINAL, supportStatusFinal});
    }).catch(function (error) {
        console.log(error);
    });
}

export function deleteVoterHouseholdPhone(dispatch, householdIndex, phoneIndex) {
    dispatch({type: types.DELETE_VOTER_HOUSEHOLD_PHONE, householdIndex, phoneIndex});
}

export function addVoterHouseholdPhone(dispatch, householdIndex) {
    dispatch({type: types.ADD_VOTER_HOUSEHOLD_PHONE, householdIndex});
}

export function voterHouseholdPhoneChange(dispatch, householdIndex, phoneIndex, phoneNumber, validPhone) {
    dispatch({type: types.VOTER_HOUSEHOLD_PHONE_NUMBER_INPUT_CHANGE, householdIndex, phoneIndex, phoneNumber, validPhone});
}

export function showEndCallStatusMenu(dispatch) {
    dispatch({type: types.SHOW_END_CALL_STATUS});
}

export function hideEndCallStatusMenu(dispatch) {
    dispatch({type: types.HIDE_END_CALL_STATUS});
}

export function changeEndCallStatusCode(dispatch, endCallStatusCode = null) {
    dispatch({type: types.CHANGE_END_CALL_STATUS_CODE, endCallStatusCode});
}

export function resetEndcallStatus(dispatch) {
    dispatch({type: types.RESET_END_CALL_STATUS});
}

export function changeEndCallStatusSubMenu(dispatch, subItemName, subItemValue) {
    dispatch({type: types.CHANGE_END_CALL_STATUS_SUB_MENU, subItemName, subItemValue});
}

export function loadVoterCityStreets(dispatch, cityKey, initialLoading = false, updateOld = false) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/cities/' + cityKey + '/streets',
        method: "get"
    }).then(function (result) {
        let cityStreets = result.data.data;

        dispatch({type: types.LOAD_CITY_STREETS, cityStreets});

        if ( initialLoading ) {
            dispatch({type: types.VOTER_ADDRESS_INIT_VOTER_STREET_ID, cityStreets, updateOld});
        }
    });
}

export function resetVoterCityStreets(dispatch) {
    dispatch({type: types.RESET_CITY_STREETS});
}

export function changeVoterAddressInputField(dispatch, fieldName, fieldValue) {
    dispatch({type: types.CHANGE_VOTER_ADDRESS_INPUT_FIELD, fieldName, fieldValue});
}

export function undoVoterAddressChanges(dispatch) {
    dispatch({type: types.UNDO_VOTER_ADDRESS_CHANGES});
}

export function updateVoterAddressToMi(dispatch) {
    dispatch({type: types.UPDATE_VOTER_ADDRSS_TO_MI_ADDRESS});
}

export function updateLoadedVoter(dispatch, loadedVoter) {
    dispatch({type: types.UPDATE_LOADED_VOTER, loadedVoter});
}

export function saveOldVoterCityId(dispatch, cityId) {
    dispatch({type: types.SAVE_OLD_VOTER_CITY_ID, cityId});
}

export function updateTransportationNeed(dispatch, needsTransportation) {
    dispatch({type: types.UPDATE_TRANSPORTATION_NEED, needsTransportation});
}

export function changeTransportationInputField(dispatch, fieldName, fieldValue) {
    dispatch({type: types.CHANGE_TRANSPORTATION_INPUT_FIELD, fieldName, fieldValue});
}

export function undoTransportDataChanges(dispatch) {
    dispatch({type: types.UNDO_TRANSPORT_DATA_CHANGE});
}

export function muteCall(dispatch) {
    dispatch({type: types.MUTE_CALL});
}

export function unMuteCall(dispatch) {
    dispatch({type: types.UNMUTE_CALL});
}

export function addPhoneToVoter(dispatch, phoneObj) {
    dispatch({type: types.ADD_PHONE_TO_VOTER, phoneObj});
}

export function sendSms(callKey, phoneNumber, message) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/calls/' + callKey + '/sms',
        method: "post",
        data: {
            phone_number: phoneNumber,
            message,
        }
    }).then(function (result) {
        console.log('OK');
    });
}

export function updateVoterEmail(dispatch, email) {
    dispatch({type: types.UPDATE_VOTER_EMAIL, email});
}

export function updateVoterContactViaEmail(dispatch, contactViaEmail) {
    dispatch({type: types.UPDATE_VOTER_CONTACT_VIA_EMAIL, contactViaEmail});
}

export function sendEmail(callKey, email, subject, message) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/calls/' + callKey + '/email',
        method: "post",
        data: {
            email,
            subject,
            message,
        }
    }).then(function (result) {
        console.log('OK');
    });
}

export function changeVoterPhoneInputField(dispatch, phoneIndex, fieldName, fieldValue) {
    dispatch({type: types.CHANGE_VOTER_PHONE_INPUT_FIELD, phoneIndex, fieldName, fieldValue});
}

export function undoVoterPhoneChanges(dispatch, phoneIndex) {
    dispatch({type: types.UNDO_VOTER_PHONE_CHANGES, phoneIndex});
}

export function deleteVoterPhone(dispatch, phoneIndex) {
    changeVoterPhoneInputField(dispatch, phoneIndex, 'deleted', true);
}

export function updateVoterSupportStatusTm(dispatch, supportStatusTm) {
    dispatch({type: types.UPDATE_VOTER_SUPPORT_STATUS_TM, supportStatusTm});
}

export function updateVoterMetaKeyValueId(dispatch, metaKeyId, metValueId) {
    dispatch({type: types.UPDATE_VOTER_META_KEY_VALUE_ID, metaKeyId, metValueId});
}