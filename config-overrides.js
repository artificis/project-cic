'use strict';

const path = require('path');

module.exports = (config, env) => {
  const c = { ...config };
  c.resolve.modules.push(path.resolve('./src'));

  const moduleRulesOneOfArrayLength = c.module.rules[1].oneOf.length;
  c.module.rules[1].oneOf[moduleRulesOneOfArrayLength - 1].exclude.push(/\.scss$/);
  c.module.rules[1].oneOf.push({
    test: /\.scss$/,
    use: [
      { loader: require.resolve('style-loader') },
      { loader: require.resolve('css-loader') },
      { loader: require.resolve('sass-loader') }
    ]
  });

  delete c.module.rules[1].oneOf[1].options.babelrc;
  delete c.module.rules[1].oneOf[1].options.presets;
  
  return c;
};
