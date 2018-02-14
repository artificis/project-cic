import { createLogic } from 'redux-logic';
import GitHubApiClient from 'utils/github-api-client';
import { logFunction, withCommonErrorHandling } from 'utils';
import { authTokenSelector } from 'services/auth';
import {
  GET_REPOSITORIES,
  GET_REPOSITORY_TREE,
  SET_CURRENT_REPOSITORY,
  setRepositories,
  setRepositoryTree,
  setCurrentRepositoryRefSha
} from './repo';

const repositoriesLogic = createLogic({
  type: GET_REPOSITORIES,
  process: withCommonErrorHandling(async ({ getState }, dispatch) => {
    const log = logFunction(dispatch);
    const client = new GitHubApiClient(authTokenSelector(getState()));
    log('Pulling repositories...');
    const repositories = await client.repositories();
    log('&nbsp;');
    dispatch(setRepositories(repositories));
    repositories.forEach(repository => {
      log(`<span class="text-info">${repository.name}</span>`);
    });
  })
});

const repositoryTreeLogic = createLogic({
  type: GET_REPOSITORY_TREE,
  process: withCommonErrorHandling(
    async ({ getState, action: { payload } }, dispatch) => {
      const log = logFunction(dispatch);
      const client = new GitHubApiClient(authTokenSelector(getState()));
      log('Pulling repository tree...');
      const { repoName, repoTreePath } = payload;
      const entries = await client.treeEntries(repoName, repoTreePath);

      if (entries.length === 0) {
        return log(`repository ${repoName} is empty`);
      }

      log('&nbsp;');
      dispatch(setRepositoryTree(entries));
      return entries.forEach(entry => {
        log(
          entry.type === 'tree'
            ? `<span class="text-info">${entry.name}</span>`
            : entry.name
        );
      });
    }
  )
});

const repositoryRetrievalLogic = createLogic({
  type: SET_CURRENT_REPOSITORY,
  process: async ({ getState, action: { payload }, dispatch }) => {
    if (payload === null) {
      dispatch(setCurrentRepositoryRefSha(null));
    } else {
      const client = new GitHubApiClient(authTokenSelector(getState()));
      const refSha = await client.getReferenceSha(payload.resourcePath);
      dispatch(setCurrentRepositoryRefSha(refSha));
    }
  }
});

export default [
  repositoriesLogic,
  repositoryTreeLogic,
  repositoryRetrievalLogic
];
