import { GITLAB_OAUTH_URL } from 'services/auth';

async function login(argString, log) {
  log('Signing in...');
  setTimeout(() => window.location.assign(GITLAB_OAUTH_URL), 1000);
  return false;
}

export {
  login
};
