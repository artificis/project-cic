import requestify from 'requestify';
import appInfo from 'services/../../package.json'; // eslint-disable-line

const { REACT_APP_API_BASE_URI: API_BASE_URI } = process.env;

export const appVersion = appInfo.version;

export async function getLatestAppVersion() {
  const response = await requestify.get(`${API_BASE_URI}/latest-version`);
  return response.getBody();
}
