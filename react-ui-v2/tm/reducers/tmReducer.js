import {combineReducers} from 'redux';
import system from './systemReducer';
import campaign from './campaignReducer';
import portion from './portionReducer';
import questionnaire from './questionnaireReducer';
import employee from './employeeReducer';

export default combineReducers({
    system,
    campaign,
    portion,
    questionnaire,
    employee
});
