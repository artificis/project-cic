import { createLogic } from 'redux-logic';
import GitHubApiClient from 'utils/github-api-client';
import { withCommonErrorHandling } from 'utils';
import { parseFileContent } from 'utils/cic-contents';
import { authTokenSelector } from 'services/auth';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { CREATE_FILE, UPDATE_FILE, GET_FILE_CONTENT, CLOSE_MODAL, openModal, closeModal, setModalMode, setCicData, setFileShaValue } from './modal';

const newFileLogic = createLogic({
  type: CREATE_FILE,
  process: withCommonErrorHandling(async ({ getState, action: { payload } }, dispatch) => {
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Creating a new file...'));
    const { closeModalAfterSave, repoResourcePath, filePath, options } = payload;
    const body = (await client.createFile(repoResourcePath, filePath, options)).getBody();

    dispatch(log('New file created'));
    dispatch(setModalMode('update'));
    dispatch(setFileShaValue(body.content.sha));

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
    const client = new GitHubApiClient(authTokenSelector(getState()));
    dispatch(log('Updating file...'));
    const { closeModalAfterSave, repoResourcePath, filePath, options } = payload;
    const body = (await client.updateFile(repoResourcePath, filePath, options)).getBody();
    
    dispatch(log('File updated'));
    dispatch(setFileShaValue(body.content.sha));

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
    const { repoResourcePath, filePath, masterKey } = payload;
    const body = (await client.getFileContent(repoResourcePath, filePath)).getBody();
    const [imageBlob, cicData] = parseFileContent(body.content, masterKey);

    if (cicData) {
      dispatch(setCicData(cicData));
      dispatch(log('Entering edit/view mode...'));
      dispatch(openModal({ imageBlob, filePath, fileShaValue: body.sha, mode: 'update' }));
    } else {
      dispatch(log(`open: not a valid CIC file or incorrect master key: ${body.name}`));
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
