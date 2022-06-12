import * as types from '../actions/actionTypes';
import R from 'ramda';

const initialState = {
    validationVoterCallData: {
        'Household': true, 'Address': true, 'Transportation': true,
        'ContactInfo': true, 'Status': true, 'Messages': true,
    },
    questionnaire: {
        activeQuestionId: null,
        viewedQuestions: [],
    },

    activeActionArea: 'Household',
    actionAreaMenuItems: ['Household', 'Address', 'Transportation', 'ContactInfo', 'Status', 'Messages'],
    householdVottingStatus: null,
    householdSupportStatus: null,

    questionMaxMarginBottom: 20,
    calculatedQuestionMarginBottom: 0,

    updateHouseholdIndex: null,
    updatePhoneIndex: null,

    deleteHouseholdIndex: null,

    showDeleteHouseholdPhoneModal: false,

    transportation: {
        shouldEditTransportation: false,

        showDriversList: true,

        drivers: [],
    },

    fakeDrivers: [
        {name: 'כהן רוני', phone_number: '052-6123654'},
        {name: 'לוי אליהו', phone_number: '052-6958624'},
        {name: 'מרציאנו דוד', phone_number: '054-7895432'},
        {name: 'דן וובר', phone_number: '052-6558934'}
    ],

    showActualAddressCorrectModal: false,

    showSendSmsModal: false,

    disabledSendSmsOkStatus: true,

    sendSmsFormInputFields: {
        phoneNumber: '',
        message: '',
        selected: null,
        phones: []
    },

    showSendEmailModal: false,

    disabledSendEmailOkStatus: true,

    sendEmailFormInputFields: {
        email: '',
        subject: '',
        message: ''
    },

    showDeletePhoneModal: false,

    deletePhoneModalHeader: '',

    deletePhoneIndex: -1,

    campaignMessages: {
        selectedFile: ''
    }
};

