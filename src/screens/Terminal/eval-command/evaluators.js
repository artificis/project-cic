import { createStructuredSelector } from 'reselect';
import store from 'store';
import {
  GITHUB_OAUTH_URL,
  authenticatedSelector, currentUserSelector,
  setOauthToken, setCurrentUser
} from 'services/auth';
import { setTerminalBusy, setTerminalValuePromptMode } from 'services/terminal';
import {
  repositoriesSelector,
  currentRepositorySelector,
  currentRepositoryTreeSelector,
  currentRepositoryPathSelector,
  getRepositories,
  setRepositories,
  setCurrentRepository,
  getRepositoryTree,
  setRepositoryTree,
  setCurrentRepositoryPath
} from 'services/repo';
import { openModal, getFileContent, setMasterKey } from 'services/modal';
import { command, requiresAuth } from './decorators';

const { getState, dispatch } = store;
const state = () => selector(getState());
const joinPath = (...parts) => parts.join('/').replace(/^\//, '');
const selector = createStructuredSelector({
  loggedIn: authenticatedSelector,
  user: currentUserSelector,
  repositories: repositoriesSelector,
  currentRepository: currentRepositorySelector,
  currentRepoTree: currentRepositoryTreeSelector,
  currentRepoPath: currentRepositoryPathSelector
});

class Command {
  static commands = {};
  static commandDescriptions = {};

  @command()
  static help({ log }) {
    log('&nbsp;');
    const maxCmdLength = Math.max(...Object.keys(this.commandDescriptions).map(e => e.length));
    for (let [cmd, desc] of Object.entries(this.commandDescriptions)) {
      if (cmd === 'help') continue;
      log(`${cmd.padEnd(maxCmdLength + 3).replace(/ /g, '&nbsp;')}<span class="text-secondary">${desc}</span>`);
    }
    return true;
  }

  @command('let user sign in using his/her GitHub account')
  static login({ log }) {
    const { loggedIn } = state();
    if (loggedIn) {
      log('You are already signed in.');
      return true;
    } else {
      log('Signing in...');
      setTimeout(() => window.location.assign(GITHUB_OAUTH_URL), 1000);
      return false;
    }
  }

  @command("show current user's username")
  @requiresAuth
  static whoami({ log }) {
    const { user } = state();
    log(user.login);
    return true;
  }

  @command('list repositories or repository tree')
  @requiresAuth
  static ls() {
    const { currentRepository, currentRepoPath } = state();
    if (currentRepository) {
      this.lsRepositoryTree(currentRepository, currentRepoPath);
    } else {
      this.lsRepositories();
    }
  }

  static lsRepositories() {
    dispatch(getRepositories());
  }

  static lsRepositoryTree(currentRepository, currentRepoPath) {
    dispatch(getRepositoryTree({
      repoName: currentRepository.name,
      repoTreePath: currentRepoPath
    }));
  }

  @command('get into repository or repository tree folder')
  @requiresAuth
  static cd({ args, log }) {
    if (args.length === 0) {
      return this.cdToRoot();
    } else if (args[0] === '..') {
      return this.cdUpwards();
    } else if (state().currentRepository) {
      return this.cdIntoRepositoryTree(args[0], log);
    } else {
      return this.cdIntoRepository(args[0], log);
    }
  }

  static cdToRoot() {
    dispatch(setCurrentRepository(null));
    return true;
  }

  static cdUpwards() {
    const { currentRepository, currentRepoPath } = state();
    if (currentRepoPath !== '') {
      const pathItems = currentRepoPath.split('/');
      pathItems.pop();
      dispatch(setCurrentRepositoryPath(pathItems.join('/')));
    } else if (currentRepository) {
      this.cdToRoot();
    }
    return true;
  }

  static cdIntoRepository(name, log) {
    const { repositories } = state();
    const repository = repositories.find(repo => repo.name === name);
    if (repository) {
      dispatch(setCurrentRepository(repository));
    } else {
      log(`cd: no such repository: ${name}`);
    }
    return true;
  }

  static cdIntoRepositoryTree(folderName, log) {
    const { currentRepoTree, currentRepoPath } = state();
    const folder = currentRepoTree.find(e => e.name === folderName && e.type === 'tree');
    if (folder) {
      dispatch(setCurrentRepositoryPath(joinPath(currentRepoPath, folder.name)));
    } else {
      log(`cd: no such directory: ${folderName}`);
    }
    return true;
  }

  @command('print current working directory')
  @requiresAuth
  static pwd({ log }) {
    const { currentRepository, currentRepoPath } = state();
    const pathItems = [];
    if (currentRepository) pathItems.push(currentRepository.name);
    if (currentRepoPath !== '') pathItems.push(currentRepoPath);
    log(`/${pathItems.join('/')}`);
    return true;
  }

  @command('prepare a new CIC file with specified image and open a modal', 'new')
  @requiresAuth
  static newFile({ args, log }) {
    const { currentRepository, currentRepoPath } = state();
    if (args.length === 0) {
      log('usage:');
      log('new &lt;filename&gt;');
    } else if (currentRepository === null) {
      log('new: you are currently not inside a repository');
    } else if (this.fileExists(args[0])) {
      log(`new: file already exists: ${args[0]}`);
    } else {
      this.promptToCreateMasterKey(joinPath(currentRepoPath, args[0]), log);
      return false;
    }
    return true;
  }

  static fileExists(fileName) {
    const { currentRepoTree } = state();
    return currentRepoTree.find(e => e.name === fileName);
  }

  static promptToCreateMasterKey(filePath, log) {
    dispatch(setTerminalValuePromptMode({
      passwordMode: true,
      promptLabel: 'Set master password:&nbsp;',
      onConfirm: masterKey => {
        dispatch(setTerminalValuePromptMode({
          passwordMode: true,
          promptLabel: 'Enter same master password again:&nbsp;',
          onConfirm: masterKeyConfirmation => {
            if (masterKey === masterKeyConfirmation) {
              dispatch(setMasterKey(masterKey));
              dispatch(setTerminalBusy(false));
              this.openNewImageFileDialog(filePath, log);
            } else {
              log('Master passwords do not match. Try again.');
              this.promptToCreateMasterKey(filePath, log);
            }
          }
        }));
      }
    }));
  }

  static openNewImageFileDialog(filePath, log) {
    const fileInput = document.createElement('input');
    log('Please choose an image file');
    log('&nbsp;');
    fileInput.type = 'file';
    fileInput.accept = '.jpg,.jpeg,.png';
    fileInput.onchange = () => {
      if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageBlob = atob(reader.result.split(',')[1]);
          log('Image file read');
          log('Entering edit/view mode...');
          dispatch(openModal({
            imageBlob,
            filePath,
            fileShaValue: null,
            mode: 'create'
          }));
        };
        dispatch(setTerminalBusy(true));
        log('Reading image file...');
        reader.readAsDataURL(fileInput.files[0]);
      }
    };
    fileInput.click();
  }

  @command('open an existing CIC file')
  @requiresAuth
  static open({ args, log }) {
    const { currentRepository, currentRepoTree, currentRepoPath } = state();
    if (args.length === 0) {
      log('usage:');
      log('open &lt;filename&gt;');
    } else if (currentRepository === null) {
      log('open: you are currently not inside a repository');
    } else if (currentRepoTree.find(e => e.name === args[0] && e.type !== 'tree')) {
      dispatch(setTerminalValuePromptMode({
        passwordMode: true,
        promptLabel: 'Enter master password:&nbsp;',
        onConfirm: masterKey => {
          dispatch(setMasterKey(masterKey));
          dispatch(getFileContent({
            masterKey,
            repoResourcePath: currentRepository.resourcePath,
            filePath: joinPath(currentRepoPath, args[0])
          }));
        }
      }));
      return false;
    } else {
      log(`open: no such file: ${args[0]}`);
    }
    return true;
  }

  @command('let user sign out')
  @requiresAuth
  static logout() {
    dispatch(setOauthToken(null));
    dispatch(setCurrentUser(null));
    dispatch(setRepositories([]));
    dispatch(setCurrentRepository(null));
    dispatch(setRepositoryTree([]));
    dispatch(setCurrentRepositoryPath(''));
    return true;
  }
}

export default Command.commands;
