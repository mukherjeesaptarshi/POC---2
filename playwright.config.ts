import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
// import path from 'path';
dotenv.config();
const reportRunId = (process.env.REPORT_RUN_ID || `${Date.now()}-${process.pid}`)
  .replace(/[^a-zA-Z0-9_-]/g, '-');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retried tests still fail CI so flaky behavior remains visible. */
  failOnFlakyTests: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* The public demo has shared state and rate limits; serialize its UI tests. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['json', { outputFile: `reports/playwright-${reportRunId}.json` }],
        ['blob'],
        ['html', { open: 'never' }],
        ['allure-playwright'],
      ]
    : [
        ['json', { outputFile: `reports/playwright-${reportRunId}.json` }],
        ['html', { open: 'never' }],
        ['allure-playwright'],
      ],
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: process.env.WEB_BASE_URL || process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank',
  },

  /* Configure projects for major browsers */
  projects: [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
    },
  },

  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
    },
  },
],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
