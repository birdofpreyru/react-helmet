/* eslint-disable import/no-extraneous-dependencies */

import { defineConfig } from 'eslint/config';

import eslintConfigs from '@dr.pogodin/eslint-configs';

export default defineConfig([
  { ignores: ['build/'] },
  eslintConfigs.configs.javascript,
  eslintConfigs.configs.typescript,
  eslintConfigs.configs.react,
  {
    extends: [eslintConfigs.configs.jest],
    files: ['__tests__/**'],
  },
  {
    files: ['config/jest/**', 'jest/**'],
    rules: {
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: true,
      }],
    },
  },
]);
