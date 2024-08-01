/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+.tsx?$': ['ts-jest', {}],
  },
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/setup-test-env.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/app/tests/__mocks__/styleMock.ts',
    '~/(.*)': '<rootDir>/app/$1',
    'test-utils': '<rootDir>/app/tests/test-utils.tsx',
  },
  // noStackTrace: true,
};
