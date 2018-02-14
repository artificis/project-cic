import requestify from 'requestify';

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const API_V3_ROOT_ENDPOINT = 'https://api.github.com';
const {
  REACT_APP_GITHUB_CLIENT_ID: GITHUB_CLIENT_ID,
  REACT_APP_GIT_REFERENCE: GIT_REFERENCE
} = process.env;

function limitFieldsTo(...fields) {
  return node =>
    fields.reduce((a, field) => ({ ...a, [field]: node[field] }), {});
}

export const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;

export default class GitHubApiClient {
  constructor(token) {
    this.reqOptions = {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`
      }
    };
  }

  async requestGraphQlQuery(query, variables = {}) {
    const response = await requestify.post(
      GRAPHQL_ENDPOINT,
      { query, variables },
      this.reqOptions
    );
    return response.getBody().data;
  }

  requestApiV3(method, relativeUri, body = {}) {
    return requestify.request([API_V3_ROOT_ENDPOINT, relativeUri].join(''), {
      ...this.reqOptions,
      method,
      body
    });
  }

  async currentUser() {
    const data = await this.requestGraphQlQuery(`{
      viewer {
        login
      }
    }`);
    return data.viewer;
  }

  async repositories() {
    let login;
    let nodes;
    let hasNextPage;
    let endCursor = null;
    const allNodes = [];
    const ownedByMeAndNotPrivate = node =>
      !node.isPrivate && node.owner.login === login;

    /* eslint-disable no-await-in-loop */
    do {
      const data = await this.requestGraphQlQuery(
        `query ($endCursor: String) {
          viewer {
            login
            repositories(isFork: false, first: 50, orderBy: { field: NAME, direction: ASC }, after: $endCursor) {
              nodes {
                name
                resourcePath
                isPrivate
                owner {
                  login
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }`,
        { endCursor }
      );
      ({
        login,
        repositories: { nodes, pageInfo: { endCursor, hasNextPage } }
      } = data.viewer);
      allNodes.push(
        ...nodes
          .filter(ownedByMeAndNotPrivate)
          .map(limitFieldsTo('name', 'resourcePath'))
      );
    } while (hasNextPage);
    /* eslint-enable */

    return allNodes;
  }

  async treeEntries(repoName, repoTreePath) {
    const data = await this.requestGraphQlQuery(
      `query ($repoName: String!, $revExpression: String!) {
        viewer {
          repository(name: $repoName) {
            object(expression: $revExpression) {
              ... on Tree {
                entries {
                  name
                  type
                }
              }
            }
          }
        }
      }`,
      { repoName, revExpression: `master:${repoTreePath}` }
    );
    const { object } = data.viewer.repository;
    return object && object.entries ? object.entries : [];
  }

  getReferences(repoResourcePath) {
    return this.requestApiV3('GET', `/repos${repoResourcePath}/git/refs`);
  }

  getCommit(repoResourcePath, sha) {
    return this.requestApiV3(
      'GET',
      `/repos${repoResourcePath}/git/commits/${sha}`
    );
  }

  getTreeObject(repoResourcePath, sha) {
    return this.requestApiV3(
      'GET',
      `/repos${repoResourcePath}/git/trees/${sha}`
    );
  }

  getBlob(repoResourcePath, sha) {
    return this.requestApiV3(
      'GET',
      `/repos${repoResourcePath}/git/blobs/${sha}`
    );
  }

  createBlob(repoResourcePath, options) {
    return this.requestApiV3(
      'POST',
      `/repos${repoResourcePath}/git/blobs`,
      options
    );
  }

  createTreeObject(repoResourcePath, options) {
    return this.requestApiV3(
      'POST',
      `/repos${repoResourcePath}/git/trees`,
      options
    );
  }

  createCommit(repoResourcePath, options) {
    return this.requestApiV3(
      'POST',
      `/repos${repoResourcePath}/git/commits`,
      options
    );
  }

  createReference(repoResourcePath, sha) {
    return this.requestApiV3('POST', `/repos${repoResourcePath}/git/refs`, {
      sha,
      ref: GIT_REFERENCE
    });
  }

  updateReference(repoResourcePath, sha) {
    return this.requestApiV3(
      'PATCH',
      `/repos${repoResourcePath}/git/${GIT_REFERENCE}`,
      { sha }
    );
  }
}
