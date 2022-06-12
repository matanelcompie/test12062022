import Axios from 'axios';
import * as SystemActions from 'actions/SystemActions';
import { campaignSelector } from 'tm/reducers/campaignReducer'
import { get } from 'lodash';

export const types = {
  SET_CURRENT_CAMPAIGN_KEY: 'SET_CURRENT_CAMPAIGN_KEY',
  GET_ALL_CAMPAIGNS_SUCCESS: 'GET_ALL_CAMPAIGNS_SUCCESS',
  GET_CURRENT_CAMPAIGN_SUCCESS: 'GET_CURRENT_CAMPAIGN_SUCCESS',
  GET_CURRENT_CAMPAIGN_FAILED: 'GET_CURRENT_CAMPAIGN_FAILED',
  UPDATE_CAMPAIGN_SUCCESS: 'UPDATE_CAMPAIGN_SUCCESS',
  ADD_CAMPAIGN_SUCCESS: 'ADD_CAMPAIGN_SUCCESS',
  START_SAVING: 'START_SAVING',
  SAVED: 'SAVED',
  NOT_SAVED: 'NOT_SAVED',
  ON_OPEN_CAMPAIGN_STATUS_MODAL_CLICK: 'ON_OPEN_CAMPAIGN_STATUS_MODAL_CLICK',
  UPDATE_CAMPAIGN_CTI_PERMISSION: 'UPDATE_CAMPAIGN_CTI_PERMISSION',
  UPDATE_CAMPAIGN_VALUE: 'UPDATE_CAMPAIGN_VALUE',
  UPDATE_CAMPAIGN_STATISTICS: 'UPDATE_CAMPAIGN_STATISTICS',
  RESET_STATISTICS_DATA: 'RESET_STATISTICS_DATA',
  UPDATE_GLOBAL_FIELD_VALUE: 'UPDATE_GLOBAL_FIELD_VALUE',
  UPDATE_CALLS_PERFORMANCE_FIELD_VALUE: 'UPDATE_CALLS_PERFORMANCE_FIELD_VALUE',
  UPDATE_AGENTS_PERFORMANCE_FIELD_VALUE: 'UPDATE_AGENTS_PERFORMANCE_FIELD_VALUE',
  UPDATE_MAIN_DASHBOARD_FIELD_VALUE: 'UPDATE_MAIN_DASHBOARD_FIELD_VALUE',
  UPDATE_CAMPAIGN_NAME_BY_KEY: 'UPDATE_CAMPAIGN_NAME_BY_KEY',
  LOAD_MORE_AGENTS_WORKS: 'LOAD_MORE_AGENTS_WORKS',
  LOAD_MORE_AGENT_CALLS: 'LOAD_MORE_AGENT_CALLS',
  ADD_AGNET_DATA_IF_NEEDED: 'ADD_AGNET_DATA_IF_NEEDED',
  SET_DIALER_EXTENSION: 'SET_DIALER_EXTENSION',
  ADD_CAMPAIGN_USER_STATISTICS: 'ADD_CAMPAIGN_USER_STATISTICS',
  ADD_CAMPAIGN_USER_STATISTICS_SUCCESS: 'ADD_CAMPAIGN_USER_STATISTICS_SUCCESS',
  ADD_CAMPAIGN_USER_STATISTICS_FAILURE: 'ADD_CAMPAIGN_USER_STATISTICS_FAILURE'
};




export function setCurrentCampaignKey(campaignKey) {
  return function (dispatch) {
    dispatch({
      type: types.SET_CURRENT_CAMPAIGN_KEY,
      campaignKey
    })
  }
}

function getCurrentCampaignsSuccess(data) {
  return {
    type: types.GET_CURRENT_CAMPAIGN_SUCCESS,
    data
  }
}

function getCurrentCampaignFailed(error) {
  return {
    type: types.GET_CURRENT_CAMPAIGN_FAILED,
    error
  }
}

export function loadSingleCampaignUserStatistic(campaignId) {
  return (dispatch) => {
    Promise.all([
      Axios.get(window.Laravel.baseURL + 'api/tm/campaigns/' + campaignId + "/portions-progress"),
      Axios.get(window.Laravel.baseURL + 'api/tm/campaigns/' + campaignId + "/users-count")
    ]).then(values => {
      const [{ data: dataPortions }, { data: userCount }] = values;
      dispatch({
        type: types.ADD_CAMPAIGN_USER_STATISTICS_SUCCESS,
        data: { dataPortions, userCount },
        id: campaignId
      });
    }).catch(() =>
      dispatch({ type: types.ADD_CAMPAIGN_USER_STATISTICS_FAILURE })
    );
  }
}

