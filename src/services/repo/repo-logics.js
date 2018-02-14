import { createLogic } from 'redux-logic';
import GitHubApiClient from 'utils/github-api-client';
import { withCommonErrorHandling } from 'utils';
import { authTokenSelector } from 'services/auth';
import { spitToTerminal as log } from 'services/terminal';
import {
  GET_REPOSITORIES, GET_REPOSITORY_TREE,
  setRepositories, setRepositoryTree
} from './repo';

const repositoriesLogic = createLogic({
  type: GET_REPOSITORIES,
  process: withCommonErrorHandling(async ({ getState }, dispatch) => {
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling repositories...'));
    const repositories = await client.repositories();

    dispatch(log('&nbsp;'));
    dispatch(setRepositories(repositories));
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
      return dispatch(log(`repository ${repoName} is empty`));
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
  repositoriesLogic,
  repositoryTreeLogic
];
