import { createAction, handleActions } from 'redux-actions';

// constants
export const GET_REPOSITORIES = 'GET_REPOSITORIES';
export const SET_REPOSITORIES = 'SET_REPOSITORIES';
export const SET_CURRENT_REPOSITORY = 'SET_CURRENT_REPOSITORY';
export const GET_REPOSITORY_TREE = 'GET_REPOSITORY_TREE';
export const SET_REPOSITORY_TREE = 'SET_REPOSITORY_TREE';
export const SET_CURRENT_REPOSITORY_PATH = 'SET_CURRENT_REPOSITORY_PATH';

// action creators
export const getRepositories = createAction(GET_REPOSITORIES);
export const setRepositories = createAction(SET_REPOSITORIES);
export const setCurrentRepository = createAction(SET_CURRENT_REPOSITORY);
export const getRepositoryTree = createAction(GET_REPOSITORY_TREE);
export const setRepositoryTree = createAction(SET_REPOSITORY_TREE);
export const setCurrentRepositoryPath = createAction(
  SET_CURRENT_REPOSITORY_PATH
);

// reducer
const initialState = {
  repositories: [],
  currentRepository: null,
  currentRepositoryTree: [],
  currentRepositoryPath: ''
};
const reducer = {
  [SET_REPOSITORIES]: (state, { payload }) => ({
    ...state,
    repositories: payload
  }),
  [SET_CURRENT_REPOSITORY]: (state, { payload }) => ({
    ...state,
    currentRepository: payload,
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
};
export default handleActions(reducer, initialState);

// selectors
export const repositoriesSelector = state => state.repo.repositories;
export const currentRepositorySelector = state => state.repo.currentRepository;
export const currentRepositoryTreeSelector = state =>
  state.repo.currentRepositoryTree;
export const currentRepositoryPathSelector = state =>
  state.repo.currentRepositoryPath;
