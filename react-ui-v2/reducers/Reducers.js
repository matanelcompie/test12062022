import {combineReducers} from 'redux';
import voterReducer from './VoterReducer';
import systemReducer from './SystemReducer';
import crmReducer from './CrmReducer';
import globalReducer from './GlobalReducer';
import tmReducer from 'tm/reducers/tmReducer';
import electionsReducer from './ElectionsReducer';

export default combineReducers({
    voters: voterReducer,
    system: systemReducer,
    crm: crmReducer,
    global: globalReducer,
    tm: tmReducer,
    elections: electionsReducer
});