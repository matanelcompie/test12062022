import { createStore } from 'redux';
import Reducers from '../reducers/Reducers';

const store = createStore(
    Reducers,
);
export default store;
