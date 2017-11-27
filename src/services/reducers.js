import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import auth from './auth';
import repo from './repo';
import terminal from './terminal';
import modal from './modal';

export default combineReducers({
  router,
  auth,
  repo,
  terminal,
  modal
});
