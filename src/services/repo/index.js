import { createAction, handleActions } from 'redux-actions';

// constants
export const GET_PROJECTS = 'GET_PROJECTS';
export const SET_PROJECTS = 'SET_PROJECTS';
export const SET_CURRENT_PROJECT = 'SET_CURRENT_PROJECT';
export const GET_REPOSITORY_TREE = 'GET_REPOSITORY_TREE';
export const SET_REPOSITORY_TREE = 'SET_REPOSITORY_TREE';

// action creators
export const getProjects = createAction(GET_PROJECTS);
export const setProjects = createAction(SET_PROJECTS);
export const setCurrentProject = createAction(SET_CURRENT_PROJECT);
export const getRepositoryTree = createAction(GET_REPOSITORY_TREE);
export const setRepositoryTree = createAction(SET_REPOSITORY_TREE);

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
  }),
  [SET_REPOSITORY_TREE]: (state, { payload }) => ({
    ...state,
    currentRepositoryTree: payload
  })
}, initialState);

// selectors
export const projectsSelector = state => state.repo.projects;
export const currentProjectSelector = state => state.repo.currentProject;
export const currentRepositoryPathSelector = state => state.repo.currentRepositoryPath;

// logics
export const logics = require('./logics').default;
