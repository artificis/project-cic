'use strict';

const path = require('path');

module.exports = (config, env) => {
  config.resolve.modules.push(path.resolve('./src'));

  const moduleRulesOneOfArrayLength = config.module.rules[1].oneOf.length;
  config.module.rules[1].oneOf[moduleRulesOneOfArrayLength - 1].exclude.push(/\.scss$/);
  config.module.rules[1].oneOf.push({
    test: /\.scss$/,
    use: [
      { loader: require.resolve('style-loader') },
      { loader: require.resolve('css-loader') },
      { loader: require.resolve('sass-loader') }
    ]
  });

  config.module.rules[1].oneOf[1].options.plugins = ['transform-decorators-legacy'];
  
  return config;
};