export function loadMoreAgentsWorks(dispatch, campaignKey, params) {

  dispatch({ type: types.UPDATE_GLOBAL_FIELD_VALUE, fieldName: 'loadingMoreAgentsWorks', fieldValue: true });
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/agents_work",
    method: "get",
    params
  }).then(result => {
    if (result.data.data.agents_list.length > 0) {
      dispatch({ type: types.LOAD_MORE_AGENTS_WORKS, data: result.data.data.agents_list });
      dispatch({ type: types.UPDATE_GLOBAL_FIELD_VALUE, fieldName: 'loadingMoreAgentsWorks', fieldValue: false });

    }
  }).catch(error => {
    dispatch({ type: types.UPDATE_GLOBAL_FIELD_VALUE, fieldName: 'loadingMoreAgentsWorks', fieldValue: false });
  });

}

export function loadMoreAgentCalls(dispatch, campaignKey, agentKey, params) {
  dispatch({ type: types.UPDATE_GLOBAL_FIELD_VALUE, fieldName: 'loadingMoreAgentCalls', fieldValue: true });
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/agent_calls/" + agentKey,
    method: "get",
    params
  }).then(result => {
    if (result.data.data.all_calls_list.length > 0) {
      dispatch({ type: types.LOAD_MORE_AGENT_CALLS, data: result.data.data.all_calls_list });

    }
  }).catch(error => {

  });
  dispatch({ type: types.UPDATE_GLOBAL_FIELD_VALUE, fieldName: 'loadingMoreAgentCalls', fieldValue: false });
}

export function loadDashboardAgentsPerformaceByParts(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/agents_performance",
    method: "get",
    params: {
      part: "employees"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_AGENTS_PERFORMANCE_FIELD_VALUE, data: result.data.data });
    dispatch({ type: types.UPDATE_CAMPAIGN_NAME_BY_KEY, campaignKey: campaignKey, campaignName: result.data.data.campaign_name });

  }).catch(error => {

  });

  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/agents_performance",
    method: "get",
    params: {
      part: "stats"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_AGENTS_PERFORMANCE_FIELD_VALUE, data: result.data.data });

  }).catch(error => {

  });
}

export function loadOnlineVoterCallingData(dispatch, campaignKey, userKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/agents_performance/" + userKey,
    method: "get"
  }).then(result => {
    console.log("update call listen data");
    dispatch({ type: types.UPDATE_GLOBAL_FIELD_VALUE, fieldName: 'callListenData', fieldValue: result.data.data });
  }).catch(error => {

  });
}

export function loadMainDashboardByParts(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "",
    method: "get",
    params: {
      part: "stats"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_MAIN_DASHBOARD_FIELD_VALUE, data: result.data.data });
    dispatch({ type: types.UPDATE_CAMPAIGN_NAME_BY_KEY, campaignKey: campaignKey, campaignName: result.data.data.campaign_name });

  }).catch(error => {

  });

  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "",
    method: "get",
    params: {
      part: "agents"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_MAIN_DASHBOARD_FIELD_VALUE, data: result.data.data });

  }).catch(error => {

  });

  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "",
    method: "get",
    params: {
      part: "portions"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_MAIN_DASHBOARD_FIELD_VALUE, data: result.data.data });

  }).catch(error => {

  });
}

export function loadDashboardCallsPerformaceByParts(dispatch, campaignKey) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/calls_performance",
    method: "get",
    params: {
      part: "portions"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_CALLS_PERFORMANCE_FIELD_VALUE, data: result.data.data });
    dispatch({ type: types.UPDATE_CAMPAIGN_NAME_BY_KEY, campaignKey: campaignKey, campaignName: result.data.data.campaign_name });

  }).catch(error => {

  });

  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/calls_performance",
    method: "get",
    params: {
      part: "stats"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_CALLS_PERFORMANCE_FIELD_VALUE, data: result.data.data });

  }).catch(error => {

  });

  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/calls_performance",
    method: "get",
    params: {
      part: "avgs"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_CALLS_PERFORMANCE_FIELD_VALUE, data: result.data.data });

  }).catch(error => {

  });

  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + "/calls_performance",
    method: "get",
    params: {
      part: "comparison"
    }
  }).then(result => {
    dispatch({ type: types.UPDATE_CALLS_PERFORMANCE_FIELD_VALUE, data: result.data.data });

  }).catch(error => {

  });
}

