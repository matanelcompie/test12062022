import {combineReducers} from 'redux';

import campaign from './campaignReducer';
import call from './callReducer';
import callAnswer from './callAnswerReducer';
import system from './systemReducer';
import ui from './uiReducer';

export default combineReducers({
    campaign,
    call,
    callAnswer,
    system,
    ui,
});
