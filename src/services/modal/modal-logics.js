import { createLogic } from 'redux-logic';
import { createStructuredSelector } from 'reselect';
import { logFunction, withCommonErrorHandling } from 'utils';
import GitHubApiClient from 'utils/github-api-client';
import { parseFileContent } from 'utils/cic-contents';
import { authTokenSelector } from 'services/auth';
import { setTerminalBusy } from 'services/terminal';
import {
  currentRepositorySelector,
  currentRepositoryRefShaSelector,
  currentRepositoryRefBaseTreeShaSelector,
  setCurrentRepositoryRefSha,
  setCurrentRepositoryRefBaseTreeSha
} from 'services/repo';
import {
  SAVE_FILE,
  GET_FILE_CONTENT,
  CLOSE_MODAL,
  openModal,
  closeModal,
  setCicData
} from './modal';

const { REACT_APP_CIC_FILE_PATH: CIC_FILE_PATH } = process.env;

const selector = createStructuredSelector({
  authToken: authTokenSelector,
  currentRepository: currentRepositorySelector,
  parentCommitSHA: currentRepositoryRefShaSelector,
  baseTreeSHA: currentRepositoryRefBaseTreeShaSelector
});

const fileSaveLogic = createLogic({
  type: SAVE_FILE,
  process: withCommonErrorHandling(
    async ({ getState, action: { payload } }, dispatch) => {
      const log = logFunction(dispatch);
      const stateValues = selector(getState());
      const client = new GitHubApiClient(stateValues.authToken);
      const { currentRepository: { resourcePath } } = stateValues;
      const { parentCommitSHA, baseTreeSHA } = stateValues;
      const { content, message } = payload;
      let response;
      log('Saving...');

      response = await client.createBlob(resourcePath, {
        content,
        encoding: 'base64'
      });
      const blobSHA = response.getBody().sha;

      response = await client.createTreeObject(resourcePath, {
        tree: [
          {
            path: CIC_FILE_PATH,
            mode: '100644',
            type: 'blob',
            sha: blobSHA
          }
        ],
        ...(baseTreeSHA ? { base_tree: baseTreeSHA } : {})
      });
      const treeSHA = response.getBody().sha;

      response = await client.createCommit(resourcePath, {
        message,
        tree: treeSHA,
        ...(parentCommitSHA ? { parents: [parentCommitSHA] } : {})
      });
      const commitSHA = response.getBody().sha;

      const funcName = parentCommitSHA ? 'updateReference' : 'createReference';
      response = await client[funcName](resourcePath, commitSHA);
      dispatch(setCurrentRepositoryRefSha(commitSHA));
      dispatch(setCurrentRepositoryRefBaseTreeSha(treeSHA));

      log('File saved');
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
      const stateValues = selector(getState());
      const client = new GitHubApiClient(authTokenSelector(getState()));
      const { currentRepository: { resourcePath }, baseTreeSHA } = stateValues;
      const { masterKey } = payload;
      let response;

      if (baseTreeSHA === null) {
        log('open: not a valid CIC repository');
        log('&nbsp;');
        dispatch(setTerminalBusy(false));
        return false;
      }

      log('Pulling file...');
      response = await client.getTreeObject(resourcePath, baseTreeSHA);
      const tree = response.getBody().tree.find(e => e.path === CIC_FILE_PATH);
      response = await client.getBlob(resourcePath, tree.sha);
      const { content } = response.getBody();
      const [imageBlob, cicData] = parseFileContent(content, masterKey);

      if (cicData) {
        dispatch(setCicData(cicData));
        log('Entering edit/view mode...');
        dispatch(openModal({ imageBlob }));
      } else {
        log('open: not a valid CIC file or incorrect master key');
        log('&nbsp;');
        dispatch(setTerminalBusy(false));
      }
      return true;
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

export default [fileSaveLogic, fileReadLogic, modalCloseLogic];
