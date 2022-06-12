import * as types from '../actions/actionTypes';
import R from 'ramda';

const initialState = {
    currentUser: {
        first_name: "",
        last_name: "",
        id: "",
        admin: false,
        permissions: {}
    },

    lists: {
        cities: [],
        support_statuses: [],
        languages: []
    },

    metaData: {
        metaDataVolunteerKeys: [],
        metaDataValues: [],
        metaValuesHashByKeyId: []
    },

    confirmAlert: {
        show: false,
        actionFile: '',
        confirmFuncName: '',
        params: [],
        messageText: '',
        messageTitle: ''
    },

    webSocket: {
        connectionStatus: false
    },

    webDialer: {
        extensions: [],
        sipnumber: null,
        status: 'disconnected',
        unregisteredSeconds: 0,
    },
    simulationMode: false,
    maintenanceMode: false,
    audioInput: true
};

export default function (state = initialState, action) {
    let newState ;

    switch (action.type) {
        case types.GET_CURRENT_USER_SUCCESS:
            return R.assoc('currentUser', action.user, state);

        case types.GET_ALL_LISTS_SUCCESS:
            return Object.assign({}, state, { lists: action.data });

        case types.OPEN_CONFIRM_ALERT:
            let confirmAlert = { show: true, ...action };
            delete confirmAlert.type;
            return Object.assign({}, state, { confirmAlert });

        case types.CLOSE_CONFIRM_ALERT:
            return Object.assign({}, state, { confirmAlert: initialState.confirmAlert });

        case types.UPDATE_WEB_SOCKET_CONNECTION_STATUS:
            let webSocket = { connectionStatus: action.connectionStatus };
            return Object.assign({}, state, { webSocket });

        case types.GET_WEB_DIALER_CONFIG:
            newState = { ...state };
            newState.webDialer = { ...newState.webDialer };
            newState.webDialer.extensions = [...newState.webDialer.extensions];
            newState.webDialer.extensions[action.extension.server_key] = action.extension;
            return newState;

        case types.UPDATE_WEB_DIALER_STATUS:
            newState = { ...state };
            newState.webDialer = { ...newState.webDialer };

            newState.webDialer.status = action.status;

            return newState;

        case types.RESET_WEB_DIALER:
            return Object.assign({}, state, { webDialer: initialState.webDialer });

        case types.LOAD_META_DATA_VOLUNTEER_KEYS:
            newState = { ...state };
            newState.metaData = { ...newState.metaData };
            newState.metaData.metaDataVolunteerKeys = [...newState.metaData.metaDataVolunteerKeys];

            newState.metaData.metaDataVolunteerKeys = action.metaDataKeys;

            return newState;

        case types.LOAD_ALL_META_DATA_VALUES:
            newState = { ...state };
            newState.metaData = { ...newState.metaData };
            newState.metaData.metaDataValues = [...newState.metaData.metaDataValues];
            newState.metaData.metaValuesHashByKeyId = [...newState.metaData.metaValuesHashByKeyId];

            let metaValuesHashByKeyId = [];
            let metaDataValues = action.metaDataValues;

            metaDataValues.forEach(function (metaValueItem) {
                if (metaValuesHashByKeyId[metaValueItem.voter_meta_key_id] == undefined) {
                    metaValuesHashByKeyId[metaValueItem.voter_meta_key_id] = [
                        { id: metaValueItem.id, value: metaValueItem.value }
                    ];
                } else {
                    let tempObj = { id: metaValueItem.id, value: metaValueItem.value };
                    metaValuesHashByKeyId[metaValueItem.voter_meta_key_id].push(tempObj);
                }
            });

            newState.metaData.metaDataValues = action.metaDataValues;
            newState.metaData.metaValuesHashByKeyId = metaValuesHashByKeyId;

            return newState;
        
        case types.MAINTENANCE_MODE:
             newState = { ...state };
            newState.maintenanceMode = true;
            return newState;
            break;

        case types.MAINTENANCE_DATE:
             newState = { ...state };
            newState.maintenanceDate = action.maintenanceDate;
            return newState;
            break;

        case types.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY:
             newState = { ...state };
            newState.displayErrorModalDialog = action.displayError;
            newState.modalDialogErrorMessage = action.errorMessage || '';
            return newState;
        case types.AUDIO_INPUT: 
            newState = {...state};
            newState.audioInput = action.input;
            return newState;
            break;

        case types.SET_CURRENT_SIP_SERVER_NAME:
            newState = { ...state };
            newState.sipServerName = action.sipServerName;
            return newState;
            break;

        case types.UPDATE_SIP_NUMBER:
            newState = { ...state };
            newState.webDialer = { ...newState.webDialer };
            newState.webDialer.sipnumber = action.sipNumber;
            return newState;
            break;

        case types.UPDATE_UNREGISTERED_SECONDS:
            newState = {...state};
            newState.webDialer = { ...newState.webDialer };
            newState.webDialer.unregisteredSeconds = action.unregisteredSeconds;
            return newState;
            break;
            
        default:
            return state;
    }
}
