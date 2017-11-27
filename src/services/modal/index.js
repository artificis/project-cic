import { createAction, handleActions } from 'redux-actions';

// constants
export const OPEN_MODAL = 'OPEN_MODAL';
export const SET_MODAL_UI_ENABLED = 'SET_MODAL_UI_ENABLED';
export const SET_MODAL_MODE = 'SET_MODAL_MODE';
export const SET_CIC_DATA = 'SET_CIC_DATA';
export const CLOSE_MODAL = 'CLOSE_MODAL';
export const COMMIT_AND_CLOSE_MODAL = 'COMMIT_AND_CLOSE_MODAL';
export const COMMIT_DATA = 'COMMIT_DATA';

// action creators
export const openModal = createAction(OPEN_MODAL);
export const setModalUiEnabled = createAction(SET_MODAL_UI_ENABLED);
export const setModalMode = createAction(SET_MODAL_MODE);
export const setCicData = createAction(SET_CIC_DATA);
export const closeModal = createAction(CLOSE_MODAL);
export const commitAndCloseModal = createAction(COMMIT_AND_CLOSE_MODAL);
export const commitData = createAction(COMMIT_DATA);

// reducer
const initialState = {
  open: false,
  uiEnabled: true,
  mode: 'create',
  filePath: null,
  imageBlob: null,
  cicData: {}
};

export default handleActions({
  [OPEN_MODAL]: (state, { payload }) => ({
    ...state,
    open: true,
    mode: payload.mode,
    filePath: payload.filePath,
    imageBlob: payload.imageBlob
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
  [CLOSE_MODAL]: state => ({
    ...state,
    open: false
  })
}, initialState);

// selectors
export const modalOpenSelector = state => state.modal.open;
export const modalUiEnabledSelector = state => state.modal.uiEnabled;
export const modalModeSelector = state => state.modal.mode;
export const modalFilePathSelector = state => state.modal.filePath;
export const imageBlobSelector = state => state.modal.imageBlob;
export const cicDataSelector = state => state.modal.cicData;
