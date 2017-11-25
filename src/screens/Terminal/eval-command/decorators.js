import { createStructuredSelector } from 'reselect';
import store from 'store';
import { authenticatedSelector } from 'services/auth';

const selector = createStructuredSelector({
  loggedIn: authenticatedSelector
});

export function requiresAuth(target, key, descriptor) {
  const method = descriptor.value;
  descriptor.value = function(options) {
    const { loggedIn } = selector(store.getState());
    if (loggedIn) {
      return method.apply(this, [options]);
    } else {
      options.log('You are not signed in.');
      return true;
    }
  };
  return descriptor;
}
