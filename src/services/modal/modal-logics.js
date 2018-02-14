import { createLogic } from 'redux-logic';
import { logFunction, withCommonErrorHandling } from 'utils';
import GitHubApiClient from 'utils/github-api-client';
import { parseFileContent } from 'utils/cic-contents';
import { authTokenSelector } from 'services/auth';
import { setTerminalBusy } from 'services/terminal';
import {
  CREATE_FILE,
  UPDATE_FILE,
  GET_FILE_CONTENT,
  CLOSE_MODAL,
  openModal,
  closeModal,
  setModalMode,
  setCicData,
  setFileShaValue
} from './modal';

const newFileLogic = createLogic({
  type: CREATE_FILE,
  process: withCommonErrorHandling(
    async ({ getState, action: { payload } }, dispatch) => {
      const log = logFunction(dispatch);
      const client = new GitHubApiClient(authTokenSelector(getState()));
      log('Creating a new file...');
      const { repoResourcePath, filePath, options } = payload;
      const res = await client.createFile(repoResourcePath, filePath, options);
      const body = res.getBody();

      log('New file created');
      dispatch(setModalMode('update'));
      dispatch(setFileShaValue(body.content.sha));
      if (payload.closeModalAfterSave) {
        dispatch(closeModal());
      }
    },
    { callSetTerminalBusy: false }
  )
});

const fileUpdateLogic = createLogic({
  type: UPDATE_FILE,
  process: withCommonErrorHandling(
    async ({ getState, action: { payload } }, dispatch) => {
      const log = logFunction(dispatch);
      const client = new GitHubApiClient(authTokenSelector(getState()));
      log('Updating file...');
      const { repoResourcePath, filePath, options } = payload;
      const res = await client.updateFile(repoResourcePath, filePath, options);
      const body = res.getBody();

      log('File updated');
      dispatch(setFileShaValue(body.content.sha));
      if (payload.closeModalAfterSave) {
        dispatch(closeModal());
      }
    },
    { callSetTerminalBusy: false }
  )
});

const fileReadLogic = createLogic({
  type: GET_FILE_CONTENT,
  process: withCommonErrorHandling(
    async ({ getState, action: { payload } }, dispatch) => {
      const log = logFunction(dispatch);
      const client = new GitHubApiClient(authTokenSelector(getState()));
      log('Pulling file...');
      const { repoResourcePath, filePath, masterKey } = payload;
      const res = await client.getFileContent(repoResourcePath, filePath);
      const body = res.getBody();
      const [imageBlob, cicData] = parseFileContent(body.content, masterKey);

      if (cicData) {
        dispatch(setCicData(cicData));
        log('Entering edit/view mode...');
        dispatch(
          openModal({
            imageBlob,
            filePath,
            fileShaValue: body.sha,
            mode: 'update'
          })
        );
      } else {
        log(`open: not a valid CIC file or incorrect master key: ${body.name}`);
        log('&nbsp;');
        dispatch(setTerminalBusy(false));
      }
    },
    { callSetTerminalBusy: false }
  )
});

const modalCloseLogic = createLogic({
  type: CLOSE_MODAL,
  process: (depObj, dispatch, done) => {
    const log = logFunction(dispatch);
    log('Exiting from edit/view mode...');
    log('&nbsp;');
    dispatch(setTerminalBusy(false));
    done();
  }
});

export default [newFileLogic, fileUpdateLogic, fileReadLogic, modalCloseLogic];
