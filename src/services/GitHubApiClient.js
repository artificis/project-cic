import requestify from 'requestify';

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const limitFieldsTo = function(...fields) {
  return node => fields.reduce((a, field) => ({ ...a, [field]: node[field] }), {});
};

export default class GitHubApiClient {
  constructor(token) {
    this.reqOptions = {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`
      }
    };
  }

  async requestGraphQlQuery(query, variables = {}) {
    const response = await requestify.post(GRAPHQL_ENDPOINT, { query, variables }, this.reqOptions);
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

  async repositories() {
    let allNodes = [];
    let login;
    let nodes;
    let hasNextPage;
    let endCursor = null;
    const ownedByMeAndNotPrivate = node => !node.isPrivate && node.owner.login === login;

    do {
      const data = await this.requestGraphQlQuery(`
        query ($endCursor: String) {
          viewer {
            login
            repositories(isFork: false, first: 50, orderBy: { field: NAME, direction: ASC }, after: $endCursor) {
              nodes {
                name
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
        }
      `, { endCursor });
      ({ login, repositories: { nodes, pageInfo: { endCursor, hasNextPage } } } = data.viewer);
      allNodes.push(...nodes.filter(ownedByMeAndNotPrivate).map(limitFieldsTo('name')));
    } while (hasNextPage);

    return allNodes;
  }

  async treeEntries(repoName, repoTreePath) {
    const data = await this.requestGraphQlQuery(`
      query ($repoName: String!, $revExpression: String!) {
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
      }
    `, {
      repoName,
      revExpression: `master:${repoTreePath}`
    });
    const { object } = data.viewer.repository;
    return object && object.entries ? object.entries : [];
  }
}
