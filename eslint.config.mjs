// TODO: Move to https://github.com/birdofpreyru/js-utils/tree/master

import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['lib/'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    settings: {
      react: { version: '19' },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  // TODO: This does not work because a bug in eslint-plugin-react-hooks:
  // https://github.com/facebook/react/issues/32431
  // thus, the workaround below.
  // reactHooks.configs.recommended

  {
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },

  {
    plugins: { '@stylistic/js': stylisticJs },
    rules: {
      ...stylisticJs.configs.all.rules,
      '@stylistic/js/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/js/array-element-newline': ['error', 'consistent'],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/dot-location': ['error', 'property'],
      '@stylistic/js/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/js/function-paren-newline': ['error', 'multiline-arguments'],
      '@stylistic/js/indent': ['error', 2, {
        SwitchCase: 1,
      }],
      '@stylistic/js/multiline-comment-style': 'off',
      '@stylistic/js/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/js/no-extra-parens': ['error', 'all', {
        enforceForArrowConditionals: false,
        ignoreJSX: 'multi-line',
        nestedBinaryExpressions: false,
        returnAssign: false,
      }],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      '@stylistic/js/object-property-newline': ['error', {
        allowAllPropertiesOnSameLine: true,
      }],
      '@stylistic/js/operator-linebreak': ['error', 'before'],
      '@stylistic/js/padded-blocks': ['error', 'never'],
      '@stylistic/js/quote-props': ['error', 'as-needed'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/space-before-function-paren': ['error', {
        named: 'never',
      }],
    },
  },
];
