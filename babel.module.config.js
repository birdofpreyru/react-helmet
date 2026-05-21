/* global module */

module.exports = {
  plugins: [
    'babel-plugin-react-compiler',
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
