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
};

export default config;
