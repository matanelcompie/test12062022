import * as types from '../actions/actionTypes';
let initCampaignChangedData = {
  ctiPermissions: false,
  campaignDetails: false,
  questionnaire: false
};
const initialState = {
  list: [],
  //active campaign key and id
  activeCampaignKey: null,
  activeSipServerKey: null,
  selectedCampaignKey: null,
  activeCampaignId: null,
  questionnaire: {},
  campaignData: {},
  modalBetweenCalls: {
    show: false,
    seconds: 0
  },

  // Modal which counts the
  // time the user is in break
  modalBreak: {
    show: false,
    seconds: 0,

    totalSeconds: 0
  },

  // A boolean which indicates
  // that user has asked for a break
  askForBreak: false,

  // The text user will see when the
  // mouse is over the break icon.
  breakText: '',

  //campaign break key from API
  breakKey: null,

  //campaign waiting key from API
  waitingKey: null,

  // The campaign files
  files: [],
  permissions: {},
  campaignId: null,
  simulationMode: false,
  campaignChangedData: initCampaignChangedData,
  activateUserInCampaign: false
};

export default function (state = initialState, action) {
  let newState;
  switch (action.type) {
    case types.GET_ALL_CAMPAIGNS_SUCCESS:
      return Object.assign({}, state, { list: action.data });

    case types.GET_CAMPAIGN_QUESTIONNAIRE_SUCCESS:
      newState = { ...state };
      newState.questionnaire = action.data.questionnaire;
      newState.campaignData = action.data.campaignData;
      newState.isEditQuestionsMode = false;
      newState.isOpenInactiveQuestionnaires = false;
      return newState;

    case types.SET_ACTIVE_CAMPAIGN:
      return Object.assign({}, state, {
        activeCampaignKey: action.campaign.key,
        activeCampaignId: action.campaign.id,
        simulationMode: action.simulationMode
      });

    case types.SHOW_BETWEEN_CALLS_MODAL:
      return Object.assign({}, state, { 
        modalBetweenCalls: { show: true, seconds: 0 } }
      );

    case types.HIDE_BETWEEN_CALLS_MODAL:
      return Object.assign({}, state, { modalBetweenCalls: initialState.modalBetweenCalls });

    case types.COUNT_TIME_BETWEEN_CALLS:
      let seconds = state.modalBetweenCalls.seconds;
      seconds++; //help help help

      return Object.assign({}, state, { modalBetweenCalls: { show: true, seconds: seconds } });

    case types.TAKE_A_BREAK:
      let currentModalBreak = state.modalBreak;
      let modalBreak = { ...currentModalBreak, show: true, seconds: 0 };

      return Object.assign({}, state, { modalBreak: modalBreak, askForBreak: false });

    case types.RETURN_FROM_BREAK:
      currentModalBreak = state.modalBreak;
      modalBreak = { ...currentModalBreak, show: false, seconds: 0 };

      return Object.assign({}, state, { modalBreak: modalBreak });

    case types.COUNT_BREAK_TIME:
      currentModalBreak = state.modalBreak;

      seconds = state.modalBreak.seconds;
      seconds++;

      let totalSeconds = state.modalBreak.totalSeconds;
      totalSeconds++;

      modalBreak = { ...currentModalBreak, seconds: seconds, totalSeconds: totalSeconds };

      return Object.assign({}, state, { modalBreak: modalBreak });

    case types.RESET_ACTIVE_CAMPAIGN:
      return Object.assign({}, state, {
        activeCampaignKey: initialState.activeCampaignKey,
        activeCampaignId: initialState.activeCampaignId,
        questionnaire: initialState.questionnaire,
        modalBetweenCalls: initialState.modalBetweenCalls,
        modalBreak: initialState.modalBreak,
        askForBreak: initialState.askForBreak
      });

    case types.TOGGLE_USER_BREAK_REQUEST:
      let askForBreak = !state.askForBreak;
      return Object.assign({}, state, { askForBreak: askForBreak });

    case types.UPDATE_BREAK_TEXT:
      return Object.assign({}, state, { breakText: action.breakText });

    case types.LOAD_CAMPAIGN_FILES:
      newState = { ...state };
      newState.files = action.campaignFiles;
      return newState;

    case types.LOADED_CAMPAIGN_PERMISSIONS:
      newState = { ...state };
      newState.permissions = action.permissions;
      return newState;

    //Set campaign change flag:
    case types.CAMPAIGN_DATA_CHANGED:
      newState = { ...state };
      let newCampaignChangedData = { ...newState.campaignChangedData };
      for (let prop in action.campaignChangedData) {
        let bool = action.campaignChangedData[prop];
        if (bool) {
          newCampaignChangedData[prop] = bool;
        }
      }
      newState.campaignChangedData = newCampaignChangedData;
      return newState;

    case types.SET_SELECTED_CAMPAIGN_IN_LIST_PAGE:
      newState = { ...state }
      newState.selectedCampaignKey = action.selectedCampaignKey;
      newState.activeSipServerKey = action.sipServerKey;
      newState.isManualCampaign = action.telephone_predictive_mode == 1;
      return newState;

    case types.UNSET_CAMPAIGN_DATA_CHANGED:
      newState = { ...state };
      newState.campaignChangedData = initCampaignChangedData;
      return newState;

    //Set campaign id in node server in simulation mode::
    case types.SET_SIMULATION_MODE:
      newState = { ...state };
      newState.campaignId = action.campaignId;
      newState.simulationMode = true;
      return newState;

    case types.UNSET_SIMULATION_MODE:
      newState = { ...state };
      newState.campaignId = null;
      newState.simulationMode = false;
      return newState;

    //create a break
    case types.CREATE_A_BREAK:
      newState = { ...state };
      newState.breakKey = action.key;
      return newState;

    //end a break
    case types.END_A_BREAK:
      newState = { ...state };
      newState.breakKey = null;
      return newState;

    //create waiting
    case types.CREATE_WAITING:
      newState = { ...state };
      newState.waitingKey = action.key;
      return newState;

    //end waiting
    case types.END_WAITING:
      newState = { ...state };
      newState.waitingKey = null;
      return newState;


    case types.ACTIVATE_USER_IN_CAMPAIGN:
      newState = { ...state };
      newState.activateUserInCampaign = action.activateUserInCampaign;
      return newState;

    default:
      return state;

  }
}
