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
    await page.screenshot({ path: '.local/playtest/living-sky-illustrations-observatory.png' });
    await observatory.locator('[data-living-sky-art-open]').first().click();
    await expect(page.locator('#sky-photo-viewer')).toBeVisible();
    await expect(page.locator('#sky-photo-viewer-image')).toHaveAttribute('src', /\/art\/living-sky\/.+\.webp$/);
    await page.screenshot({ path: '.local/playtest/living-sky-illustration-large.png' });
    await page.locator('#sky-photo-viewer-close').click();

    await observatory.locator('[data-living-sky-observe="earth-aurora"]').click();
    const camera = page.locator('#explorer-camera');
    await expect(camera).toBeVisible();
    await page.evaluate(() => {
        window.__paperPreview.cancelAutopilot();
        window.__paperPreview.teleport('earth');
        window.advanceTime(100);
    });
    const clock = await page.evaluate(() => window.__paperPreview.getState().scene.orbitalClock);
    expect(clock.timeScale).toBe(1);
    const sky = await page.evaluate(() => window.__paperPreview.getState().livingSky);
    expect(sky.cameraOpen).toBe(true);
    expect(sky.selectedEventId).toBe('earth-aurora');
    expect(sky.activeEventIds).toContain('earth-aurora');
    await expect(camera.locator('#explorer-camera-target-title')).toHaveText('Aurora da Terra');
    await expect(camera.locator('#explorer-camera-target-clue')).toContainText('fitas verdes');
    await page.screenshot({ path: '.local/playtest/living-sky-aurora-viewfinder-desktop.png' });

    await camera.locator('[data-camera-filter="magnetic"]').click();
    await camera.locator('#explorer-camera-shutter').click();
    await expect.poll(() => page.evaluate(() => window.__paperPreview.getState().livingSky.photoRecords.length)).toBe(1);
    const result = camera.locator('#explorer-camera-result');
    await expect(result).toBeVisible();
    await expect(camera.locator('.explorer-camera-guidance')).toBeHidden();
    await expect(result.locator('#explorer-camera-result-image')).toHaveAttribute('src', /^blob:/);
    await page.screenshot({ path: '.local/playtest/living-sky-photo-developed-desktop.png' });
    await result.locator('#explorer-camera-view-album').click();
    await expect(camera).toBeHidden();
    await expect(page.locator('[data-passport-section="collection"]')).toHaveAttribute('aria-selected', 'true');
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
    await page.evaluate(() => {
        window.__paperPreview.cancelAutopilot();
        window.__paperPreview.teleport('mars');
        window.advanceTime(100);
    });
    await expect(page.locator('#explorer-camera-target-title')).toHaveText('A frente de poeira');
    await expect(page.locator('#explorer-camera-target-clue')).toContainText('faixa coral');
    await page.screenshot({ path: '.local/playtest/living-sky-dust-viewfinder-mobile.png' });
    const shutter = page.locator('#explorer-camera-shutter');
    const shutterBox = await shutter.boundingBox();
    expect(shutterBox.width).toBeGreaterThanOrEqual(56);
    expect(shutterBox.height).toBeGreaterThanOrEqual(56);
    await expect(page.locator('.camera-key-hint')).toBeHidden();

    await shutter.click();
    const result = page.locator('#explorer-camera-result');
    await expect(result).toBeVisible();
    await expect(page.locator('.explorer-camera-guidance')).toBeHidden();
    const resultBox = await result.boundingBox();
    expect(resultBox.x).toBeGreaterThanOrEqual(0);
    expect(resultBox.x + resultBox.width).toBeLessThanOrEqual(390);
    expect(resultBox.y).toBeGreaterThanOrEqual(0);
    expect(resultBox.y + resultBox.height).toBeLessThanOrEqual(844);
    await page.screenshot({ path: '.local/playtest/living-sky-photo-developed-mobile.png' });

    await page.locator('[data-language-toggle]').click();
    await expect(page.locator('.explorer-camera-heading strong')).toHaveText('Explorer Camera');
    await expect(result.locator('#explorer-camera-view-album')).toHaveText('View in album');
    await page.setViewportSize({ width: 844, height: 390 });
    const landscapeResultBox = await result.boundingBox();
    expect(landscapeResultBox.x).toBeGreaterThanOrEqual(0);
    expect(landscapeResultBox.x + landscapeResultBox.width).toBeLessThanOrEqual(844);
    expect(landscapeResultBox.y).toBeGreaterThanOrEqual(0);
    expect(landscapeResultBox.y + landscapeResultBox.height).toBeLessThanOrEqual(390);
    await page.screenshot({ path: '.local/playtest/living-sky-photo-developed-landscape.png' });
    await result.locator('#explorer-camera-continue').click();
    const consoleBox = await page.locator('.explorer-camera-console').boundingBox();
    expect(consoleBox.x).toBeGreaterThanOrEqual(0);
    expect(consoleBox.x + consoleBox.width).toBeLessThanOrEqual(844);
    expect(consoleBox.y + consoleBox.height).toBeLessThanOrEqual(390);
    await page.screenshot({ path: '.local/playtest/living-sky-camera-landscape.png' });
});
