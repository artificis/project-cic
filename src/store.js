import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createHashHistory';
import { createLogicMiddleware } from 'redux-logic';
import reducers from 'services/reducers';
import logics from 'services/logics';

export const history = createHistory();

const enhancers = [applyMiddleware(
  routerMiddleware(history),
  createLogicMiddleware(logics)
)];

if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(
  reducers,
  compose(...enhancers)
);

export default store;
