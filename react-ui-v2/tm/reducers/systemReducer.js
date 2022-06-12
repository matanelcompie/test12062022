import {types} from 'tm/actions/systemActions';

const initialState = {
    lists: {
        cti_permissions: []
    },
    confirmAlert: {
        show: false,
        actionFile: '',
        confirmFuncName: '',
        params: [],
        messageText: '',
        messageTitle: ''
    },
    breadcrumbs: [],
    systemTitle: '',
    existAudioInput: '',
};

export default function(state = initialState, action) {
    switch(action.type) {
        case types.GET_OPTION_LABELS_SUCCESS:
        case types.GET_ALL_LISTS_SUCCESS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            let data = action.data;
            for (var property in data) {
                if (data.hasOwnProperty(property)) newState.lists[property] = data[property];
            }
            return newState;
            break;

        case types.OPEN_CONFIRM_ALERT:
            let confirmAlert = {show: true, ...action};
            delete confirmAlert.type;
            return Object.assign({}, state, {confirmAlert});

        case types.CLOSE_CONFIRM_ALERT:
            return Object.assign({}, state, {confirmAlert: initialState.confirmAlert});

        //Load cti permissions to state
        case types.LOADED_CTI_PERMISSIONS_LIST:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.cti_permissions = action.permissions;
            return newState;
            break;
        case types.SET_SYSTEM_TITLE:
            var newState = {...state};
            newState.systemTitle = action.systemTitle;
            return newState;
        case types.RESET_BREADCRUMBS:
            var newState = {...state};
            newState.breadcrumbs = [{ url: './', title: 'דף הבית', elmentType: 'home' }];
            return newState;
        case types.ADD_BREADCRUMBS:
            var newState = { ...state };
            newState.breadcrumbs = [...newState.breadcrumbs, action.newLocation];
            return newState;
		case types.UPDATE_BREADCRUMBS:
            var newState = {...state};
            var breadcrumbs = [...newState.breadcrumbs];
            let lastBreadcrumbsIndex = breadcrumbs.length - 1;
            breadcrumbs[lastBreadcrumbsIndex] = {...breadcrumbs[lastBreadcrumbsIndex]};
            breadcrumbs[lastBreadcrumbsIndex].title = action.title;
            newState.breadcrumbs = breadcrumbs;
            return newState;
            break;
    // Display error modal
        case types.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY:
            var newState = { ...state };
            newState.displayErrorModalDialog = action.displayError;
            newState.modalDialogErrorMessage = action.errorMessage || '';
            return newState;
    //saving changes
        case types.SAVING_CHANGES:
        var newState = {...state};
        newState.savingChanges = true;
        return newState;
        //changes not saved
        case types.CHANGES_NOT_SAVED:
            var newState = {...state};
            newState.savingChanges = false;
            newState.changesNotSaved = true;
            return newState;
        //changes saved
        case types.CHANGES_SAVED:
            var newState = {...state};
            newState.savingChanges = false;
            newState.changesSaved = true;
            return newState;
        case types.SET_AUDIO_STATE:
            var newState = { ...state };
            newState.existAudioInput = action.existAudioInput;
            return newState;
        default:
            return state;
        

    }
}
