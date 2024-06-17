/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

import baseConfig from './jest.config.ts';

const config: Config = {
  ...baseConfig,
  // Include everything except /src/tests/
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '!**/src/tests/**',
  ],
};

export default config;
