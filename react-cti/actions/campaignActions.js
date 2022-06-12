import Axios from 'axios';
import * as types from './actionTypes';
import * as uiActions from './uiActions';

import moment from 'moment';


function getAllCampaignsSuccess(data) {
  return {
    type: types.GET_ALL_CAMPAIGNS_SUCCESS,
    data
  }
}

function getCampaignQuestionnaireSuccess(data) {
  return {
    type: types.GET_CAMPAIGN_QUESTIONNAIRE_SUCCESS,
    data
  }
}

export function getAllCampaigns() {
  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/cti/campaigns',
      method: "get"
    }).then(function (result) {
      dispatch(getAllCampaignsSuccess(result.data.data))
    }, function (error) {
      window.location = window.Laravel.baseURL;
    })
  }
}

export function getCampaignQuestionnaireFull(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/questionnaire_full',
    method: "get"
  }).then(
    result => {
      let data = result.data.data;
      let questionnaire = data.questionnaire;
      let firstQuestionId = questionnaire.questions.length ? questionnaire.questions[0].id : null;
      uiActions.resetQuestionnaire(dispatch, firstQuestionId);
      dispatch(getCampaignQuestionnaireSuccess(data));
      dispatch(uiActions.setActiveQuestion(firstQuestionId));
    }
    , function (error) { // If failed to get Questionnaire - go to campagin page!
      window.location = window.Laravel.baseURL + '/cti';
      console.log(error);
    })
}

export function monitorCampaignMessageApi(message, data) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/monitor/' + data.campaignId,
    method: 'post',
    data: { ...data, message }
  })
}

export function setActiveCampaign(campaignKey) {
  return function (dispatch) {
    dispatch({
      type: types.SET_ACTIVE_CAMPAIGN,
      campaignKey
    });
    getCampaignQuestionnaireFull(dispatch, campaignKey);
  }
}

export function setActiveCampaignKey(dispatch, campaign, simulationMode) {
  dispatch({
    type: types.SET_ACTIVE_CAMPAIGN,
    campaign: campaign,
    simulationMode: simulationMode
  });

  getCampaignQuestionnaireFull(dispatch, campaign.key);
}

export function showBetweenCallsModal(dispatch) {
  dispatch({ type: types.SHOW_BETWEEN_CALLS_MODAL });
}

export function hideBetweenCallsModal(dispatch) {
  dispatch({ type: types.HIDE_BETWEEN_CALLS_MODAL });
}

export function countTimeBetweenCalls(dispatch) {
  dispatch({ type: types.COUNT_TIME_BETWEEN_CALLS });
}

export function takeBreak(dispatch) {
  dispatch({ type: types.TAKE_A_BREAK });
}

export function returnFromBreak(dispatch) {
  dispatch({ type: types.RETURN_FROM_BREAK });
}

export function countBreakTime(dispatch) {
  dispatch({ type: types.COUNT_BREAK_TIME });
}

export function resetActiveCampaign(dispatch) {
  dispatch({ type: types.RESET_ACTIVE_CAMPAIGN });
}

export function toggleUserBreakRequest(dispatch) {
  dispatch({ type: types.TOGGLE_USER_BREAK_REQUEST });
}

export function updateBreakText(dispatch, breakText) {
  dispatch({ type: types.UPDATE_BREAK_TEXT, breakText });
}

export function resetSimulationMode(dispatch) {
  dispatch({ type: types.UNSET_SIMULATION_MODE });
}

export function addExtensionToCampaign(campaignKey, onlyDialer = false) {
  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/extension',
    method: "put",
    data: {
      only_dialer: onlyDialer
    }
  }).then(function (result) {
    console.log('OK');
  });
}

export function deleteExtensionFromCampaign(campaignKey, onlyDialer = false) {
  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/extension',
    method: "delete",
    data: {
      only_dialer: onlyDialer
    }
  }).then(function (result) {
    console.log('OK');
  });
}

export function getCampaignFiles(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/files',
    method: "get"
  }).then(function (result) {
    let campaignFiles = result.data.data;

    dispatch({ type: types.LOAD_CAMPAIGN_FILES, campaignFiles });
  }, function (error) {
    console.log("error loading campaign files", error);
  });
}

/**
 * Get campaign cti permissions
 *
 * @param object dispatch
 * @param string campaignKey
 * @return void
 */
export function getCampaignPermissions(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/permissions',
    method: "get",
  }).then(function (result) {
    let permissions = {};
    result.data.data.forEach(function (permission) {
      permissions[permission.name] = permission;
    });
    dispatch({ type: types.LOADED_CAMPAIGN_PERMISSIONS, permissions: permissions });
  }, function (error) {
    console.log("error loading campaign permissions", error);
  })
}

/**
 * Create campaign break
 *
 * @param object dispatch
 * @param string campaignKey
 * @return void
 */
export function createBreak(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/breaks',
    method: "post"
  }).then(function (result) {
    let breakKey = result.data.data;
    dispatch({ type: types.CREATE_A_BREAK, key: breakKey });
  });
}

/**
 * End campaign break
 *
 * @param object dispatch
 * @param string breakKey
 * @return void
 */
export function endBreak(dispatch, breakKey) {
  let url = "";
  if (breakKey) url = window.Laravel.baseURL + 'api/cti/campaigns/breaks/' + breakKey;
  else url = window.Laravel.baseURL + 'api/cti/campaigns/breaks';
  Axios({
    url: url,
    method: "put"
  }).then(function (result) {
    dispatch({ type: types.END_A_BREAK });
  });
}

/**
 * Create campaign waiting
 *
 * @param object dispatch
 * @param string campaignKey
 * @return void
 */
export function createWaiting(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/' + campaignKey + '/waitings',
    method: "post"
  }).then(function (result) {
    let waitingKey = result.data.data;
    dispatch({ type: types.CREATE_WAITING, key: waitingKey });
  });
}

/**
 * End campaign waiting
 *
 * @param object dispatch
 * @param string breakKey
 * @return void
 */
export function endWaiting(dispatch, waitingKey) {

  Axios({
    url: window.Laravel.baseURL + 'api/cti/campaigns/waitings/' + (waitingKey ? waitingKey : ""),
    method: "put"
  }).then(function (result) {
    dispatch({ type: types.END_WAITING });
  });
}

/**
 * Reducer action for activating user in campaign
 * @param {*} dispatch
 */
export function activateUserInCampaign(dispatch) {
  dispatch({ type: types.ACTIVATE_USER_IN_CAMPAIGN, activateUserInCampaign: true });
}

/**
 * Reducer action for deactivating user in campaign
 * @param {*} dispatch
 */
export function deactivateUserInCampaign(dispatch) {
  dispatch({ type: types.ACTIVATE_USER_IN_CAMPAIGN, activateUserInCampaign: false });
}
