import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector } from 'services/auth';

const selector = createStructuredSelector({
  loggedIn: authenticatedSelector
});

function requiresAuth(target, key, descriptor) {
  const method = descriptor.value;
  descriptor.value = function(options) {
    const { loggedIn } = selector(store.getState());
    if (loggedIn) {
      return method.apply(this, options);
    } else {
      options.log('You are not signed in.');
      return true;
    }
  };
  return descriptor;
}

class Command {
  static login({ log }) {
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

  @requiresAuth
  static whoami({ log }) {
    const { loggedIn, user } = selector(store.getState());
    log('COMING SOON: WHOAMI');
    return true;
  }
}

export default {
  login: Command.login,
  whoami: Command.whoami
};
