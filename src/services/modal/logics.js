import { createLogic } from 'redux-logic';
import { withCommonErrorHandling, gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import { CREATE_FILE, UPDATE_FILE } from 'services/modal';
import { spitToTerminal as log } from 'services/terminal';
import { setModalMode } from 'services/modal';

const newFileLogic = createLogic({
  type: CREATE_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Creating a new file...'));
    const { projectId, filePath, branch, options } = payload;
    await api.projects.repository.createFile(projectId, filePath, branch, options);
    dispatch(log('New file created.'));
    dispatch(setModalMode('update'));
  }, {}, {
    callSetTerminalBusy: false
  })
});

const fileUpdateLogic = createLogic({
  type: UPDATE_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Updating file...'));
    const { projectId, filePath, branch, options } = payload;
    await api.projects.repository.updateFile(projectId, filePath, branch, options);
    dispatch(log('File updated.'));
  }, {}, {
    callSetTerminalBusy: false
  })
});

export default [
  newFileLogic,
  fileUpdateLogic
];
