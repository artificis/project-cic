import { createLogic } from 'redux-logic';
import { withCommonErrorHandling, gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import { CREATE_FILE, UPDATE_FILE, GET_FILE, CLOSE_MODAL } from 'services/modal';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { openModal, closeModal, setModalMode, setCicData } from 'services/modal';

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
  }, {
    400: (dispatch, err) => {
      dispatch(log(err.error.message));
    }
  }, {
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

const fileReadLogic = createLogic({
  type: GET_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const api = gitlabApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling file...'));
    const { projectId, filePath, branch } = payload;
    const res = await api.projects.repository.showFile(projectId, encodeURIComponent(filePath), branch);
    let [imageBlob, cicData] = atob(res.body.content).split(process.env.REACT_APP_SEPARATOR_WORD);

    if (cicData) {
      dispatch(setCicData(JSON.parse(atob(cicData))));
      dispatch(log('Entering edit/view mode...'));
      dispatch(openModal({ imageBlob, filePath, mode: 'update' }));
    } else {
      dispatch(log(`open: ${filePath}: Not a valid CIC file`));
      dispatch(log('&nbsp;'));
      dispatch(setTerminalBusy(false));
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
  fileReadLogic,
  modalCloseLogic
];
