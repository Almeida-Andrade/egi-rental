import { defineConfig, devices } from '@playwright/test'

const PORTA = 3008

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORTA}` },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
