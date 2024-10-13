/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

import baseConfig from './jest.config.ts';

const config: Config = {
  ...baseConfig,
  // Include only /src/tests/
  testMatch: ['**/src/tests/**/?(*.)+(spec|test).[jt]s?(x)'],
  noStackTrace: true,
  globalSetup: './src/tests/helpers/setupDatabase.ts',
  globalTeardown: './src/tests/helpers/teardownDatabase.ts',
};

export default config;
