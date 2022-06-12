import Axios from 'axios';
import * as SystemActions from 'actions/SystemActions';
import * as GlobalActions from 'actions/GlobalActions';
import * as portionActions from 'tm/actions/portionActions';

import errors from 'libs/errors'

export const types = {
    LOAD_VOTER_FILTER: 'LOAD_VOTER_FILTER',
    GET_VOTER_FILTER_DEFINITIONS: 'GET_VOTER_FILTER_DEFINITIONS',
    GET_COUNT_VOTERS_BY_VOTER_FILTER: 'GET_COUNT_VOTERS_BY_VOTER_FILTER',
    EXPAND_FILTER_TYPE: 'EXPAND_FILTER_TYPE',
    UPDATE_FILTER_ITEMS_BY_TYPE: 'UPDATE_FILTER_ITEMS_BY_TYPE',
    CHANGE_FILTER_ITEMS_BY_TYPE: 'CHANGE_FILTER_ITEMS_BY_TYPE',
    RESET_FILTER_ITEMS_BY_TYPE: 'RESET_FILTER_ITEMS_BY_TYPE',
    SAVE_VOTER_FILTER_SUCCESS: 'SAVE_VOTER_FILTER_SUCCESS',
    CHANGE_VOTER_FILTER_NAME: 'CHANGE_VOTER_FILTER_NAME',
    GET_GEO_OPTIONS_INIT: 'GET_GEO_OPTIONS_INIT',
    GET_GEO_OPTIONS: 'GET_GEO_OPTIONS',
    CHANGE_GEO_ITEM: 'CHANGE_GEO_ITEM',
    UPDATE_GEO_ITEM: 'UPDATE_GEO_ITEM',
    ADD_GEO_ITEM: 'ADD_GEO_ITEM',
    DELETE_GEO_ITEM: 'DELETE_GEO_ITEM',
    LOAD_ELECTION_CAMPAIGNS: 'LOAD_ELECTION_CAMPAIGNS',
    LOAD_TM_CAMPAIGNS: 'LOAD_TM_CAMPAIGNS',
    LOAD_CURRENT_ELECTION_CAMPAIGN: 'LOAD_CURRENT_ELECTION_CAMPAIGN',
    LOAD_DEFINITION_VALUES: 'LOAD_DEFINITION_VALUES',

    RESET_CITY_GEO_ENTITY_TYPES: 'RESET_CITY_GEO_ENTITY_TYPES'
};

export function loadDefinitionValues(dispatch, moduleType, definitionId, relatedValues, electionCampaign = false, combinedDefinition = false) {
    let data = { values: relatedValues };
    if (electionCampaign && electionCampaign != -1) {
        data['election_campaign'] = electionCampaign;
    }

    Axios({
        url: window.Laravel.baseURL + `api/voter_filters/definitions/${definitionId}/values`,
        method: 'get',
        params: data
    }).then(
        result => {
            dispatch({ type: types.LOAD_DEFINITION_VALUES, moduleType, definitionId, electionCampaign, combinedDefinition, values: result.data.data });
        }).catch(
            error => {
                console.log('loadDefinitionValues failed');
            })
}

export function loadElectionCampaigns() {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/elections/campaigns',
            method: 'get'
        }).then(
            result => dispatch({ type: types.LOAD_ELECTION_CAMPAIGNS, data: result.data.data })
        ).catch(
            error => console.log('loadElectionCampaigns failed')
        )
    }
}

export function globalLoadSlimTmCampaigns(dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/tm/campaigns?slim=1',
            method: 'get'
        }).then(
            result => dispatch({ type: types.LOAD_TM_CAMPAIGNS, data: result.data.data })
        ).catch(
            error => console.log('loadTmCampaigns failed')
        )
}

export function loadSlimTmCampaigns() {
    return function (dispatch) {
        globalLoadSlimTmCampaigns(dispatch);
    }
}

export function loadCurrentElectionCampaign() {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + 'api/system/current/campaign',
            method: 'get'
        }).then(
            result => dispatch({ type: types.LOAD_CURRENT_ELECTION_CAMPAIGN, data: result.data.data })
        ).catch(
            error => console.log('loadCurrentElectionCampaign failed')
        )
    }
}

