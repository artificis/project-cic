import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector, currentUserSelector } from 'services/auth';
import {
  projectsSelector,
  currentProjectSelector,
  currentRepositoryTreeSelector,
  currentRepositoryPathSelector,
  getProjects,
  setCurrentProject,
  getRepositoryTree,
  setRepositoryTree,
  setCurrentRepositoryPath
} from 'services/repo';
import { command, requiresAuth } from './decorators';

const { getState, dispatch } = store;
const state = () => selector(getState());
const selector = createStructuredSelector({
  loggedIn: authenticatedSelector,
  user: currentUserSelector,
  projects: projectsSelector,
  currentProject: currentProjectSelector,
  currentRepoTree: currentRepositoryTreeSelector,
  currentRepoPath: currentRepositoryPathSelector
});

class Command {
  static commands = {};

  @command()
  static login({ log }) {
    const { loggedIn } = state();
    if (loggedIn) {
      log('You are already signed in.');
      return true;
    } else {
      log('Signing in...');
      setTimeout(() => window.location.assign(GITLAB_OAUTH_URL), 1000);
      return false;
    }
  }

  @command()
  @requiresAuth
  static whoami({ log }) {
    const { user } = state();
    log(user.username);
    return true;
  }

  @command()
  @requiresAuth
  static ls() {
    const { currentProject, currentRepoPath } = state();
    if (currentProject) {
      this.lsRepositoryTree(currentProject, currentRepoPath);
    } else {
      this.lsProjects();
    }
  }

  static lsProjects() {
    dispatch(getProjects());
  }

  static lsRepositoryTree(currentProject, currentRepoPath) {
    dispatch(getRepositoryTree({
      projectId: currentProject.id,
      repoTreePath: currentRepoPath
    }));
  }

  @command()
  @requiresAuth
  static cd({ args, log }) {
    if (args.length === 0) {
      return this.cdToRoot();
    } else if (args[0] === '..') {
      return this.cdUpwards();
    } else if (state().currentProject) {
      return this.cdIntoRepositoryTree(args[0], log);
    } else {
      return this.cdIntoProject(args[0], log);
    }
  }

  static cdToRoot() {
    dispatch(setCurrentProject(null));
    return true;
  }

  static cdUpwards() {
    const { currentProject, currentRepoPath } = state();
    if (currentRepoPath !== '') {
      const pathItems = currentRepoPath.split('/');
      pathItems.pop();
      dispatch(setCurrentRepositoryPath(pathItems.join('/')));
    } else if (currentProject) {
      this.cdToRoot();
    }
    return true;
  }

  static cdIntoProject(path, log) {
    const { projects } = state();
    const project = projects.find(p => p.path === path);
    if (project) {
      dispatch(setCurrentProject(project));
    } else {
      log(`cd: no such project: ${path}`);
    }
    return true;
  }

  static cdIntoRepositoryTree(folderName, log) {
    const { currentProject, currentRepoTree } = state();
    const folder = currentRepoTree.find(e => e.name === folderName && e.type === 'tree');
    if (folder) {
      dispatch(setCurrentRepositoryPath(folder.path));
    } else {
      log(`cd: no such directory: ${folderName}`);
    }
    return true;
  }
}

export default Command.commands;
