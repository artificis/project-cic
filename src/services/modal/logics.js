import { createLogic } from 'redux-logic';
import GitHubApiClient from 'services/GitHubApiClient';
import { withCommonErrorHandling, gitlabApiClient } from 'services/utils';
import { authTokenSelector } from 'services/auth';
import { CREATE_FILE, UPDATE_FILE, GET_FILE_CONTENT, CLOSE_MODAL } from 'services/modal';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { openModal, closeModal, setModalMode, setCicData } from 'services/modal';

const newFileLogic = createLogic({
  type: CREATE_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Creating a new file...'));
    const { closeModalAfterSave, repoResourcePath, filePath, options } = payload;

    await client.createFile(repoResourcePath, filePath, options);
    dispatch(log('New file created'));
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
  type: GET_FILE_CONTENT,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Pulling file...'));
    const { repoResourcePath, filePath } = payload;
    const body = (await client.getFileContent(repoResourcePath, filePath)).getBody();
    let [imageBlob, cicData] = atob(body.content).split(process.env.REACT_APP_SEPARATOR_WORD);

    if (cicData) {
      dispatch(setCicData(JSON.parse(atob(cicData))));
      dispatch(log('Entering edit/view mode...'));
      dispatch(openModal({ imageBlob, filePath, mode: 'update' }));
    } else {
      dispatch(log(`open: not a valid CIC file: ${body.name}`));
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
