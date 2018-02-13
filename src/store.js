import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { createLogicMiddleware } from 'redux-logic';
import createHistory from 'history/createHashHistory';
import reducers from 'services/reducers';
import logics from 'services/logics';

const history = createHistory();
const logicMiddleware = createLogicMiddleware(logics);
const enhancers = [applyMiddleware(logicMiddleware, routerMiddleware(history))];

if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(combineReducers(reducers), compose(...enhancers));

export { history };
export default store;
