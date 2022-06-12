import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import * as  SystemActions  from './actions/SystemActions'
import store from './store/store'
import { Provider } from "react-redux";

// import * as serviceWorker from './serviceWorker';
// import styles from '../resources/assets/sass/polls/styles.scss'
SystemActions.setSystemStatusInterval(store);
SystemActions.loadCurrentUser(store);
SystemActions.loadCurrentCampaign(store.dispatch);
SystemActions.loadLastViewedVoters(store.dispatch);
SystemActions.loadUserFavorites(store.dispatch);
SystemActions.loadMenu(store);
SystemActions.loadErrors(store);
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
