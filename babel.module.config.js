/* global module */

module.exports = {
  plugins: [
    '@babel/transform-runtime',
  ],
  presets: [
    ['@babel/env', {
      modules: false,
      targets: 'defaults',
    }],
    ['@babel/react', { runtime: 'automatic' }],
    '@babel/typescript',
  ],
};
