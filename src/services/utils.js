import requestify from 'requestify';
import sjcl from 'sjcl';
import { setTerminalBusy, spitToTerminal as log } from 'services/terminal';
import { setModalUiEnabled } from 'services/modal';

const { REACT_APP_API_BASE_URI, REACT_APP_SEPARATOR_WORD } = process.env;
const { atob, btoa } = window;

export function withCommonErrorHandling(
  processFunc,
  errHandlers = {},
  { callSetTerminalBusy = true } = {}
) {
  return async (depObj, dispatch, done) => {
    try {
      dispatch(setModalUiEnabled(false));
      await processFunc(depObj, dispatch);
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        if (errHandlers[err.statusCode]) {
          errHandlers[err.statusCode](dispatch, err);
        } else {
          dispatch(log(err.message));
        }
      } else if (typeof err.getBody === 'function') {
        dispatch(log(`Error: ${JSON.stringify(err.getBody())}`));
      } else {
        dispatch(log(`Error: ${err.message}`));
      }
    } finally {
      dispatch(setModalUiEnabled(true));
      if (callSetTerminalBusy) {
        dispatch(log('&nbsp;'));
        dispatch(setTerminalBusy(false));
      }
      done();
    }
  }
};

export function generateFileContent(imageBlob, cicData, masterKey) {
  const encryptedData = sjcl.encrypt(masterKey, btoa(JSON.stringify(cicData)));
  return btoa(`${imageBlob}${REACT_APP_SEPARATOR_WORD}${btoa(encryptedData)}`);
};

export function parseFileContent(content, masterKey) {
  let cicData;
  const [imageBlob, encryptedData] = atob(content).split(REACT_APP_SEPARATOR_WORD);

  if (encryptedData) {
    try {
      cicData = JSON.parse(atob(sjcl.decrypt(masterKey, atob(encryptedData))));
    } catch (err) {
      cicData = null;
    }
  } else {
    cicData = null;
  }
  
  return [imageBlob, cicData];
};

export function filteredCicData(haystack, needle) {
  if (needle === '') {
    return haystack;
  }

  const result = {};
  const includesNeedle = e => e.includes(needle);

  for (let category in haystack) {
    result[category] = haystack[category].filter(row => {
      return [...row.slice(0, 2), ...row.slice(3)].some(includesNeedle)
    });
    if (result[category].length === 0) {
      delete result[category];
    }
  }

  return result;
};

export async function getLatestAppVersion() {
  const response = await requestify.get(`${REACT_APP_API_BASE_URI}/latest-version`);
  return response.getBody();
}
