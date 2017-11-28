import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import auth from './auth';
import repo from './repo';
import terminal from './terminal';
import modal from './modal';
import qrCodeModal from './qrcode-modal';

export default combineReducers({
  router,
  auth,
  repo,
  terminal,
  modal,
  qrCodeModal
});
