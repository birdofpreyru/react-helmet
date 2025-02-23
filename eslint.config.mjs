// TODO: Move to https://github.com/birdofpreyru/js-utils/tree/master

import babelParser from '@babel/eslint-parser';
import babelPlugin from '@babel/eslint-plugin';
import pluginJest from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default tseslint.config(
  { ignores: ['__coverage__', 'lib/'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: babelParser,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    plugins: {
      '@babel': babelPlugin,
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

  pluginJs.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

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
      '@babel/new-cap': 'error',
      '@babel/no-invalid-this': 'error',
      '@babel/no-undef': 'error',
      '@babel/no-unused-expressions': 'error',

      '@stylistic/js/object-curly-spacing': 'off',
      '@babel/object-curly-spacing': ['error', 'always'],

      '@babel/semi': 'error',
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
      '@stylistic/js/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/js/object-curly-newline': ['error', {
        consistent: true,
        minProperties: 4,
      }],

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
      'import/no-cycle': 'error',
      'import/no-extraneous-dependencies': 'error',

      'no-use-before-define': 'error',
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      }],
      'react/prop-types': 'off',
    },
  },

  {
    // TypeScript-specific configuration.
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-inferrable-types': 'off',

      // TODO: Its current implementation seems to give false positive.
      '@typescript-eslint/no-invalid-void-type': 'off',

      // NOTE: According to its documentation "@typescript-eslint/no-unused-vars"
      // requires to disable "no-unused-vars".
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/unbound-method': 'off',

    },
  },

  {
    files: ['__tests__/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    extends: [pluginJest.configs['flat/recommended']],
    rules: {
      'jest/unbound-method': 'error',
    },
  },
);
