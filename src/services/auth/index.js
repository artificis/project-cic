import { createAction, handleActions } from 'redux-actions';

// constants
export const GITLAB_OAUTH_URL = `https://gitlab.com/oauth/authorize?client_id=${process.env.REACT_APP_GITLAB_APP_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_GITLAB_OAUTH_REDIRECT_URI}`;
export const GET_ACCESS_TOKEN = 'GET_ACCESS_TOKEN';
export const SET_OAUTH_TOKEN = 'SET_OAUTH_TOKEN';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

// action creators
export const getAccessToken = createAction(GET_ACCESS_TOKEN);
export const setOauthToken = createAction(SET_OAUTH_TOKEN);
export const setCurrentUser = createAction(SET_CURRENT_USER);

// reducer
const initialState = {
  token: null,
  user: null
};

export default handleActions({
  [SET_OAUTH_TOKEN]: (state, { payload }) => ({
    ...state,
    token: payload
  }),
  [SET_CURRENT_USER]: (state, { payload }) => ({
    ...state,
    user: payload
  })
}, initialState);

// selectors
export const authenticatedSelector = state => state.auth.token !== null;
export const authTokenSelector = state => state.auth.token.access_token;
export const currentUserSelector = state => state.auth.user;

// logics
export const logics = require('./logics').default;
