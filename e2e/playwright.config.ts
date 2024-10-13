import { defineConfig, devices } from '@playwright/test';

import dotenv from '@dotenvx/dotenvx';
import path from 'path';
dotenv.config({
  path: [
    // Order is important
    path.resolve(__dirname, '../apps/backend/.env.test.local'),
    path.resolve(__dirname, '../apps/backend/.env.test'),
    path.resolve(__dirname, '../apps/backend/.env'),
    path.resolve(__dirname, '.env'),
  ],
});

// Use ports different from developing to prevent collision
const WEB_PORT = 4001;
const API_PORT = 4000;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: [],
  timeout: 1000 * 60 * 0.25,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${WEB_PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // trace: 'retain-on-failure',
    trace: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      teardown: 'cleanup db',
      testMatch: /global\.setup\.ts/, // exclude ordinary tests
    },
    {
      name: 'cleanup db',
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: `pnpm -F web dev --port ${WEB_PORT} --mode e2e`,
      port: WEB_PORT,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      timeout: 1000 * 15,
    },
    {
      command: `dotenvx run --overload --env PORT=${API_PORT} -- pnpm -F backend dev:no-env`,
      port: API_PORT,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
    },
  ],
});
