import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector } from 'services/auth';

const selector = createStructuredSelector({
  loggedIn: authenticatedSelector
});

function login(argString, log) {
  const { loggedIn } = selector(store.getState());
  if (loggedIn) {
    log('You are already signed in.');
    return true;
  } else {
    log('Signing in...');
    setTimeout(() => window.location.assign(GITLAB_OAUTH_URL), 1000);
    return false;
  }
}

function whoami(argString, log) {
  log('COMING SOON..');
  return true;
}

export {
  login,
  whoami
};
