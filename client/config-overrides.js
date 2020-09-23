/*jshint esversion: 6 */

const Dotenv = require('dotenv-webpack');
console.log('APPEND WEBPACK');
 
module.exports = function overrides(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(new Dotenv());

  return config;
};
