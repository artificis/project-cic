import { createStructuredSelector } from 'reselect';
import store from 'store';
import { GITLAB_OAUTH_URL, authenticatedSelector, currentUserSelector } from 'services/auth';
import { requiresAuth } from './decorators';

const selector = createStructuredSelector({
  loggedIn: authenticatedSelector,
  user: currentUserSelector
});

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
    const { user } = selector(store.getState());
    log(user.username);
    return true;
  }
}

export default {
  login: Command.login,
  whoami: Command.whoami
};