export function getDashboardCampaignDataByParams(dispatch, campaignKey, url, successAction, updateFieldName, extraKey, params) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + (url ? "/" + url : '') + (extraKey ? ('/' + extraKey) : ''),
    method: "get",
    params
  }).then(result => {
    dispatch({ type: successAction, fieldName: updateFieldName, fieldValue: result.data.data });
    dispatch({ type: types.UPDATE_CAMPAIGN_NAME_BY_KEY, campaignKey: campaignKey, campaignName: result.data.data.campaign_name });
    if (updateFieldName == 'agentCallsStats') {
      dispatch({ type: types.ADD_AGNET_DATA_IF_NEEDED, agentKey: extraKey, agentData: result.data.data.user_agent_data });
    }
  }).catch(error => {

  })
}

export function getDashboardCallDetails(dispatch, campaignKey, agentKey, callKey, successAction, updateFieldName) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/dashboards/' + campaignKey + '/agent_calls/' + agentKey + '/calls/' + callKey,
    method: "get"
  }).then(result => {
    dispatch({ type: successAction, fieldName: updateFieldName, fieldValue: result.data.data });
  }).catch(error => {

  })
}

export function getAllCampaignsRaw(dispatch) {
  Axios({
    url: window.Laravel.baseURL + 'api/tm/campaigns',
    method: "get"
  }).then(result => {
    dispatch({ type: types.GET_ALL_CAMPAIGNS_SUCCESS, data: result.data.data });
  }).catch(error => {
    console.log(error);
  })
}

export function getAllCampaigns() {
  return function (dispatch) {
    getAllCampaignsRaw(dispatch);
  }
}

export function getCampaign(campaignKey) {
  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey,
      method: "get"
    }).then(result => {
      dispatch(getCurrentCampaignsSuccess({ data: result.data.data, campaignKey: campaignKey }));
    })/*.catch(error => {
            dispatch(getCurrentCampaignFailed(error));
        })*/
  }
}

function updateCampaignSuccess(data) {
  return {
    type: types.UPDATE_CAMPAIGN_SUCCESS,
    data
  }
}

export function updateCampaign(campaign, parameters) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startSaving());
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaign.key,
      method: "put",
      data: parameters
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(saved());
      getCampaign(campaign.key)(dispatch);
    }, error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(notSaved());
      console.log('updateCampaign failed:', error);
    });
  }
}

function addCampaignSuccess(data) {
  return {
    type: types.ADD_CAMPAIGN_SUCCESS,
    data
  }
}

export function addCampaign(campaign) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startSaving());
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns',
      method: "post",
      data: campaign
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(addCampaignSuccess(result.data.data));
    }, error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(notSaved());
      console.log('addCampaign failed');
    });
  }
}

/**
 * Set starting saving
 *
 * @return object
 */
function startSaving() {
  return {
    type: types.START_SAVING
  }
}

/**
 * Set ending save
 *
 * @return object
 */
function saved() {
  return {
    type: types.SAVED
  }
}

/**
 * Set ending not saved
 *
 * @return object
 */
function notSaved() {
  return {
    type: types.NOT_SAVED
  }
}


export function onOpenCampaignStatusModalClick() {
  return {
    type: types.ON_OPEN_CAMPAIGN_STATUS_MODAL_CLICK
  }
}

export function updateCampaignCtiPermission(permissionKey, value) {
  return function (dispatch) {
    dispatch({
      type: types.UPDATE_CAMPAIGN_CTI_PERMISSION,
      permissionKey: permissionKey,
      value: value
    });
  }
}

/**
 * Set campaign value change

 * @param string value
 * @param string name
 * @return function
 */
export function campaignValueChange(value, name) {
  return function (dispatch) {
    dispatch({
      type: types.UPDATE_CAMPAIGN_VALUE,
      value: value,
      name: name
    });
  }
}

/**
 * Save Cti settings for campaign

 * @param object campaign
 * @return function
 */
