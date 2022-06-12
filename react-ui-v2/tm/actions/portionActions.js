import Axios from 'axios';
import store from 'store';
import * as SystemActions from 'actions/SystemActions';
import * as VoterFilterActions from 'actions/VoterFilterActions';
import errors from 'libs/errors'

export const types = {
    GET_ALL_PORTIONS_SUCCESS: 'GET_ALL_PORTIONS_SUCCESS',
    GET_TARGET_GROUP_SUCCESS: 'GET_TARGET_GROUP_SUCCESS',
    SAVE_BASIC_PORTION_SUCCESS: 'SAVE_BASIC_PORTION_SUCCESS',
    DELETE_PORTION_SUCCESS: 'DELETE_PORTION_SUCCESS',
    ON_EDIT_PORTIONS_ORDER_CLICK: 'ON_EDIT_PORTIONS_ORDER_CLICK',
    ON_EDIT_PORTIONS_ORDER_CANCEL: 'ON_EDIT_PORTIONS_ORDER_CANCEL',
    ON_PORTIONS_REORDER: 'ON_PORTIONS_REORDER',
    SAVE_PORTION_LIST_SUCCESS: 'SAVE_PORTION_LIST_SUCCESS',
    ON_OPEN_PORTION_MODAL_CLICK: 'ON_OPEN_PORTION_MODAL_CLICK',
    ON_CLOSE_PORTION_MODAL_CLICK: 'ON_CLOSE_PORTION_MODAL_CLICK',
    SET_PORTION_CHANGE_STATUS: 'SET_PORTION_CHANGE_STATUS',
    SET_PORTION_VOTERS_COUNT: 'SET_PORTION_VOTERS_COUNT',
    SET_PORTION_VOTERS_ACTIVE: 'SET_PORTION_VOTERS_ACTIVE',
    SET_CACULATE_VOTERS_COUNT_STATUS: 'SET_CACULATE_VOTERS_COUNT_STATUS',
    UPDATE_PORTIONS_LIST_FOR_CALCULATION: 'UPDATE_PORTIONS_LIST_FOR_CALCULATION',
    REMOVE_PORTION_FROM_CALCULATION_LIST: 'REMOVE_PORTION_FROM_CALCULATION_LIST',
    RESET_PORTION_CALCULATION_LIST: 'RESET_PORTION_CALCULATION_LIST',
    SET_CAMPAIGN_PORTIONS_LIST: 'SET_CAMPAIGN_PORTIONS_LIST',
    SET_CAMPAIGN_PORTIONS_FIELD: 'SET_CAMPAIGN_PORTIONS_FIELD',
};

function getAllPortionsSuccess(data) {
    return {
        data,
        type: types.GET_ALL_PORTIONS_SUCCESS
    }
}

