import { setTerminalBusy, spitToTerminal } from 'services/terminal';
import { setModalUiEnabled } from 'services/modal';

export function logFunction(dispatch) {
  return contents => dispatch(spitToTerminal(contents));
}

export function withCommonErrorHandling(
  processFunc,
  { errHandlers = {}, callSetTerminalBusy = true } = {}
) {
  return async (depObj, dispatch, done) => {
    const log = logFunction(dispatch);
    try {
      dispatch(setModalUiEnabled(false));
      await processFunc(depObj, dispatch);
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        if (typeof errHandlers[err.statusCode] === 'function') {
          errHandlers[err.statusCode](dispatch, err);
        } else {
          log(err.message);
        }
      } else if (typeof err.getBody === 'function') {
        log(`Error: ${JSON.stringify(err.getBody())}`);
      } else {
        log(`Error: ${err.message}`);
      }
    } finally {
      dispatch(setModalUiEnabled(true));
      if (callSetTerminalBusy) {
        log('&nbsp;');
        dispatch(setTerminalBusy(false));
      }
      done();
    }
  };
}
