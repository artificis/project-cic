import { logics as authLogics } from './auth';
import { logics as repoLogics } from './repo';

export default [
  ...authLogics,
  ...repoLogics
];
