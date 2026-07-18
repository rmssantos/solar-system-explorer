import { expect, test } from '@playwright/test';

const CONSENT_KEY = 'paperSolarExplorer:analyticsConsent';

test.use({ hasTouch: true });

async function ready(page) {
    await page.addInitScript((consentKey) => {
        localStorage.setItem(consentKey, JSON.stringify({
            version: 1,
            choice: 'denied',
            updatedAt: new Date().toISOString()
        }));
    }, CONSENT_KEY);
    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));
    await page.locator('#mission-center-trigger').click();
    await expect(page.locator('#mission-log')).toBeVisible();
}

async function cardGeometry(card) {
    return card.evaluate((element) => {
        const bounds = (selector) => {
            const rect = element.querySelector(selector).getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width };
        };
        return {
            art: bounds('.contract-art-button'),
            copy: bounds('.contract-copy'),
            actions: bounds('.contract-actions')
        };
    });
}

test('mission postcard reflows at the reported compact desktop size and opens full size', async ({ page }) => {
    await page.setViewportSize({ width: 721, height: 513 });
    await ready(page);

    const card = page.locator('.contract-card').first();
    await card.scrollIntoViewIfNeeded();
    const geometry = await cardGeometry(card);
    expect(geometry.copy.width).toBeGreaterThan(260);
    expect(Math.abs(geometry.art.top - geometry.copy.top)).toBeLessThan(8);
    expect(geometry.actions.top).toBeGreaterThanOrEqual(Math.max(geometry.art.bottom, geometry.copy.bottom) - 1);

    await page.screenshot({ path: '.local/qa/contract-card-721.png' });
    const artButton = card.locator('.contract-art-button');
    await expect(artButton).toHaveAttribute('aria-label', /postal.*grande/i);
    await artButton.click();

    const viewer = page.locator('#media-viewer');
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('[data-media-image]')).toHaveAttribute('alt', 'Correio para a ISS');
    await page.screenshot({ path: '.local/qa/contract-card-viewer-721.png' });
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(artButton).toBeFocused();
});

test('mission postcard becomes a readable touch-first stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);

    const card = page.locator('.contract-card').first();
    await card.scrollIntoViewIfNeeded();
    const geometry = await cardGeometry(card);
    expect(geometry.art.width).toBeGreaterThan(250);
    expect(geometry.copy.top).toBeGreaterThanOrEqual(geometry.art.bottom - 1);
    expect(geometry.actions.top).toBeGreaterThanOrEqual(geometry.copy.bottom - 1);
    await expect(card.locator('.contract-art-hint')).toHaveText('Ver em grande');

    await page.screenshot({ path: '.local/qa/contract-card-mobile-390.png' });
    await card.locator('.contract-art-button').tap();
    const viewer = page.locator('#media-viewer');
    await expect(viewer).toBeVisible();
    const viewerGeometry = await viewer.evaluate((element) => {
        const dialog = element.getBoundingClientRect();
        const image = element.querySelector('[data-media-image]').getBoundingClientRect();
        return { dialogHeight: dialog.height, imageHeight: image.height };
    });
    expect(viewerGeometry.dialogHeight).toBeLessThan(420);
    expect(viewerGeometry.imageHeight).toBeGreaterThan(200);
    await page.screenshot({ path: '.local/qa/contract-card-viewer-mobile-390.png' });
});
