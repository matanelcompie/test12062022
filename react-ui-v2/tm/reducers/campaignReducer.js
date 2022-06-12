import { types } from 'tm/actions/campaignActions';
import { create, get } from 'lodash';
import { createSelector } from 'reselect';

const initialStatistics = {
  answered_calls: '',
  breaks_time_in_seconds: '',
  calls_time_in_seconds: '',
  not_answered_calls: '',
  calls_action_time_in_seconds: '',
  voters_count: '',
  unique_voters_count: '',
  processed_count: '',
  support_status: ''
}
const initialState = {
  list: [],
  pending: 0,
  currentCampaignKey: '',
  openCampaignStatusModal: false,
  campaignScreen: {
    currentCampaign: {
      cti_permissions: [],
      messages: [],
      transportation_coordination_phone: null,
      sms_message: null,
      email_topic: null,
      email_body: null,
      single_voter_for_household: 0,
      single_phone_occurrence: 0,
      only_users_with_mobile: 0,
    },
    statistics: initialStatistics,
  },
  campaignUserStatistics: {},
  basicCampaignStats: {},
  callsPerformanceStats: {},
  agentsPerformanceStats: {},
  callListenData: null,
  agentsWorkDataStats: {},
  agentCallsStats: {},
  callDetailsStats: {},
  campaignNames: {},
  agentsUserData: {},
  loadingMoreAgentsWorks: false,
  loadingMoreAgentCalls: false,
  agentsWorkShowAllCampaigns: 0,
  agentsWorkCurrentPage: 1,
  agentsWorkCurrentLoadedIndex: 1,
  userDialerExtension: {
    sipnumber: null,
    password: null,
    server_name: null,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.SET_CURRENT_CAMPAIGN_KEY:
      return Object.assign({}, state, { currentCampaignKey: action.campaignKey });

    case types.GET_ALL_CAMPAIGNS_SUCCESS:
      return Object.assign({}, state, { list: action.data });

    case types.ADD_CAMPAIGN_USER_STATISTICS_SUCCESS:
      return {
        ...state,
        campaignUserStatistics: {
          ...state.campaignUserStatistics, ["_" + action.id]: {
            portions: get(action, 'data.dataPortions.data'),
            counts: get(action, 'data.userCount.data')
          }
        }
      };

    case types.UPDATE_GLOBAL_FIELD_VALUE:
      return Object.assign({}, state, { [action.fieldName]: action.fieldValue });

    case types.ADD_AGNET_DATA_IF_NEEDED:
      var newState = { ...state };
      newState.agentsUserData = { ...newState.agentsUserData };
      if (!newState.agentsUserData[action.agentKey]) {
        newState.agentsUserData[action.agentKey] = action.agentData;
      }
      return newState;
      break;

    case types.UPDATE_CALLS_PERFORMANCE_FIELD_VALUE:
      var newState = { ...state };
      newState.callsPerformanceStats = { ...newState.callsPerformanceStats };
      for (let key in action.data) {
        newState.callsPerformanceStats[key] = action.data[key];
      }
      return newState;
      break;

    case types.UPDATE_MAIN_DASHBOARD_FIELD_VALUE:
      var newState = { ...state };
      newState.basicCampaignStats = { ...newState.basicCampaignStats };
      for (let key in action.data) {
        newState.basicCampaignStats[key] = action.data[key];
      }
      return newState;
      break;

    case types.UPDATE_AGENTS_PERFORMANCE_FIELD_VALUE:
      var newState = { ...state };
      newState.agentsPerformanceStats = { ...newState.agentsPerformanceStats };
      for (let key in action.data) {
        newState.agentsPerformanceStats[key] = action.data[key];
      }
      return newState;
      break;

    case types.UPDATE_CAMPAIGN_NAME_BY_KEY:
      var newState = { ...state };
      newState.campaignNames = { ...newState.campaignNames };
      if (!newState.campaignNames[action.campaignKey]) {
        newState.campaignNames[action.campaignKey] = action.campaignName;
      }
      return newState;
      break;

    case types.LOAD_MORE_AGENTS_WORKS:
      var newState = { ...state };
      newState.agentsWorkDataStats = { ...newState.agentsWorkDataStats };
      newState.agentsWorkDataStats.agents_list = [...newState.agentsWorkDataStats.agents_list];
      for (let i = 0; i < action.data.length; i++) {
        newState.agentsWorkDataStats.agents_list.push(action.data[i]);
      }
      return newState;
      break;

    case types.LOAD_MORE_AGENT_CALLS:
      var newState = { ...state };
      newState.agentCallsStats = { ...newState.agentCallsStats };
      newState.agentCallsStats.all_calls_list = [...newState.agentCallsStats.all_calls_list];
      for (let i = 0; i < action.data.length; i++) {
        newState.agentCallsStats.all_calls_list.push(action.data[i]);
      }
      return newState;
      break;

    case types.GET_CURRENT_CAMPAIGN_SUCCESS:
      var newState = { ...state };
      newState.campaignScreen = { ...newState.campaignScreen };
      let campaignData = action.data.data;
      newState.campaignScreen.currentCampaign = campaignData;
      newState.currentCampaignKey = action.data.campaignKey;
      //transfer cti permissions from array to object with permission key as keys
      var CtiPermissions = {};
      campaignData.cti_permissions.forEach(function (permission) {
        CtiPermissions[permission.key] = permission.value;
      });
      newState.campaignScreen.currentCampaign.cti_permissions = CtiPermissions;
      return newState;

    case types.UPDATE_CAMPAIGN_SUCCESS:
      let list = state.list.map(campaign => {
        return action.data.key == campaign.key ? { ...campaign, ...action.data } : campaign;
      });
      return Object.assign({}, state, { list, pending: state.pending - 1 });

    case types.ADD_CAMPAIGN_SUCCESS:
      return Object.assign({}, state, { list: [...state.list, action.data], pending: state.pending - 1 });

    case types.START_SAVING:
      return Object.assign({}, state, { pending: state.pending + 1 });

    case types.SAVED:
      return Object.assign({}, state, { pending: state.pending - 1 });

    case types.NOT_SAVED:
      return Object.assign({}, state, { pending: state.pending - 1 });

    case types.ON_OPEN_CAMPAIGN_STATUS_MODAL_CLICK:
      return Object.assign({}, state, { openCampaignStatusModal: !state.openCampaignStatusModal });

    //update campign cti permission
    case types.UPDATE_CAMPAIGN_CTI_PERMISSION:
      var newState = { ...state };
      newState.campaignScreen = { ...newState.campaignScreen };
      newState.campaignScreen.currentCampaign = { ...newState.campaignScreen.currentCampaign };
      newState.campaignScreen.currentCampaign.cti_permissions = { ...newState.campaignScreen.currentCampaign.cti_permissions };
      newState.campaignScreen.currentCampaign.cti_permissions[action.permissionKey] = Number(action.value);
      return newState;
      break;

    //update campaign value
    case types.UPDATE_CAMPAIGN_VALUE:
      var newState = { ...state };
      newState.campaignScreen = { ...newState.campaignScreen };
      newState.campaignScreen.currentCampaign = { ...newState.campaignScreen.currentCampaign };
      newState.campaignScreen.currentCampaign[action.name] = action.value;
      return newState;

    case types.UPDATE_CAMPAIGN_STATISTICS:
      var newState = { ...state };
      newState.campaignScreen = { ...newState.campaignScreen };
      newState.campaignScreen.statistics = action.data;
      return newState;

    case types.RESET_STATISTICS_DATA:
      var newState = { ...state };
      newState.campaignScreen = { ...newState.campaignScreen };
      newState.campaignScreen.statistics = initialStatistics;
      return newState;

    case types.SET_DIALER_EXTENSION:
      var newState = { ...state };
      newState.userDialerExtension = action.userDialerExtension;
      newState.userDialerExtension.sipnumber = action.userDialerExtension.dialer_user_id;
      return newState;

    default:
      return state;
  }
}

export const campaignSelector = state => get(state, 'tm.campaign')

export const campaignList = createSelector(campaignSelector,
  state => get(state, 'list', [])
)

export const campaignUserStatistics = (id) => createSelector(
  campaignSelector,
  state => get(state, 'campaignUserStatistics._' + id, {})
)
