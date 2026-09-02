import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari-viewport',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run build && npm run seed && npm run start',
    // Subdomain mode on *.site.localhost for e2e/hostRouting.spec.ts (Chromium resolves any *.localhost
    // to loopback). Plain localhost:3000 stays off-domain, so the path URLs the other suites use keep working.
    env: { SITE_DOMAIN: 'site.localhost', NEXT_DIST_DIR: '.next-e2e' },
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
