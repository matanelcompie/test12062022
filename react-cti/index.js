import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import store from './store';
import CtiApp from './components/CtiApp';
import routes from './routes';

import * as SystemActions from './actions/systemActions';

import './style/main.scss';

// Set logout timer
SystemActions.setLogoutTimer(store);
SystemActions.setSystemStatusInterval(store);

//set error catcher
window.onerror = function(errorMsg, url, lineNumber) {
	SystemActions.sendError(errorMsg, url, lineNumber);
}

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter basename={window.Laravel.baseURL + "cti"}>
            <CtiApp children={routes} />
        </BrowserRouter>
    </Provider>,
document.getElementById('app'));