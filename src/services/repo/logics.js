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
      const projects = await api.projects.all({ owned: true, order_by: 'path', sort: 'asc' });
      const simplifiedProjects = [];
      for (let project of projects) {
        dispatch(log(project.path));
        simplifiedProjects.push({
          id: project.id,
          path: project.path
        });
      }
      dispatch(setProjects(simplifiedProjects));
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
