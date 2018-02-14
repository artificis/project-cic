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
  setCurrentRepositoryRefSha,
  setCurrentRepositoryRefBaseTreeSha
} from './repo';

const { REACT_APP_GIT_REFERENCE: GIT_REFERENCE } = process.env;

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
  process: async ({ getState, action: { payload } }, dispatch, done) => {
    if (payload === null) {
      dispatch(setCurrentRepositoryRefSha(null));
      dispatch(setCurrentRepositoryRefBaseTreeSha(null));
    } else {
      const { resourcePath } = payload;
      const client = new GitHubApiClient(authTokenSelector(getState()));
      let response = await client.getReferences(resourcePath);
      const reference = response.getBody().find(e => e.ref === GIT_REFERENCE);

      if (reference) {
        const { sha } = reference.object;
        dispatch(setCurrentRepositoryRefSha(sha));
        response = await client.getCommit(resourcePath, sha);
        const baseTreeSHA = response.getBody().tree.sha;
        dispatch(setCurrentRepositoryRefBaseTreeSha(baseTreeSHA));
      } else {
        dispatch(setCurrentRepositoryRefSha(null));
        dispatch(setCurrentRepositoryRefBaseTreeSha(null));
      }
    }
    done();
  }
});

export default [
  repositoriesLogic,
  repositoryTreeLogic,
  repositoryRetrievalLogic
];
