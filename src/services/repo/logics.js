import { createLogic } from 'redux-logic';
import { withCommonErrorHandling, gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import { GET_PROJECTS, GET_REPOSITORY_TREE, setProjects, setRepositoryTree } from 'services/repo';
import { spitToTerminal as log } from 'services/terminal';

const projectsLogic = createLogic({
  type: GET_PROJECTS,
  process: withCommonErrorHandling(async ({ getState }, dispatch) => {
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
  })
});

const repositoryTreeLogic = createLogic({
  type: GET_REPOSITORY_TREE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling repository tree...'));
    const { projectId, repoTreePath } = payload;
    const tree = await api.projects.repository.listTree(projectId, repoTreePath);
    for (let item of tree) {
      dispatch(log(item.name));
    }
    dispatch(setRepositoryTree(tree));
  })
});

export default [
  projectsLogic,
  repositoryTreeLogic
];
