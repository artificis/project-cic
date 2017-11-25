import { createLogic } from 'redux-logic';
import requestify from 'requestify';
import { history } from 'store';
import { gitlabApiClient } from 'services/utils';
import { GET_ACCESS_TOKEN, setOauthToken, setCurrentUser } from 'services/auth';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';

const {
  REACT_APP_API_BASE_URI,
  REACT_APP_GITLAB_APP_ID,
  REACT_APP_GITLAB_APP_SECRET,
  REACT_APP_GITLAB_OAUTH_REDIRECT_URI
} = process.env;

const loginLogic = createLogic({
  type: GET_ACCESS_TOKEN,
  process: async ({ action: { payload } }, dispatch, done) => {
    try {
      dispatch(setTerminalBusy(true));
      dispatch(log('Verifying oauth code...'));
      const response = await requestify.post(`${REACT_APP_API_BASE_URI}/gitlab/oauth/token`, {
        client_id: REACT_APP_GITLAB_APP_ID,
        client_secret: REACT_APP_GITLAB_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REACT_APP_GITLAB_OAUTH_REDIRECT_URI,
        code: payload
      });
      const token = response.getBody();
      dispatch(setOauthToken(token));
      dispatch(log('Oauth code verified.'));
      dispatch(log('Pulling user info...'));
      const api = gitlabApiClient(token.access_token);
      dispatch(setCurrentUser(await api.users.current()));
      dispatch(log('You are now signed in.'));
    } catch (err) {
      dispatch(log('Could not verify oauth code.'));
      dispatch(log(JSON.stringify(err.getBody())));
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
