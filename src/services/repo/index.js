import { createAction, handleActions } from 'redux-actions';

// constants
export const GET_PROJECTS = 'GET_PROJECTS';
export const SET_PROJECTS = 'SET_PROJECTS';

// action creators
export const getProjects = createAction(GET_PROJECTS);
export const setProjects = createAction(SET_PROJECTS);

// reducer
const initialState = {
  projects: [],
  currentProject: null,
  currentRepositoryTree: [],
  currentRepositoryPath: null
};

export default handleActions({
  [SET_PROJECTS]: (state, { payload }) => ({
    ...state,
    projects: payload
  })
}, initialState);

// logics
export const logics = require('./logics').default;
