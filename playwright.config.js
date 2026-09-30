const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'python3 -m http.server 4173',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
});
