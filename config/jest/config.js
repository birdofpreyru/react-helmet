module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,mjs,ts,tsx}',
  ],
  coverageDirectory: '__coverage__',
  rootDir: '../..',
  testMatch: ['**/__tests__/**/*.{js,jsx,mjs,ts,tsx}'],
  testPathIgnorePatterns: [
    '/__assets__/',
    '/node_modules/',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  transform: {
    '\\.(m?(j|t)sx?)$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/config/jest/setup.ts',
  ],
};
