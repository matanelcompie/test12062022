import Axios from 'axios';
import * as types from './actionTypes';
import R from 'ramda';


export function onVoterAnswerChange(questionId, answer) {
    return {
        type: types.ON_VOTER_ANSWER_CHANGE,
        questionId,
        answer,
    }
}

export function onCallAnswerChange(path, value) {
    return {
        type: types.ON_CALL_ANSWER_CHANGE,
        path,
        value,
    }
}

export function onCallAnswerNotChanged(path) {
    return {
        type: types.ON_CALL_ANSWER_NOT_CHANGED,
        path,
    }
}

// export function storeCallNote(data) {
//     return function(dispatch) {
//         dispatch({
//             type: types.STORE_CALL_NOTE,
//             data
//         });
//     }
// }
//
// export function storeSupportStatus(data) {
//     return function(dispatch) {
//         dispatch({
//             type: types.STORE_SUPPORT_STATUS,
//             data
//         });
//     }
// }

export function onHouseholdVoterDetailsChange(pathArr, value, name , voterKey) {
    return function(dispatch, getState) {
        let householdVoterDetails = getState().call.activeCall.voter.household;
        let voterDetails;
        if(name == "support_status_tm" )
            voterDetails = householdVoterDetails.filter(voter => {
                return (voter.key == voterKey && voter[name] != undefined && voter[name].support_status_id == value);
            })[0];
        else if(name == "vote_status")
            voterDetails = householdVoterDetails.filter(voter => {
                return (voter.key == voterKey && voter[name] == value);
            })[0];

        let callNoteDetails = getState().callAnswer.callNote.household;

        if(!voterDetails && (R.isEmpty(callNoteDetails) || callNoteDetails[voterKey] == undefined || callNoteDetails[voterKey][name] != value)) {
            dispatch(onCallAnswerChange(pathArr, value));
        }
        else if (voterDetails && !R.isEmpty(callNoteDetails) && callNoteDetails[voterKey][name] != value)
            dispatch(onCallAnswerNotChanged(pathArr));
    }
}

export function onApplyAllHouseholdStatus(statusValue, fieldName) {
    return function(dispatch, getState) {
        let householdVoterDetails = getState().call.activeCall.voter.household;
        householdVoterDetails.map(item =>
            dispatch(onCallAnswerChange(['callNote', 'household', item.key, fieldName], statusValue))
        );
    }
}

export function onUpdatePhoneNumber(voter, phoneObj) {
    return function(dispatch, getState) {
        let origDetails = getState().call.activeCall.voter.household;
        let origPhones = (R.find(R.propEq('key', voter.key))(origDetails)).phones || [];
        let voterUpdates = R.clone(getState().callAnswer.callNote.household[voter.key]) || {};
        let phoneUpdates = voterUpdates.phones || [];

        let origIdx = R.findIndex(R.propEq('key', phoneObj.key))(origPhones);
        let updatedIdx = R.findIndex(R.propEq('key', phoneObj.key))(phoneUpdates);

        if (updatedIdx === -1) { // has not yet been updated
            phoneUpdates = R.append(phoneObj, phoneUpdates);
        } else if ((phoneObj.is_new && phoneObj.is_deleted === true)    // if it's new and getting removed
            || ((origIdx > -1)                                          // or it exists
                && !phoneObj.is_deleted                                 // and it's not being deleted
                && R.eqProps('phone_number', origPhones[origIdx], phoneObj)) // but the num is the same
            )
        {   // then we want to actually remove the entry from the update array
            phoneUpdates = R.remove(updatedIdx, 1, phoneUpdates);
        } else {
            // all other cases, we just want to apply the update
            phoneUpdates = R.update(updatedIdx, phoneObj, phoneUpdates);
        }

        if (!R.isEmpty(phoneUpdates)) {
            dispatch(onCallAnswerChange(['callNote', 'household', voter.key, 'phones'], phoneUpdates));
        } else {
            dispatch(onCallAnswerNotChanged(['callNote', 'household', voter.key, 'phones']));
        }
    }
}

export function onAddPhoneNumber(voter) {
    return function (dispatch, getState) {
        let household = getState().call.activeCall.voter.household || [];
        let hhChanges = getState().callAnswer.callNote.household;
        household = R.merge(R.indexBy(R.prop('key'), household), hhChanges);
        let phones = R.path([voter.key, 'phones'], household) || [];

        let phoneKeys = R.pluck('key')(phones);
        let tempKey = R.reduce(R.max, '', phoneKeys) || voter.key;
        let tempKeyIdx = R.indexOf(tempKey, phoneKeys);

        while (tempKeyIdx > -1) {
            if (!R.isEmpty(phones[tempKeyIdx].phone_number)) {
                tempKey += '-';
                tempKeyIdx = R.indexOf(tempKey, phoneKeys);
            } else {
                break;
            }
        }

        phones = R.append({
            key: tempKey,
            phone_number: '',
            is_new: true,
            is_updated: true,
        }, phones);

        dispatch(onCallAnswerChange(['callNote', 'household', voter.key, 'phones'], phones));
        dispatch({type: types.ON_UPDATE_PHONE_CLICK, phoneKey: tempKey});
    }
}

export function resetVoterAnswers(dispatch) {
    dispatch({type: types.RESET_VOTER_ANSWERS});
}

export function resetCallNote(dispatch) {
    dispatch({type: types.RESET_CALL_NOTE});
}

export function saveCallData(callKey, callSeconds, actionCallSeconds, voterAnswers, callNote, household, endCallStatusCode,
                             endCallStatusItems, transportation, address, supportStatusTm, voterPhones, voterEmail, metaDataValues) {
    Axios({
        url: window.Laravel.baseURL + 'api/cti/calls/' + callKey,
        method: 'put',
        data: {
            call_seconds: callSeconds,
            action_call_seconds: actionCallSeconds,
            voter_answers: voterAnswers,
            call_note: callNote,
            household: household,
            call_end_status: endCallStatusCode,
            call_end_status_items: endCallStatusItems,
            transportation: transportation,
            address: address,
            support_status_tm: supportStatusTm,
            voter_phones: voterPhones,
            voter_email: voterEmail,
            meta_data_values: metaDataValues
        }
    }).then(function (result) {
        //console.log(result);
    }).catch(function (error) {
        //console.log(error);
    });
}