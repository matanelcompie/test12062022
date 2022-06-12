
import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';

import reducers from '../reducers/reducers';
const middlewares = applyMiddleware(thunk);

export default createStore(
    reducers,
    middlewares
);