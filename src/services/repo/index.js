import { createAction, handleActions } from 'redux-actions';

// constants
export const GET_PROJECTS = 'GET_PROJECTS';
export const SET_PROJECTS = 'SET_PROJECTS';
export const SET_CURRENT_PROJECT = 'SET_CURRENT_PROJECT';
export const GET_REPOSITORY_TREE = 'GET_REPOSITORY_TREE';
export const SET_REPOSITORY_TREE = 'SET_REPOSITORY_TREE';
export const SET_CURRENT_REPOSITORY_PATH = 'SET_CURRENT_REPOSITORY_PATH';

// action creators
export const getProjects = createAction(GET_PROJECTS);
export const setProjects = createAction(SET_PROJECTS);
export const setCurrentProject = createAction(SET_CURRENT_PROJECT);
export const getRepositoryTree = createAction(GET_REPOSITORY_TREE);
export const setRepositoryTree = createAction(SET_REPOSITORY_TREE);
export const setCurrentRepositoryPath = createAction(SET_CURRENT_REPOSITORY_PATH);

// reducer
const initialState = {
  projects: [],
  currentProject: null,
  currentRepositoryTree: [],
  currentRepositoryPath: ''
};

export default handleActions({
  [SET_PROJECTS]: (state, { payload }) => ({
    ...state,
    projects: payload
  }),
  [SET_CURRENT_PROJECT]: (state, { payload }) => ({
    ...state,
    currentProject: payload,
    currentRepositoryTree: [],
    currentRepositoryPath: ''
  }),
  [SET_REPOSITORY_TREE]: (state, { payload }) => ({
    ...state,
    currentRepositoryTree: payload
  }),
  [SET_CURRENT_REPOSITORY_PATH]: (state, { payload }) => ({
    ...state,
    currentRepositoryPath: payload
  })
}, initialState);

// selectors
export const projectsSelector = state => state.repo.projects;
export const currentProjectSelector = state => state.repo.currentProject;
export const currentRepositoryTreeSelector = state => state.repo.currentRepositoryTree;
export const currentRepositoryPathSelector = state => state.repo.currentRepositoryPath;

// logics
export const logics = require('./logics').default;
