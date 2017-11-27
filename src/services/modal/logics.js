import { createLogic } from 'redux-logic';
import { withCommonErrorHandling, gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import { CREATE_FILE, UPDATE_FILE, CLOSE_MODAL } from 'services/modal';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { setModalMode, closeModal } from 'services/modal';

const newFileLogic = createLogic({
  type: CREATE_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Creating a new file...'));
    const { closeModalAfterSave, projectId, filePath, branch, options } = payload;
    await api.projects.repository.createFile(projectId, filePath, branch, options);
    dispatch(log('New file created.'));
    dispatch(setModalMode('update'));
    if (closeModalAfterSave) {
      dispatch(closeModal());
    }
  }, {}, {
    callSetTerminalBusy: false
  })
});

const fileUpdateLogic = createLogic({
  type: UPDATE_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Updating file...'));
    const { closeModalAfterSave, projectId, filePath, branch, options } = payload;
    await api.projects.repository.updateFile(projectId, filePath, branch, options);
    dispatch(log('File updated.'));
    if (closeModalAfterSave) {
      dispatch(closeModal());
    }
  }, {}, {
    callSetTerminalBusy: false
  })
});

const modalCloseLogic = createLogic({
  type: CLOSE_MODAL,
  process: (depObj, dispatch, done) => {
    dispatch(log('Exiting from edit/view mode...'));
    dispatch(log('&nbsp;'));
    dispatch(setTerminalBusy(false));
    done();
  }
});

export default [
  newFileLogic,
  fileUpdateLogic,
  modalCloseLogic
];
