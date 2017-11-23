import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import auth from './auth';
import terminal from './terminal';

export default combineReducers({
  router,
  auth,
  terminal
});
