import { expect, test } from '@playwright/test';

async function ready(page) {
    await page.addInitScript(() => {
        localStorage.setItem('paperSolarExplorer:analyticsConsent', JSON.stringify({
            version: 1, choice: 'denied', updatedAt: new Date().toISOString()
        }));
        localStorage.removeItem('paperSolarExplorer:progress:v1');
    });
    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));
}

test('observes, photographs and archives a living-sky phenomenon', async ({ page }) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await ready(page);

    await page.locator('#living-sky-trigger').click();
    const observatory = page.locator('#living-sky-observatory');
    await expect(observatory).toBeVisible();
    await expect(observatory.locator('.living-sky-card')).toHaveCount(4);
    await expect(observatory.locator('.living-sky-card img').first()).toHaveJSProperty('complete', true);

    await observatory.locator('[data-living-sky-observe="earth-aurora"]').click();
    const camera = page.locator('#explorer-camera');
    await expect(camera).toBeVisible();
    const clock = await page.evaluate(() => window.__paperPreview.getState().scene.orbitalClock);
    expect(clock.timeScale).toBe(1);
    const sky = await page.evaluate(() => window.__paperPreview.getState().livingSky);
    expect(sky.cameraOpen).toBe(true);
    expect(sky.selectedEventId).toBe('earth-aurora');
    expect(sky.activeEventIds).toContain('earth-aurora');

    await camera.locator('[data-camera-filter="magnetic"]').click();
    await camera.locator('#explorer-camera-shutter').click();
    await expect.poll(() => page.evaluate(() => window.__paperPreview.getState().livingSky.photoRecords.length)).toBe(1);
    await camera.locator('#explorer-camera-close').click();

    await page.locator('#mission-center-trigger').click();
    await page.locator('[data-passport-section="collection"]').click();
    const album = page.locator('.sky-photo-album');
    await expect(album).toBeVisible();
    await expect(album.locator('.sky-photo-card')).toHaveCount(1);
    await album.locator('[data-sky-photo-open]').click();
    await expect(page.locator('#sky-photo-viewer')).toBeVisible();
    await expect(page.locator('#sky-photo-viewer-image')).toHaveAttribute('src', /^blob:/);
    await page.locator('#sky-photo-viewer-close').click();

    await page.screenshot({ path: '.local/playtest/living-sky-album-desktop.png' });
    expect(runtimeErrors).toEqual([]);
});

test('keeps observatory and camera touch-safe on phone and landscape tablet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);
    await page.locator('#living-sky-trigger').click();

    const panel = page.locator('#living-sky-observatory');
    const panelBox = await panel.boundingBox();
    expect(panelBox.x).toBeGreaterThanOrEqual(0);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(390);
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(844);

    await panel.locator('[data-living-sky-observe="mars-dust-front"]').click();
    const shutter = page.locator('#explorer-camera-shutter');
    const shutterBox = await shutter.boundingBox();
    expect(shutterBox.width).toBeGreaterThanOrEqual(56);
    expect(shutterBox.height).toBeGreaterThanOrEqual(56);
    await expect(page.locator('.camera-key-hint')).toBeHidden();

    await page.locator('[data-language-toggle]').click();
    await expect(page.locator('.explorer-camera-heading strong')).toHaveText('Explorer Camera');
    await page.setViewportSize({ width: 844, height: 390 });
    const consoleBox = await page.locator('.explorer-camera-console').boundingBox();
    expect(consoleBox.x).toBeGreaterThanOrEqual(0);
    expect(consoleBox.x + consoleBox.width).toBeLessThanOrEqual(844);
    expect(consoleBox.y + consoleBox.height).toBeLessThanOrEqual(390);
    await page.screenshot({ path: '.local/playtest/living-sky-camera-landscape.png' });
});
