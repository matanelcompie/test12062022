import {combineReducers} from 'redux';
import systemReducer from './systemReducer';
import SearchReducer from './SearchReducer';

export default combineReducers({
    system: systemReducer,
    SearchReducer: SearchReducer
});