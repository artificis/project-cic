import { createLogic } from 'redux-logic';
import GitHubApiClient from 'services/GitHubApiClient';
import { withCommonErrorHandling } from 'services/utils';
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
    dispatch(setProjects(repositories));
    for (let repository of repositories) {
      dispatch(log(`<span class="text-info">${repository.name}</span>`));
    }
  })
});

const repositoryTreeLogic = createLogic({
  type: GET_REPOSITORY_TREE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling repository tree...'));
    const { repoName, repoTreePath } = payload;
    const entries = await client.treeEntries(repoName, repoTreePath);

    if (entries.length === 0) {
      return dispatch(log('The repository for this project is empty'));
    }

    dispatch(log('&nbsp;'));
    dispatch(setRepositoryTree(entries));
    for (let entry of entries) {
      dispatch(log(entry.type === 'tree'
        ? `<span class="text-info">${entry.name}</span>`
        : entry.name
      ));
    }
  })
});

export default [
  projectsLogic,
  repositoryTreeLogic
];