export default function(state = initialState, action) {
    let newState;

    switch (action.type) {
        case types.SET_ACTION_AREA_VALIDATION_STATUS:
            newState = { ...state }
            newState.validationVoterCallData = { ...newState.validationVoterCallData }
            newState.validationVoterCallData[action.areaName] = action.isValid;
            return newState;
        case types.SET_ACTIVE_QUESTION:
            if(action.questionId) {
                let viewedQuestions = [...state.questionnaire.viewedQuestions];
                let questionId = action.questionId;
                if(action.deleteQuestionRoute) {
                    viewedQuestions = viewedQuestions.splice(0, viewedQuestions.indexOf(state.questionnaire.activeQuestionId) + 1);
                }
                if(!viewedQuestions.includes(action.questionId)) {
                    if(action.deleteQuestionRoute && !action.isNextQuestion)
                        questionId = state.questionnaire.activeQuestionId;
                    else
                        viewedQuestions.push(action.questionId);
                }
                let questionnaire = {activeQuestionId: questionId, viewedQuestions};
                return R.merge(state, {questionnaire});
            }
            else
                return state;

        case types.ON_ACTION_AREA_MENU_CLICK:
            return R.assoc('activeActionArea', action.componentName, state);

        case types.ON_HOUSEHOLD_SUPPORT_STATUS_CHANGE:
            return R.assoc('householdSupportStatus', action.supportStatusKey, state);

        case types.ON_HOUSEHOLD_VOTTING_STATUS_CHANGE:
            return R.assoc('householdVottingStatus', action.vottingStatusKey, state);

        case types.ADD_NEW_CALL_SUCCESS:
            let voterSupportStatus = action.data.voter.support_status_tm
                ? action.data.voter.support_status_tm
                : "";
            return R.merge(state, {'householdSupportStatus': voterSupportStatus ,'householdVottingStatus': action.data.voter.vote_status});

        case types.ON_UPDATE_PHONE_CLICK:
            return R.assoc('updatePhoneKey', action.phoneKey, state);

        case types.RESET_QUESTIONNAIRE:
            return Object.assign({}, state, {questionnaire: {activeQuestionId: action.firstQuestionId, viewedQuestions: []}});

        case types.UPDATE_QUESTION_MARGIN_BOTTOM:
            return Object.assign({}, state, {calculatedQuestionMarginBottom: action.marginBottom});

        case types.UPDATE_ACTIVE_HOUSEHOLD_PHONE:
            return Object.assign({}, state, {updateHouseholdIndex: action.householdIndex, updatePhoneIndex: action.phoneIndex});

        case types.SHOW_DELETE_HOUSEHOLD_PHONE_MODAL:
            return Object.assign({}, state, {showDeleteHouseholdPhoneModal: true, deleteHouseholdIndex: action.householdIndex,
                                             deletePhoneIndex: action.phoneIndex});

        case types.HIDE_DELETE_HOUSEHOLD_PHONE_MODAL:
            return Object.assign({}, state, {showDeleteHouseholdPhoneModal: false, deleteHouseholdIndex: null,
                                             deletePhoneIndex: null});

        case types.RESET_UI_CALL_DATA:
            return Object.assign({}, state, {householdVottingStatus: null, householdSupportStatus: null});

        case types.ALLOW_EDIT_TRANSPORTATION:
            newState = { ...state };
            newState.transportation = {...newState.transportation};

            newState.transportation.shouldEditTransportation = true;

            return newState;

        case types.HIDE_TRANSPORTATION_DRIVERS_LIST:
            newState = { ...state };
            newState.transportation = {...newState.transportation};

            newState.transportation.showDriversList = false;

            return newState;

        case types.LOAD_FAKE_DRIVERS:
            newState = { ...state };
            newState.transportation = {...newState.transportation};

            newState.transportation.drivers = initialState.fakeDrivers;

            return newState;

        case types.RESET_UI_DATA:
            newState = { ...state };
            newState.transportation = {...newState.transportation};

            newState.activeActionArea = initialState.activeActionArea;
            newState.transportation = initialState.transportation;
            newState.campaignMessages = initialState.campaignMessages;

            return newState;

        case types.SHOW_ACTUAL_ADDRESS_CORRECT_MODAL:
            newState = { ...state };

            newState.showActualAddressCorrectModal = true;

            return newState;

        case types.HIDE_ACTUAL_ADDRESS_CORRECT_MODAL:
            newState = { ...state };

            newState.showActualAddressCorrectModal = false;

            return newState;

        case types.SHOW_SEND_SMS_MODAL:
            newState = { ...state };

            newState.showSendSmsModal = true;
            newState.disabledSendSmsOkStatus = true;

            return newState;

        case types.HIDE_SEND_SMS_MODAL:
            newState = { ...state };

            newState.showSendSmsModal = false;
            newState.disabledSendSmsOkStatus = true;

            // newState.sendSmsFormInputFields = initialState.sendSmsFormInputFields;

            return newState;

        case types.DISABLE_SEND_SMS_OK_STATUS_BUTTON:
            newState = { ...state };

            newState.disabledSendSmsOkStatus = true;

            return newState;

        case types.ENABLE_SEND_SMS_OK_STATUS_BUTTON:
            newState = { ...state };

            newState.disabledSendSmsOkStatus = false;

            return newState;

        case types.CHANGE_SMS_INPUT_FIELD:
            newState = { ...state };
            newState.sendSmsFormInputFields = {...newState.sendSmsFormInputFields};

            newState.sendSmsFormInputFields[action.fieldName] = action.fieldValue;

            return newState;

        case types.SHOW_SEND_EMAIL_MODAL:
            newState = { ...state };

            newState.showSendEmailModal = true;
            newState.disabledSendEmailOkStatus = true;

            return newState;

        case types.HIDE_SEND_EMAIL_MODAL:
            newState = { ...state };

            newState.showSendEmailModal = false;
            newState.disabledSendEmailOkStatus = true;

            // newState.sendEmailFormInputFields = initialState.sendEmailFormInputFields;

            return newState;

        case types.DISABLE_SEND_EMAIL_OK_STATUS_BUTTON:
            newState = { ...state };

            newState.disabledSendSmsOkStatus = true;

            return newState;

        case types.ENABLE_SEND_EMAIL_OK_STATUS_BUTTON:
            newState = { ...state };

            newState.disabledSendEmailOkStatus = false;

            return newState;

        case types.CHANGE_SEND_EMAIL_INPUT_FIELD:
            newState = { ...state };
            newState.sendEmailFormInputFields = {...newState.sendEmailFormInputFields};

            newState.sendEmailFormInputFields[action.fieldName] = action.fieldValue;

            return newState;

        case types.SHOW_DELETE_PHONE_MODAL:
            newState = { ...state };

            newState.showDeletePhoneModal = true;

            newState.deletePhoneModalHeader = action.modalHeader;

            newState.deletePhoneIndex = action.phoneIndex;

            return newState;

        case types.HIDE_DELETE_PHONE_MODAL:
            newState = { ...state };

            newState.showDeletePhoneModal = false;

            newState.deletePhoneModalHeader = '';

            newState.deletePhoneIndex = -1;

            return newState;

        case types.CAMPAIGN_FILE_CHANGE:
            newState = { ...state };
            newState.campaignMessages = {...newState.campaignMessages};

            newState.campaignMessages.selectedFile = action.selectedFile;

            return newState;

        default:
            return state;
    }
}
