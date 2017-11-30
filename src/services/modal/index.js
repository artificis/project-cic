import { createAction, handleActions } from 'redux-actions';

// constants
export const OPEN_MODAL = 'OPEN_MODAL';
export const SET_MODAL_UI_ENABLED = 'SET_MODAL_UI_ENABLED';
export const SET_MODAL_MODE = 'SET_MODAL_MODE';
export const SET_CIC_DATA = 'SET_CIC_DATA';
export const SET_FILE_SHA_VALUE = 'SET_FILE_SHA_VALUE';
export const CLOSE_MODAL = 'CLOSE_MODAL';
export const CREATE_FILE = 'CREATE_FILE';
export const UPDATE_FILE = 'UPDATE_FILE';
export const GET_FILE_CONTENT = 'GET_FILE_CONTENT';
export const SET_MASTER_KEY = 'SET_MASTER_KEY';

// action creators
export const openModal = createAction(OPEN_MODAL);
export const setModalUiEnabled = createAction(SET_MODAL_UI_ENABLED);
export const setModalMode = createAction(SET_MODAL_MODE);
export const setCicData = createAction(SET_CIC_DATA);
export const setFileShaValue = createAction(SET_FILE_SHA_VALUE);
export const closeModal = createAction(CLOSE_MODAL);
export const createFile = createAction(CREATE_FILE);
export const updateFile = createAction(UPDATE_FILE);
export const getFileContent = createAction(GET_FILE_CONTENT);
export const setMasterKey = createAction(SET_MASTER_KEY);

// reducer
const initialState = {
  open: false,
  uiEnabled: true,
  mode: 'create',
  filePath: null,
  imageBlob: null,
  cicData: {},
  fileShaValue: null,
  masterKey: ''
};

export default handleActions({
  [OPEN_MODAL]: (state, { payload: { mode, filePath, imageBlob, fileShaValue } }) => ({
    ...state,
    mode,
    filePath,
    imageBlob,
    fileShaValue,
    open: true,
    uiEnabled: true
  }),
  [SET_MODAL_UI_ENABLED]: (state, { payload }) => ({
    ...state,
    uiEnabled: payload
  }),
  [SET_MODAL_MODE]: (state, { payload }) => ({
    ...state,
    mode: payload
  }),
  [SET_CIC_DATA]: (state, { payload }) => ({
    ...state,
    cicData: payload
  }),
  [SET_FILE_SHA_VALUE]: (state, { payload }) => ({
    ...state,
    fileShaValue: payload
  }),
  [SET_MASTER_KEY]: (state, { payload }) => ({
    ...state,
    masterKey: payload
  }),
  [CLOSE_MODAL]: state => ({
    ...state,
    open: false,
    filePath: null,
    imageBlob: null,
    cicData: {}
  })
}, initialState);

// selectors
export const modalOpenSelector = state => state.modal.open;
export const modalUiEnabledSelector = state => state.modal.uiEnabled;
export const modalModeSelector = state => state.modal.mode;
export const modalFilePathSelector = state => state.modal.filePath;
export const imageBlobSelector = state => state.modal.imageBlob;
export const cicDataSelector = state => state.modal.cicData;
export const modalFileShaValueSelector = state => state.modal.fileShaValue;
export const masterKeySelector = state => state.modal.masterKey;

// logics
export const logics = require('./logics').default;
