import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 45_000,
    expect: { timeout: 8_000 },
    fullyParallel: false,
    workers: 1,
    reporter: [['list'], ['html', { outputFolder: '.local/playwright/report', open: 'never' }]],
    outputDir: '.local/playwright/results',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        viewport: { width: 1440, height: 900 },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'off'
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
    ],
    webServer: {
        command: 'npm run dev -- --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173/jogo/',
        reuseExistingServer: false,
        timeout: 120_000
    }
});
