import getGitLabApiClient from 'node-gitlab-api';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { setModalUiEnabled } from 'services/modal';

export const gitlabApiClient = oauthToken => getGitLabApiClient({ oauthToken });

export function withCommonErrorHandling(
  processFunc,
  errHandlers = {},
  { callSetTerminalBusy = true } = {}
) {
  return async (depObj, dispatch, done) => {
    try {
      dispatch(setModalUiEnabled(false));
      await processFunc(depObj, dispatch);
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        if (errHandlers[err.statusCode]) {
          errHandlers[err.statusCode](dispatch);
        } else if (err.statusCode === 401) {
          dispatch(log('Error: access token is invalid or expired. Please sign out and sign in again.'));
        }
      } else if (typeof err.getBody === 'function') {
        dispatch(log(`Error: ${JSON.stringify(err.getBody())}`));
      } else {
        dispatch(log(`Error: ${err.message}`));
      }
    } finally {
      dispatch(setModalUiEnabled(true));
      if (callSetTerminalBusy) {
        dispatch(log('&nbsp;'));
        dispatch(setTerminalBusy(false));
      }
      done();
    }
  }
};
