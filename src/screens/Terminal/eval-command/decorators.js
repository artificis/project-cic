import { createStructuredSelector } from 'reselect';
import store from 'store';
import { authenticatedSelector } from 'services/auth';

const selector = createStructuredSelector({
  loggedIn: authenticatedSelector
});

/* eslint-disable func-names, no-param-reassign */
export function command(description, commandName = null) {
  return function(target, key, descriptor) {
    target.commands[commandName || key] = descriptor.value.bind(target);
    target.commandDescriptions[commandName || key] = description;
    return descriptor;
  };
}

export function requiresAuth(target, key, descriptor) {
  const method = descriptor.value;
  descriptor.value = function(options) {
    const { loggedIn } = selector(store.getState());
    if (loggedIn) {
      return method.apply(this, [options]);
    }
    options.log('You are not signed in.');
    return true;
  };
  return descriptor;
}
/* eslint-enable */
