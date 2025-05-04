/* global module */

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  coverageDirectory: '__coverage__',
  rootDir: '../..',
  setupFilesAfterEnv: [
    '<rootDir>/config/jest/setup.ts',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testMatch: ['**/__tests__/**/*.{js,jsx,mjs,ts,tsx}'],
  testPathIgnorePatterns: [
    '/__assets__/',
    '/node_modules/',
  ],
  transform: {
    '\\.(m?(j|t)sx?)$': 'babel-jest',
  },
};
