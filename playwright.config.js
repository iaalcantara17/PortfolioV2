import { defineConfig, devices } from '@playwright/test'

// Smoke tests (e2e/): fast checks of the critical paths, run against a production
// build served by `vite preview`, in Chromium, Firefox and WebKit, each in the light
// and dark themes. `npm test` runs them all; the README has the rest.
const PORT = 4173
// 1440 wide: the desktop layout, where the nav shows its links (below 1024px it
// shows the mobile menu's toggle instead)
const viewport = { width: 1440, height: 900 }
// Every browser runs the suite twice: with the system set to light, and to dark
const browsers = [
  ['chromium', 'Desktop Chrome'],
  ['firefox', 'Desktop Firefox'],
  ['webkit', 'Desktop Safari'],
]

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    ...browsers.map(([name, device]) => ({ name, use: { ...devices[device], viewport } })),
    ...browsers.map(([name, device]) => ({
      name: `${name}-dark`,
      use: { ...devices[device], viewport, colorScheme: 'dark' },
    })),
  ],
  // A fresh build every run. Never an already-running server: a preview left over
  // from earlier would be testing old code.
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
