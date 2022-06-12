import {combineReducers} from 'redux';
import systemReducer from './systemReducer';

export default combineReducers({
    system: systemReducer,
});