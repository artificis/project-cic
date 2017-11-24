import { createAction, handleActions } from 'redux-actions';

// constants
export const GITLAB_OAUTH_URL = `https://gitlab.com/oauth/authorize?client_id=${process.env.REACT_APP_GITLAB_APP_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_GITLAB_OAUTH_REDIRECT_URI}`;
export const GET_ACCESS_TOKEN = 'GET_ACCESS_TOKEN';
export const SET_OAUTH_TOKEN = 'SET_OAUTH_TOKEN';

// action creators
export const getAccessToken = createAction(GET_ACCESS_TOKEN);
export const setOauthToken = createAction(SET_OAUTH_TOKEN);

// reducer
const initialState = {
  token: null
  // token: {
  //   access_token: '1a53225a2ff5df19ca292f305a2bcd9f14fd2a9b3b89a723fcf56d80e38742e8',
  //   token_type: 'bearer',
  //   refresh_token: '065a5a9ed3fcd26c6226be3187566aa100476bd957be3b0ce8310d6a4a458f6b',
  //   scope: 'api',
  //   created_at: 1508501364
  // }
};

export default handleActions({
  [SET_OAUTH_TOKEN]: (state, { payload }) => ({
    ...state,
    token: payload
  })
}, initialState);

// selectors
export const authenticatedSelector = state => state.auth.token !== null;

// logics
export const logics = require('./logics').default;
