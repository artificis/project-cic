import { createLogic } from 'redux-logic';
import requestify from 'requestify';
import { history } from 'store';
import GitHubApiClient from 'utils/github-api-client';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { GET_ACCESS_TOKEN, setOauthToken, setCurrentUser } from './auth';

const loginLogic = createLogic({
  type: GET_ACCESS_TOKEN,
  process: async ({ action: { payload } }, dispatch, done) => {
    try {
      dispatch(setTerminalBusy(true));
      dispatch(log('Verifying OAuth code...'));
      const response = await requestify.post(`${process.env.REACT_APP_API_BASE_URI}/github/oauth`, {
        code: payload
      });
      const token = response.getBody();
      if (token.error === 'bad_verification_code') {
        dispatch(log('Bad OAuth code'));
        dispatch(log('Please try again.'));
      } else {
        dispatch(setOauthToken(token));
        dispatch(log('OAuth code verified'));
        dispatch(log('Pulling user info...'));
        const client = new GitHubApiClient(token);
        dispatch(setCurrentUser(await client.currentUser()));
        dispatch(log('You are now signed in.'));
      }
    } catch (err) {
      dispatch(log('Could not verify OAuth code.'));
      if (typeof err.getBody === 'function') {
        dispatch(log(JSON.stringify(err.getBody())));
      }
    } finally {
      dispatch(log('&nbsp;'));
      dispatch(setTerminalBusy(false));
      history.push('/');
      done();
    }
  }
});

export default [
  loginLogic
];
