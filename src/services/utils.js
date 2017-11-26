import getGitLabApiClient from 'node-gitlab-api';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';

export const gitlabApiClient = oauthToken => getGitLabApiClient({ oauthToken });

export function withCommonErrorHandling(processFunc) {
  return async (depObj, dispatch, done) => {
    try {
      await processFunc(depObj, dispatch);
    } catch (err) {
      if (err.statusCode === 401) {
        dispatch(log('Error: access token is invalid or expired. Please sign out and sign in again.'));
      } else {
        dispatch(log(`Error: ${JSON.stringify(err.getBody())}`));
      }
    } finally {
      dispatch(log('&nbsp;'));
      dispatch(setTerminalBusy(false));
      done();
    }
  }
};
