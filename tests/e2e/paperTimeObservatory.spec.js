import { expect, test } from '@playwright/test';

async function ready(page) {
    await page.addInitScript(() => {
        localStorage.setItem('paperSolarExplorer:analyticsConsent', JSON.stringify({
            version: 1, choice: 'denied', updatedAt: new Date().toISOString()
        }));
    });
    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));
}

test('controls the live sky without moving game time', async ({ page }) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await ready(page);

    const toggle = page.locator('#time-observatory-toggle');
    const panel = page.locator('#time-observatory');
    await expect(toggle).toContainText('10×');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    const desktopPanelBox = await panel.boundingBox();
    const desktopToolsBox = await page.locator('.zoom-controls').boundingBox();
    expect(desktopPanelBox.x + desktopPanelBox.width + 8).toBeLessThanOrEqual(desktopToolsBox.x);

    await page.evaluate(() => window.advanceTime(0));
    const before = await page.evaluate(() => window.__paperPreview.getState().scene.orbitalClock.dateMs);
    await page.evaluate(() => window.advanceTime(1_000));
    const after = await page.evaluate(() => window.__paperPreview.getState().scene.orbitalClock.dateMs);
    expect(after - before).toBeCloseTo(10 * 24 * 60 * 60 * 1_000, -2);

    await panel.locator('[data-orbital-time-scale="0"]').click();
    const pausedAt = await page.evaluate(() => window.__paperPreview.getState().scene.orbitalClock.dateMs);
    await page.evaluate(() => window.advanceTime(1_000));
    const pausedAfter = await page.evaluate(() => window.__paperPreview.getState().scene.orbitalClock.dateMs);
    expect(pausedAfter).toBe(pausedAt);
    await expect(toggle).toContainText('Ⅱ');
    await expect(panel.locator('#time-observatory-explanation')).toHaveText('O céu está parado');

    await page.screenshot({ path: '.local/playtest/time-observatory-desktop.png' });
    expect(runtimeErrors).toEqual([]);
});

test('stays readable and touch-safe on a narrow phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);
    await page.locator('#time-observatory-toggle').click();

    const panel = page.locator('#time-observatory');
    await expect(panel).toBeVisible();
    const panelBox = await panel.boundingBox();
    const toolsBox = await page.locator('.zoom-controls').boundingBox();
    expect(panelBox.x).toBeGreaterThanOrEqual(0);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(390);
    expect(panelBox.x + panelBox.width + 8).toBeLessThanOrEqual(toolsBox.x);

    for (const button of await panel.locator('button').all()) {
        const box = await button.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
    }

    await page.locator('[data-language-toggle]').click();
    await expect(panel.locator('#time-observatory-title')).toHaveText('Time Observatory');
    await expect(panel.locator('#time-observatory-explanation')).toContainText('1 second');
    await page.screenshot({ path: '.local/playtest/time-observatory-mobile.png' });
});

test('fits below the controls in short landscape screens', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await ready(page);
    await page.locator('#time-observatory-toggle').click();

    const panel = page.locator('#time-observatory');
    const box = await panel.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(50);
    expect(box.x + box.width).toBeLessThanOrEqual(844);
    expect(box.y + box.height).toBeLessThanOrEqual(390);
    await page.screenshot({ path: '.local/playtest/time-observatory-landscape.png' });
});
