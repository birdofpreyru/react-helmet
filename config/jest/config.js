const path = require('path');

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],
  coverageDirectory: '__coverage__',
  rootDir: '../..',
  testMatch: ['**/__tests__/**/*.(j|t)s?(x)'],
  testPathIgnorePatterns: [
    '/__assets__/',
    '/node_modules/',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  transform: {
    '\\.((j|t)sx?)$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/config/jest/setup.js',
  ],
};