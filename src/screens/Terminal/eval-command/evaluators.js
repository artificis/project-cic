import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector, currentUserSelector } from 'services/auth';
import { setTerminalBusy } from 'services/terminal';
import {
  projectsSelector,
  currentProjectSelector,
  currentRepositoryTreeSelector,
  currentRepositoryPathSelector,
  getProjects,
  setCurrentProject,
  getRepositoryTree,
  setCurrentRepositoryPath,
  createFile
} from 'services/repo';
import { openModal } from 'services/modal';
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
    const { currentRepoTree } = state();
    const folder = currentRepoTree.find(e => e.name === folderName && e.type === 'tree');
    if (folder) {
      dispatch(setCurrentRepositoryPath(folder.path));
    } else {
      log(`cd: no such directory: ${folderName}`);
    }
    return true;
  }

  @command()
  @requiresAuth
  static pwd({ log }) {
    const { currentProject, currentRepoPath } = state();
    const pathItems = [];
    if (currentProject) pathItems.push(currentProject.path);
    if (currentRepoPath !== '') pathItems.push(currentRepoPath);
    log(`/${pathItems.join('/')}`);
    return true;
  }

  @command('new')
  @requiresAuth
  static newFile({ args, log }) {
    const { currentProject, currentRepoPath } = state();
    if (args.length === 0) {
      log('usage:');
      log('new &lt;filename&gt;');
    } else if (currentProject === null) {
      log('You are currently not inside a project repository.');
    } else {
      const fileInput = document.createElement('input');
      log('Please choose an image file.');
      fileInput.type = 'file';
      fileInput.accept = '.jpg,.jpeg,.png';
      fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            const imageBlob = atob(reader.result.split(',')[1]);
            log('Image file read.');
            // dispatch(createFile({
            //   projectId: currentProject.id,
            //   filePath: encodeURIComponent(`${currentRepoPath}/${args[0]}`),
            //   branch: currentProject.defaultBranch || 'master',
            //   options: {
            //     content: btoa(`${imageBlob}PROJECT-CIC${btoa(JSON.stringify({}))}`),
            //     commit_message: 'Test commit',
            //     encoding: 'base64'
            //   }
            // }));
            log('Now in edit/view mode...');
            dispatch(openModal({ imageBlob, mode: 'create' }));
          };
          dispatch(setTerminalBusy(true));
          log('Reading image file...');
          reader.readAsDataURL(fileInput.files[0]);
        }
      };
      fileInput.click();
    }
    return true;
  }
}

export default Command.commands;