export function loadVoterFilter(voterFilter, moduleType) {
    if (_.isEmpty(voterFilter.filter_items))
        voterFilter.filter_items = [];
    return function (dispatch) {
        dispatch({
            type: types.LOAD_VOTER_FILTER,
            voterFilter,
            moduleType
        });
    }
}

function getVoterFilterDefinitionsSuccess(data, moduleType) {
    if (_.isEmpty(data)){data = {}};
    return {
        type: types.GET_VOTER_FILTER_DEFINITIONS,
        data,
        moduleType
    }
}

export function getVoterFilterDefinitions(moduleType) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + `api/filter_groups/${moduleType}`,
            method: 'get'
        }).then(
            result => dispatch(getVoterFilterDefinitionsSuccess(result.data.data, moduleType))
            ),error => console.log('getVoterFilterDefinitions failed')
    }
}

function loadFilterItems(dispatch, voterFilterKey, moduleType) {
    Axios({
        url: window.Laravel.baseURL + `api/voter_filters/${voterFilterKey}`,
        method: 'get'
    }).then(
        result => {
            dispatch({ type: types.SAVE_VOTER_FILTER_SUCCESS, moduleType, voterFilter: result.data.data });
        },
        error => {
            console.log('loadFilterItems failed');
        })
}

export function saveFilterItemsByType(dispatch, data, voterFilterKey, moduleType) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    Axios({
        url: window.Laravel.baseURL + `api/voter_filters/${voterFilterKey}`,
        method: 'put',
        data: data
    }).then(
        result => {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            loadFilterItems(dispatch, voterFilterKey, moduleType);
        }, error => {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
            console.log('saveFilterItemsByType failed');
        })
}

export function onVoterFilterNameChange(voterFilterName, moduleType, voterFilterKey) {
    return function (dispatch) {
        dispatch({
            type: types.CHANGE_VOTER_FILTER_NAME,
            voterFilterName,
            moduleType,
            voterFilterKey
        })
    }
}

function saveVoterFilterSuccess(voterFilter, moduleType, isNew) {
    if (_.isEmpty(voterFilter.filter_items))
        voterFilter.filter_items = [];
    return {
        type: types.SAVE_VOTER_FILTER_SUCCESS,
        voterFilter,
        moduleType,
        isNew
    }
}

export function saveVoterFilter(moduleType, voterFilterKey = null, campaignKey = null) {
    return function (dispatch, getState) {
        let voterFilter = getState().global.voterFilter[moduleType].vf;
        let url, method;
        let isNew = voterFilter.newVoterFilterParentKey ? true : false;
        if (isNew) { // new voter filter
            url = window.Laravel.baseURL + `api/voter_filters/${voterFilter.newVoterFilterParentKey}/${moduleType}`
            method = 'post';
        }else { // update voter filter
            url = window.Laravel.baseURL + `api/voter_filters/${voterFilter.key}`;
            method ='put';
        }
		voterFilter.module_src = 'telemarketing';
		voterFilter.campaign_key = campaignKey;
        dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
		
		 
        Axios({
            url: url,
            method: method,
            data: voterFilter
        }).then(
            result => {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
                if(moduleType == 'portion' && campaignKey != null){
                    portionActions.getAllPortions(campaignKey, [], isNew)(dispatch);
                }
                // dispatch(saveVoterFilterSuccess(result.data.data, moduleType, isNew));
            }, error => {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
                displayErrorMessage(error, dispatch);

                console.log('saveVoterFilter failed', error);
            }
        )
    }
}


function getGeoOptionsInitSuccess(data = {}) {
    return {
        type: types.GET_GEO_OPTIONS_INIT,
        data
    }
}

export function getGeoOptionsInit(screenPermission = null) {
    return function (dispatch, getState) {
        if (_.isEmpty(getState().global.voterFilter.geo_options)) {
            Axios({
                url: window.Laravel.baseURL + `api/voter_filters/geo_init`,
                method: 'get',
                params: { screen_permission: screenPermission }
            }).then(
                result => dispatch(getGeoOptionsInitSuccess(result.data.data))
            ).catch(
                error => console.log('getGeoOptions failed')
            )
        }
    }
}

function getGeoOptionsSuccess(data = {}) {
    return {
        type: types.GET_GEO_OPTIONS,
        data
    }
}

