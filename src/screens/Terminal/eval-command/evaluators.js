import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector, currentUserSelector } from 'services/auth';
import { projectsSelector, getProjects, setCurrentProject } from 'services/repo';
import { requiresAuth } from './decorators';

const { getState, dispatch } = store;
const selector = createStructuredSelector({
  loggedIn: authenticatedSelector,
  user: currentUserSelector,
  projects: projectsSelector
});

class Command {
  static login({ log }) {
    const { loggedIn } = selector(getState());
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
    const { user } = selector(getState());
    log(user.username);
    return true;
  }

  @requiresAuth
  static ls() {
    dispatch(getProjects());
  }

  @requiresAuth
  static cd({ args, log }) {
    const { projects } = selector(getState());
    const project = projects.find(p => p.path === args[0]);
    if (project) {
      dispatch(setCurrentProject(project));
    } else {
      log(`cd: no such project or directory: ${args[0]}`);
    }
    return true;
  }
}

export default {
  login: Command.login,
  whoami: Command.whoami,
  ls: Command.ls,
  cd: Command.cd
};
