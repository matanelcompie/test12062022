import InitialState from './InitialState';

function voterReducer(state = InitialState, action) {
    let newState = { ...state };
    switch (action.type) {
        case 'SET_USER_DATA':
            newState.currentUser = action.userData;
            return newState;
        case 'LOGIN_ERROR':
            newState.loginErrorData = action.errorData;
            return newState;
        case 'USER_LOGOUT':
            newState = {...InitialState};
            return newState;
        case 'DISPLAY_WARNING_MODAL':
            newState = {...InitialState};
            newState.displayWarningModal = action.display;
            newState.warningMessage = action.message;
            return newState;
        case 'SET_VOTER_DATA':
            newState.voterData = action.voterData;
            newState.voterAfterVoting = false;
            return newState;
        case 'SET_VOTER_AFTER_VOTING_STATE':
            newState.voterAfterVoting = true;
            return newState;
        case 'SET_VOTER_REPORTING_HISTORY':
            newState.votingReportHistoryList = action.data;
            return newState;
        default:
            return newState;
    }
}

export default voterReducer