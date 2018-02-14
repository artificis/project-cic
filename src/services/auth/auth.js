import { createAction, handleActions } from 'redux-actions';

// constants
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
const reducer = {
  [SET_OAUTH_TOKEN]: (state, { payload }) => ({
    ...state,
    token: payload
  }),
  [SET_CURRENT_USER]: (state, { payload }) => ({
    ...state,
    user: payload
  })
};
export default handleActions(reducer, initialState);

// selectors
export const authenticatedSelector = state => state.auth.token !== null;
export const authTokenSelector = state => state.auth.token;
export const currentUserSelector = state => state.auth.user;
