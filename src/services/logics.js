import getGitLabApiClient from 'node-gitlab-api';
import { logics as authLogics } from './auth';

export const gitlabApiClient = oauthToken => getGitLabApiClient({ oauthToken });

export default [
  ...authLogics
];
