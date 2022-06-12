import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import rootReducer from 'reducers';


export default createStore(
    rootReducer,
    compose(applyMiddleware(thunk, reduxImmutableStateInvariant()), window.devToolsExtension ? window.devToolsExtension() : f => f)
);
