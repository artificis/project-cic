import requestify from 'requestify';

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export default class GitHubApiClient {
  constructor(token) {
    this.reqOptions = {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`
      }
    };
  }

  async requestGraphQlQuery(query) {
    const response = await requestify.post(GRAPHQL_ENDPOINT, { query }, this.reqOptions);
    return response.getBody().data;
  }

  async currentUser() {
    const data = await this.requestGraphQlQuery(`{
      viewer {
        login
      }
    }`);
    return data.viewer;
  }
}
