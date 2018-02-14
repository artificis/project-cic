import requestify from 'requestify';

const { REACT_APP_API_BASE_URI: API_BASE_URI } = process.env;

export async function getLatestAppVersion() {
  const response = await requestify.get(`${API_BASE_URI}/latest-version`);
  return response.getBody();
}
