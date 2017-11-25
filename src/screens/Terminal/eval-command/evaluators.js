import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector, currentUserSelector } from 'services/auth';
import {
  projectsSelector, currentProjectSelector, currentRepositoryPathSelector,
  getProjects, setCurrentProject, getRepositoryTree
} from 'services/repo';
import { requiresAuth } from './decorators';

const { getState, dispatch } = store;
const state = () => selector(getState());
const selector = createStructuredSelector({
  loggedIn: authenticatedSelector,
  user: currentUserSelector,
  projects: projectsSelector,
  currentProject: currentProjectSelector,
  currentRepoPath: currentRepositoryPathSelector
});

class Command {
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

  @requiresAuth
  static whoami({ log }) {
    const { user } = state();
    log(user.username);
    return true;
  }

  @requiresAuth
  static ls() {
    const { currentProject, currentRepoPath } = state();
    if (currentProject) {
      dispatch(getRepositoryTree({
        projectId: currentProject.id,
        repoTreePath: currentRepoPath
      }));
    } else {
      dispatch(getProjects());
    }
  }

  @requiresAuth
  static cd({ args, log }) {
    if (args.length === 0) {
      return this.cdToRoot();
    }

    const { projects } = state();
    const project = projects.find(p => p.path === args[0]);
    if (project) {
      dispatch(setCurrentProject(project));
    } else {
      log(`cd: no such project or directory: ${args[0]}`);
    }
    return true;
  }

  static cdToRoot() {
    dispatch(setCurrentProject(null));
    return true;
  }
}

export default {
  login: Command.login,
  whoami: Command.whoami,
  ls: Command.ls,
  cd: Command.cd.bind(Command)
};
