import { createLogic } from 'redux-logic';
import requestify from 'requestify';
import { history } from 'store';
import { gitlabApiClient } from 'services/utils';
import { GET_ACCESS_TOKEN, setOauthToken, setCurrentUser } from 'services/auth';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';

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
        // const api = gitlabApiClient(token.access_token);
        // const res = await api.users.current();
        // dispatch(setCurrentUser(res.body));
        // dispatch(log('You are now signed in.'));
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
