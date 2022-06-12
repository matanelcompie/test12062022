import {createStore, applyMiddleware, compose} from 'redux';
import Reducers from '../reducers/Reducers';
import thunk from 'redux-thunk';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';

let middlewares;
if (process.env.APP_ENV == 'production' || process.env.APP_ENV == 'staging') {
	middlewares = applyMiddleware(thunk);
} else {
	middlewares = compose(applyMiddleware(thunk, reduxImmutableStateInvariant({
        ignore: [
          'system.lists',
          'system.listsScreen.voterTab.dndSortTemp.voterGroups',
		  'elections.voters',
		  'global.documents.documents',
		  'voters.searchVoterScreen.searchForParams.street',
		  'voters.voterDetails',
		  'voters.voterDetails.voterReadOnlyFields',
		  'crm.requestSearch.lists.currentUserRoleTeams',
        ]
      })), window.devToolsExtension ? window.devToolsExtension() : f => f);
}
export default createStore(
    Reducers,
    middlewares
);