export function saveCtiSettings(campaign, fullCtiPermissions) {
  return function (dispatch) {
    //generate permissions list containing 'key' and 'value'
    let ctiPermissions = [];
    let cti_permissionsList = campaign.cti_permissions;
    for (var ctiPermissionKey in cti_permissionsList) {
      let value = Number(cti_permissionsList[ctiPermissionKey]);

      let ctiPermission = {
        key: ctiPermissionKey,
        value: cti_permissionsList[ctiPermissionKey]
      };
      ctiPermissions.push(ctiPermission);
    }

    //set data object
    var data = {
      cti_permissions: ctiPermissions
    }

    //add campaign parameters that are in cti settings tab
    fullCtiPermissions.forEach(function (permission) {
      if ((permission.name == 'cti.activity_area.transportation.phone_coordinate') && (Number(campaign.cti_permissions[permission.key]) == 1)) {
        let transportation_coordination_phone = (campaign.transportation_coordination_phone == undefined) ? null : campaign.transportation_coordination_phone;
        data.transportation_coordination_phone = transportation_coordination_phone.split('-').join('');
      }

      if ((permission.name == 'cti.activity_area.general.sms') && (Number(campaign.cti_permissions[permission.key]) == 1)) {
        data.sms_message = (campaign.sms_message == undefined) ? null : campaign.sms_message;
      }

      if ((permission.name == 'cti.activity_area.general.email') && (Number(campaign.cti_permissions[permission.key]) == 1)) {
        data.email_topic = (campaign.email_topic == undefined) ? null : campaign.email_topic;
        data.email_body = (campaign.email_body == undefined) ? null : campaign.email_body;
      }
    });

    //send via Axios
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startSaving());
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaign.key,
      method: "put",
      data: data,
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(saved());

      //reload campaign
      getCampaign(campaign.key)(dispatch);
    }, error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(notSaved());
      console.log('updateCampaign failed:', error);
    });
  }
}

/**
 * Update campaign message

 * @param object campaign
 * @param object message
 * @param array parameters
 * @return function
 */
export function updateCampaignMessage(campaign, message, parameters) {
  return function (dispatch) {
    //send via Axios
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startSaving());
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaign.key + '/messages/' + message.key,
      method: 'put',
      data: parameters
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(saved());

      //reload campaign
      getCampaign(campaign.key)(dispatch);
    }, error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(notSaved());
      console.log('updateCampaigMessage failed:', error);
    })
  }
}

/**
 * Delete campaign message

 * @param object campaign
 * @param object message
 * @param array parameters
 * @return function
 */
export function deleteCampaignMessage(campaign, message) {
  return function (dispatch) {
    //send via Axios
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startSaving());
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaign.key + '/messages/' + message.key,
      method: 'delete',
    }).then(retult => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(saved());

      //reload campaign
      getCampaign(campaign.key)(dispatch);
    }, error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(notSaved());
      console.log('deleteCampaigMessage failed:', error);
    });
  }
}

/**
 * Add campaign message

 * @param object campaign
 * @param object message
 * @param array parameters
 * @return function
 */
export function addCampaignMessage(campaign, parameters) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startSaving());

    //create data from parameters
    let data = null;
    if (parameters.file != undefined) {
      data = new FormData();
      data.append('name', parameters.name);
      data.append('type', parameters.type);
      data.append('file', parameters.file);
      data.append('shareable', parameters.shareable);
    } else {
      data = parameters;
    }
    //send via Axios
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaign.key + '/messages',
      method: 'post',
      data: data
    }).then(retult => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(saved());

      //reload campaign
      getCampaign(campaign.key)(dispatch);
    }, error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(notSaved());
      console.log('addCampaigMessage failed:', error);
    });
  }
}


export function getCampaignStatistics(campaignKey) {
  return function (dispatch) {
    dispatch({ type: types.RESET_STATISTICS_DATA });
    Axios({
      url: window.Laravel.baseURL + `api/tm/campaigns/${campaignKey}/statistics`,
      method: "get"
    }).then(result => {
      dispatch({ type: types.UPDATE_CAMPAIGN_STATISTICS, data: result.data.data });
    })
  }
}
/** Web dialer functions */

export function getWebDialer(dispatch, campaignKey) {
  dispatch({ type: types.SET_DIALER_EXTENSION, userDialerExtension: { sipnumber: null, password: null, server_name: null } });
  Axios({
    url: window.Laravel.baseURL + `api/tm/dashboards/${campaignKey}/extension`,
    method: "get"
  }).then(result => {
    dispatch({ type: types.SET_DIALER_EXTENSION, userDialerExtension: result.data.data });
  })
}
