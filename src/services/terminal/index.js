import { createAction, handleActions } from 'redux-actions';

// constants
export const SPIT_TO_TERMINAL = 'SPIT_TO_TERMINAL';
export const SET_TERMINAL_BUSY_STATE = 'SET_TERMINAL_BUSY_STATE';

// action creators
export const spitToTerminal = createAction(SPIT_TO_TERMINAL);
export const setTerminalBusy = createAction(SET_TERMINAL_BUSY_STATE);

// reducer
const initialState = {
  logs: [],
  busy: false
};

export default handleActions({
  [SPIT_TO_TERMINAL]: (state, { payload }) => ({
    ...state,
    logs: state.logs.concat(payload)
  }),
  [SET_TERMINAL_BUSY_STATE]: (state, { payload }) => ({
    ...state,
    busy: payload
  })
}, initialState);

// selectors
export const terminalLogsSelector = state => state.terminal.logs;
export const terminalBusyStateSelector = state => state.terminal.busy;
