import { logics as authLogics } from './auth';
import { logics as repoLogics } from './repo';
import { logics as modalLogics } from './modal';

export default [
  ...authLogics,
  ...repoLogics,
  ...modalLogics
];
