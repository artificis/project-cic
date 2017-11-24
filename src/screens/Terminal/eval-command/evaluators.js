async function login(argString, log) {
  log('Logging in...');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      log('Logged in !');
      resolve();
    }, 3000);
  });
}

export {
  login
};
