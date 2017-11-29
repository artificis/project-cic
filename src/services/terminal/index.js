import { createAction, handleActions } from 'redux-actions';

// constants
export const SPIT_TO_TERMINAL = 'SPIT_TO_TERMINAL';
export const SET_TERMINAL_BUSY_STATE = 'SET_TERMINAL_BUSY_STATE';
export const SET_TERMINAL_VALUE_PROMPT_MODE = 'SET_TERMINAL_VALUE_PROMPT_MODE';
export const RESET_TERMINAL_VALUE_PROMPT_MODE = 'RESET_TERMINAL_VALUE_PROMPT_MODE';

// action creators
export const spitToTerminal = createAction(SPIT_TO_TERMINAL);
export const setTerminalBusy = createAction(SET_TERMINAL_BUSY_STATE);
export const setTerminalValuePromptMode = createAction(SET_TERMINAL_VALUE_PROMPT_MODE);
export const resetTerminalValuePromptMode = createAction(RESET_TERMINAL_VALUE_PROMPT_MODE);

// reducer
const initialState = {
  logs: [],
  busy: false,
  valuePromptMode: {
    on: false,
    passwordMode: true,
    promptLabel: '',
    onConfirm(value) {}
  }
};

export default handleActions({
  [SPIT_TO_TERMINAL]: (state, { payload }) => ({
    ...state,
    logs: state.logs.concat(payload)
  }),
  [SET_TERMINAL_BUSY_STATE]: (state, { payload }) => ({
    ...state,
    busy: payload
  }),
  [SET_TERMINAL_VALUE_PROMPT_MODE]: (state, { payload: { passwordMode, promptLabel, onConfirm } }) => ({
    ...state,
    valuePromptMode: {
      passwordMode,
      promptLabel,
      onConfirm,
      on: true
    }
  }),
  [RESET_TERMINAL_VALUE_PROMPT_MODE]: state => ({
    ...state,
    valuePromptMode: initialState.valuePromptMode
  })
}, initialState);

// selectors
export const terminalLogsSelector = state => state.terminal.logs;
export const terminalBusyStateSelector = state => state.terminal.busy;
export const terminalValuePromptModeSelector = state => state.terminal.valuePromptMode;
