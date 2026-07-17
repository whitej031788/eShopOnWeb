import { defineConfig, devices } from '@playwright/test';

/**
 * eShopOnWeb storefront E2E config.
 *
 * The app is expected to already be running via `docker compose up` from the
 * repo root:
 *   - Web (storefront)  -> http://localhost:5106
 *   - PublicApi (REST)  -> http://localhost:5200
 *
 * Override with BASE_URL / API_BASE_URL env vars if you run on other ports.
 */
export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:5200';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5106',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // The dev/Docker cert is self-signed; we talk to it over http anyway.
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
