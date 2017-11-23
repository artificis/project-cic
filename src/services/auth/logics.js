import { createLogic } from 'redux-logic';
import requestify from 'requestify';
import { GET_ACCESS_TOKEN, setOauthToken } from 'services/auth';

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
      const response = await requestify.post(`${REACT_APP_API_BASE_URI}/gitlab/oauth/token`, {
        client_id: REACT_APP_GITLAB_APP_ID,
        client_secret: REACT_APP_GITLAB_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REACT_APP_GITLAB_OAUTH_REDIRECT_URI,
        code: payload
      });
      dispatch(setOauthToken(response.getBody()));
    } catch (err) {
      const message = err.getBody().error === 'invalid_grant' ? 'Access denied' : 'Error';
      // dispatch(setFlash(new Error(message)));
    } finally {
      done();
    }
  }
});

export default [
  loginLogic
];
