'use strict';

const path = require('path');

module.exports = (config, env) => {
  const c = { ...config };
  const postcssLoaderOptions = {
    config: {
      path: path.resolve('./.postcssrc')
    }
  };

  c.resolve.modules.push(path.resolve('./src'));
  c.module.rules[0].use[0].options.useEslintrc = true;
  delete c.module.rules[1].oneOf[1].options.babelrc;
  delete c.module.rules[1].oneOf[1].options.presets;

  if (env === 'production') {
    c.module.rules[1].oneOf[2].loader[3].options = postcssLoaderOptions;
  } else {
    c.module.rules[1].oneOf[2].use[2].options = postcssLoaderOptions;
  }
  
  return c;
};
