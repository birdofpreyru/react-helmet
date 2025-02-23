// TODO: Move to https://github.com/birdofpreyru/js-utils/tree/master

import pluginJest from 'eslint-plugin-jest';
import pluginReact from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['__coverage__', 'lib/'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    settings: {
      'import/resolver': {
        node: true,
        typescript: true,
      },
      react: { version: '19' },
    },
  },
  importPlugin.flatConfigs.recommended,
  pluginJest.configs['flat/recommended'],
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  pluginReact.configs.flat.recommended,
  stylisticJs.configs.all,

  // TODO: This does not work because a bug in eslint-plugin-react-hooks:
  // https://github.com/facebook/react/issues/32431
  // thus, the workaround below.
  // reactHooks.configs.recommended
  {
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },

  {
    rules: {
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
      '@stylistic/js/object-curly-newline': ['error', {
        consistent: true,
        minProperties: 4,
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
      '@typescript-eslint/no-inferrable-types': 'off',

      // TODO: Its current implementation seems to give false positive.
      '@typescript-eslint/no-invalid-void-type': 'off',

      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/unbound-method': 'off',
      'import/no-cycle': 'error',
      'import/no-extraneous-dependencies': 'error',
      'jest/unbound-method': 'error',
      'no-use-before-define': 'error',
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
