import { defineConfig, devices } from '@playwright/test'

// Authenticated E2E reports must not capture browser state, customer data,
// access tokens or screenshots. Only high-level results are logged by Actions.
export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: { timeout: 12000 },
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://find4sport.vercel.app',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
})