export function getGeoOptions(entityType, entityId, partial = false) {
    return function (dispatch) {
        Axios({
            url: window.Laravel.baseURL + `api/voter_filters/geo/${entityType}/${entityId + (partial ? '?partial' : '')}`,
            method: 'get'
        }).then(
            result => dispatch(getGeoOptionsSuccess(result.data.data))
            ,
            error => console.log('getGeoOptions failed')
        )
    }
}

export function changeGeoItem(geoItem, moduleType, voterFilterKey) {
    return function (dispatch) {
        dispatch({
            type: types.CHANGE_GEO_ITEM,
            geoItem,
            moduleType,
            voterFilterKey,
        })
    }
}

function updateGeoItemSuccess(geoItem, moduleType, voterFilterKey) {
    return {
        type: types.UPDATE_GEO_ITEM,
        geoItem,
        voterFilterKey,
        moduleType
    }
}

export function updateGeoItem(geoItem, moduleType, voterFilterKey) {
    return function (dispatch) {
        if (geoItem.isNew) {
            dispatch(updateGeoItemSuccess(geoItem, moduleType, voterFilterKey));
        } else {
            dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
            Axios({
                url: window.Laravel.baseURL + `api/voter_filters/geo/${geoItem.key}`,
                method: 'put',
                data: geoItem
            }).then(
                result => {
                    dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
                    dispatch(updateGeoItemSuccess(result.data.data, moduleType, voterFilterKey));
                }
            ).catch(
                error => {
                    dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
                    console.log('updateGeoItem failed');
                }
            )
        }
    }
}

export function addGeoItem(tempId, moduleType, voterFilterKey) {
    return function (dispatch) {
        dispatch({
            type: types.ADD_GEO_ITEM,
            geoItem: { id: tempId, key: tempId, entity_type: 'area', entity_id: 0, active: true, isNew: true, created_at: new Date() },
            voterFilterKey,
            moduleType
        });
    }
}

function deleteGeoItemSuccess(geoItemKey, moduleType, voterFilterKey) {
    return {
        type: types.DELETE_GEO_ITEM,
        geoItemKey,
        voterFilterKey,
        moduleType
    }
}

export function deleteGeoItem(geoItem, moduleType, voterFilterKey) {
    return function (dispatch) {
        if (geoItem.isNew) {
            dispatch(deleteGeoItemSuccess(geoItem.key, moduleType, voterFilterKey));
        } else {
            dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
            Axios({
                url: window.Laravel.baseURL + `api/voter_filters/geo/${geoItem.key}`,
                method: 'delete'
            }).then(result => {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
                dispatch(deleteGeoItemSuccess(geoItem.key, moduleType, voterFilterKey));
            }).catch(error => {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
                console.log('deleteGeoItem failed');
            })
        }
    }
}

export function createGeoItem(geoItem, moduleType, voterFilterKey) {
    return function (dispatch) {
        dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
        Axios({
            url: window.Laravel.baseURL + `api/voter_filters/${voterFilterKey}/geo`,
            method: 'post',
            data: geoItem
        }).then(
            result => {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
                dispatch(deleteGeoItemSuccess(geoItem.key, moduleType, voterFilterKey));
                dispatch(updateGeoItemSuccess(result.data.data, moduleType, voterFilterKey));
            }
            ).catch(
            error => {
                dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
                console.log('createGeoItem failed');
            }
            )
    }
}
export function deleteGeoItemInNoEditingMode( geoItemKey, moduleType, voterFilterKey){
    return function (dispatch) {
        dispatch(deleteGeoItemSuccess(geoItemKey, moduleType, voterFilterKey));
    }
}
export function updateGeoItemInNoEditingMode( geoItemKey, moduleType, voterFilterKey){
    return function (dispatch) {
        dispatch(updateGeoItemSuccess(geoItemKey, moduleType, voterFilterKey));
    }
}

export function resetCityGeoTypesSuccess() {
    return {
        type: types.RESET_CITY_GEO_ENTITY_TYPES
    }
}

export function resetCityGeoTypes() {
    return function (dispatch) {
        dispatch(resetCityGeoTypesSuccess());
    }
}

export function resetGeographicFilterGroupExpandedSuccess() {
    return {
        type: GlobalActions.ActionTypes.VOTER_FILTER.GEOGRAPHIC_FILTER.RESET_GROUP_EXPANDED_FLAG
    }
}

export function resetGeographicFilterGroupExpanded() {
    return function (dispatch) {
        dispatch(resetGeographicFilterGroupExpandedSuccess());
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