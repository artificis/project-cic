import { createLogic } from 'redux-logic';
import requestify from 'requestify';
import { history } from 'store';
import GitHubApiClient from 'utils/github-api-client';
import { setTerminalBusy, spitToTerminal } from 'services/terminal';
import { GET_ACCESS_TOKEN, setOauthToken, setCurrentUser } from './auth';

const { REACT_APP_API_BASE_URI: API_BASE_URI } = process.env;

const loginLogic = createLogic({
  type: GET_ACCESS_TOKEN,
  process: async ({ action: { payload } }, dispatch, done) => {
    const log = contents => dispatch(spitToTerminal(contents));
    try {
      dispatch(setTerminalBusy(true));
      log('Verifying OAuth code...');
      const response = await requestify.post(`${API_BASE_URI}/github/oauth`, {
        code: payload
      });
      const token = response.getBody();
      if (token.error === 'bad_verification_code') {
        log('Bad OAuth code');
        log('Please try again.');
      } else {
        dispatch(setOauthToken(token));
        log('OAuth code verified');
        log('Pulling user info...');
        const client = new GitHubApiClient(token);
        dispatch(setCurrentUser(await client.currentUser()));
        log('You are now signed in.');
      }
    } catch (err) {
      log('Could not verify OAuth code.');
      if (typeof err.getBody === 'function') {
        log(JSON.stringify(err.getBody()));
      }
    } finally {
      log('&nbsp;');
      dispatch(setTerminalBusy(false));
      history.push('/');
      done();
    }
  }
});

export default [loginLogic];
