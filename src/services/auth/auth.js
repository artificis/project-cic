import { createAction, handleActions } from 'redux-actions';

const { REACT_APP_GITHUB_CLIENT_ID } = process.env;

// constants
export const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize?client_id=${REACT_APP_GITHUB_CLIENT_ID}&scope=repo`;
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
export const authTokenSelector = state => state.auth.token;
export const currentUserSelector = state => state.auth.user;
