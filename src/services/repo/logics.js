import { createLogic } from 'redux-logic';
import GitHubApiClient from 'services/GitHubApiClient';
import { withCommonErrorHandling, gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import {
  GET_PROJECTS, GET_REPOSITORY_TREE,
  setProjects, setRepositoryTree
} from 'services/repo';
import { spitToTerminal as log } from 'services/terminal';

const projectsLogic = createLogic({
  type: GET_PROJECTS,
  process: withCommonErrorHandling(async ({ getState }, dispatch) => {
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling projects...'));
    const repositories = await client.repositories();
    dispatch(log('&nbsp;'));
    for (let repository of repositories) {
      dispatch(log(`<span class="text-info">${repository.name}</span>`));
    }
    dispatch(setProjects(repositories));
  })
});

const repositoryTreeLogic = createLogic({
  type: GET_REPOSITORY_TREE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling repository tree...'));
    const { projectId, repoTreePath } = payload;
    const tree = await api.projects.repository.listTree(projectId, { path: repoTreePath });
    dispatch(log('&nbsp;'));
    for (let item of tree) {
      if (item.type === 'tree') {
        dispatch(log(`<span class="text-info">${item.name}</span>`));
      } else {
        dispatch(log(item.name));
      }
    }
    dispatch(setRepositoryTree(tree));
  }, {
    404: dispatch => {
      dispatch(log('The repository for this project is empty.'));
    }
  })
});

export default [
  projectsLogic,
  repositoryTreeLogic
];
