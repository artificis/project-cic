import { createLogic } from 'redux-logic';
import { gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import { GET_PROJECTS, setProjects } from 'services/repo';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';

const projectsLogic = createLogic({
  type: GET_PROJECTS,
  process: async ({ getState }, dispatch, done) => {
    try {
      const api = gitlabApiClient(authTokenSelector(getState()));
      dispatch(log('Pulling projects...'));
      dispatch(setProjects(await api.projects.all({ owned: true })));
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
});

export default [
  projectsLogic
];
