import { createAction, handleActions } from 'redux-actions';

// constants
export const OPEN_QR_CODE_MODAL = 'OPEN_QR_CODE_MODAL';
export const CLOSE_QR_CODE_MODAL = 'CLOSE_QR_CODE_MODAL';

// action creators
export const openQrCodeModal = createAction(OPEN_QR_CODE_MODAL);
export const closeQrCodeModal = createAction(CLOSE_QR_CODE_MODAL);

// reducer
const initialState = {
  open: false,
  data: ''
};
const reducer = {
  [OPEN_QR_CODE_MODAL]: (state, { payload }) => ({
    ...state,
    open: true,
    data: payload
  }),
  [CLOSE_QR_CODE_MODAL]: state => ({
    ...state,
    open: false
  })
};
export default handleActions(reducer, initialState);

// selectors
export const qrCodeModalOpenSelector = state => state.qrCodeModal.open;
export const qrCodeModalDataSelector = state => state.qrCodeModal.data;
