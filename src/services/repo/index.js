import { createAction, handleActions } from 'redux-actions';

// constants
export const GET_PROJECTS = 'GET_PROJECTS';
export const SET_PROJECTS = 'SET_PROJECTS';
export const SET_CURRENT_PROJECT = 'SET_CURRENT_PROJECT';

// action creators
export const getProjects = createAction(GET_PROJECTS);
export const setProjects = createAction(SET_PROJECTS);
export const setCurrentProject = createAction(SET_CURRENT_PROJECT);

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
  }),
  [SET_CURRENT_PROJECT]: (state, { payload }) => ({
    ...state,
    currentProject: payload
  })
}, initialState);

// selectors
export const projectsSelector = state => state.repo.projects;

// logics
export const logics = require('./logics').default;
