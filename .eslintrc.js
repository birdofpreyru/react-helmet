/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    '@remix-run/eslint-config/jest-testing-library'
  ],
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
      },
    ],
    'testing-library/render-result-naming-convention': 'off',
  },
  settings: {
    jest: {
      version: 27,
    },
  },
};
