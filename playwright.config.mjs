import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    channel: 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run serve:prod',
    url: 'http://127.0.0.1:3100/api/health',
    env: { PORT: '3100', DEMO_MODE: 'true', UNIVERSITIES_DEMO: 'true' },
    reuseExistingServer: false,
    timeout: 30000,
  },
});
