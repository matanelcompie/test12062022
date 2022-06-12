import React from 'react';
import ReactDOM from 'react-dom';
import store from './store/store';
import {Provider} from 'react-redux';
import MobileApp from './components/MobileApp';

const appMobile = document.getElementById('appMobile');
ReactDOM.render(
  <Provider store={store}>
    <MobileApp></MobileApp>
  </Provider>
, appMobile);