export function getAllPortions(campaignKey, affectedPortions = [],  isNewPortionAdd = null) {
	 
    return function (dispatch) {
		 
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}/portions`,
            method: 'get'
        }).then(result => {
            let portions = result.data.data;
            dispatch(getAllPortionsSuccess(portions));
            if (isNewPortionAdd) {
                let voterFilterKey = portions[portions.length - 1].key;
                affectedPortions.push({ voterFilterKey, unique: true, calculate: true, moduleType: 'portion' });
                affectedPortions.push({ voterFilterKey, unique: false, calculate: true, moduleType: 'portion' });
            }
			 dispatch({type:types.SET_CAMPAIGN_PORTIONS_FIELD , fieldName:'loadedPortions' , fieldValue:true});
            setUpdatedPortions(affectedPortions)(dispatch);
           
        }, error => {
            console.log('getAllPortions failed');
        })
    }
}

function getTargetGroupSuccess(data) {
    return {
        data,
        type: types.GET_TARGET_GROUP_SUCCESS
    }
}

export function getTargetGroup(campaignKey) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/voter_filters/abcde',
            method: 'get'
        }).then(result => {
            dispatch(getTargetGroupSuccess(result.data.data));
        }).catch(error => {
            console.log('getTargetGroup failed');
        })
    }
}

export function updateActivePortion(portion, affectedPortions, active) {
    return function (dispatch) {
        dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
        Axios({
            url: window.Laravel.baseURL + `api/voter_filters/${portion.key}`,
            method: 'put',
            data: portion
        }).then(result => {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            setUpdatedPortions(affectedPortions)(dispatch);
            dispatch({ type: types.SET_PORTION_VOTERS_ACTIVE, voterFilterKey: portion.key, active });

            // getAllPortions(newPortion.currentCampaignKey, affectedPortions)(dispatch);
        }, function(error) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            displayErrorMessage(error, dispatch);
        })
    }
}

export function savePortionList(portions, currentCampaignKey) {
    return function (dispatch) {
        dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
        Axios({ 
            url: window.Laravel.baseURL + `api/tm/campaigns/${currentCampaignKey}/portions`,
            method: 'put',
            data: portions
        }).then(result => {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            dispatch(savePortionListSuccess(result.data.data));
            getAllPortions(currentCampaignKey)(dispatch);
        }, function(error) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            displayErrorMessage(error, dispatch);
            console.log('savePortionList failed');
        })
    }
}
function savePortionListSuccess(data) {
    return {
        data,
        type: types.SAVE_PORTION_LIST_SUCCESS
    }
}

export function deletePortion(data, affectedPortions) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + `api/voter_filters/${data.key}`,
            method: 'delete' , 
			data:{module_src :'telemarketing'}
        }).then(result => {
            getAllPortions(data.currentCampaignKey, affectedPortions)(dispatch);
        }, function (error) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            displayErrorMessage(error, dispatch);
        });
    }
}

export function onEditPortionsOrderClick() {
    return function (dispatch) {
        dispatch({
            type: types.ON_EDIT_PORTIONS_ORDER_CLICK
        });
    }
}

export function onEditPortionsOrderCancel() {
    return function (dispatch) {
        dispatch({
            type: types.ON_EDIT_PORTIONS_ORDER_CANCEL
        });
    }
}

export function onPortionReorder(reorderedPortions) {
    return function (dispatch, getState) {
        if (getState().tm.portion.isEditPortionsOrderMode) {
            dispatch({
                type: types.ON_PORTIONS_REORDER,
                data: reorderedPortions
            });
        }
    }
}

export function onOpenPortionModalClick(portionKey, isNew) {
    return function (dispatch) {
        dispatch({
            type: types.ON_OPEN_PORTION_MODAL_CLICK,
            portionKey,
            isNew
        });
    }
}

export function onClosePortionModalClick() {
    return function (dispatch) {
        dispatch({
            type: types.ON_CLOSE_PORTION_MODAL_CLICK
        });
    }
}

export function setVoterFilterChangeStatus(isEditedPortionChanged) {
    return function (dispatch) {
        dispatch({ type: types.SET_PORTION_CHANGE_STATUS, isEditedPortionChanged })
    }
}

var CancelToken = Axios.CancelToken;
var source;

export function getCountVoters(voterFilterKey, calculate, unique, moduleType) {
    source = CancelToken.source();

    return function (dispatch) {
        dispatch({ type: types.SET_CACULATE_VOTERS_COUNT_STATUS, isCalculatingCount: true });
        dispatch({ type: types.REMOVE_PORTION_FROM_CALCULATION_LIST, voterFilterKey: voterFilterKey, unique: unique });

        let params = { calculate, unique };

        Axios({
            url: window.Laravel.baseURL + `api/voter_filters/count_voters/` + voterFilterKey,
            method: 'get',
            params,
            cancelToken: source.token
        }).then(
            result => {
                if (!unique) {//update voter filter if not unique count
                    dispatch({
                        type: VoterFilterActions.types.GET_COUNT_VOTERS_BY_VOTER_FILTER,
                        countVoters: result.data.data,
                        voterFilterKey: voterFilterKey,
                        moduleType
                    });
                }
                dispatch({ type: types.SET_CACULATE_VOTERS_COUNT_STATUS, isCalculatingCount: false });
                dispatch({ type: types.SET_PORTION_VOTERS_COUNT, votersCount: result.data.data, voterFilterKey: voterFilterKey, unique: unique })
            }), function (error) {
                console.log('getCountVoters failed', error)
            }
    }
}

export function cancelGetCountVoters() {
    return function (dispatch) {
        source.cancel('Operation canceled by the user, cancelGetCountVoters.');
        dispatch({ type: types.SET_CACULATE_VOTERS_COUNT_STATUS, isCalculatingCount: false });
    }
}

export function setUpdatedPortions(affectedPortions) {
    return function (dispatch) {
        if (affectedPortions && affectedPortions.length > 0) {
            dispatch({ type: types.UPDATE_PORTIONS_LIST_FOR_CALCULATION, affectedPortions });
        }
    }
}

export function resetPortionsCalculationList() {
    return function (dispatch) { dispatch({ type: types.RESET_PORTION_CALCULATION_LIST }); }
}

/**
 * @function getCampaignPortions
 *  Get all the portions
 *  -> for select portion modal.
 * @returns portion list (in portion state). 
 */
export function getCampaignPortions(currentCampaignKey) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/portions?key=` + currentCampaignKey,
            method: 'get',
        }).then(
            response => {
                dispatch({ type: types.SET_CAMPAIGN_PORTIONS_LIST, data: response.data.data });
            }), function (error) {
                console.log('getCountVoters failed', error)
            }
    }
}
export function copyPortionByKey(campaignKey, portionKey) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + `api/tm/campaigns/` + campaignKey + `/portions`,
            method: 'post',
            data: { portionKey: portionKey }
        }).then(function (response) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            getAllPortions(campaignKey, [], true)(dispatch);
        }), function (error) {
            console.log('copy Portion failed', error)
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        }
    }
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

            if (errorCode) {
                dispatch({ type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: errors[errorCode] });
            }
        }
    }

}
