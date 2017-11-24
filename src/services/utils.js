import getGitLabApiClient from 'node-gitlab-api';
export const gitlabApiClient = oauthToken => getGitLabApiClient({ oauthToken });
