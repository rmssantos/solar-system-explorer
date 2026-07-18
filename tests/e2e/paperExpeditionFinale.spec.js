import { expect, test } from '@playwright/test';

const chapters = ['moon-seismology', 'europa-radar', 'enceladus-plume', 'titan-dragonfly'];
async function readyForFinale(page, viewport = { width: 1280, height: 800 }) {
    await page.setViewportSize(viewport);
    await page.addInitScript(({ chapters }) => {
        localStorage.setItem('paperSolarExplorer:analyticsConsent', JSON.stringify({ version: 1, choice: 'denied', updatedAt: new Date().toISOString() }));
        if (!localStorage.getItem('paperSolarExplorer:progress:v1')) localStorage.setItem('paperSolarExplorer:progress:v1', JSON.stringify({
            discoveredKeys: ['moon', 'europa', 'enceladus', 'titan'], completedContractIds: ['iss-delivery'],
            acceptedExpeditionChapterIds: chapters, completedExpeditionChapterIds: chapters,
            expeditionEvidenceIds: ['moon-seismic-evidence', 'europa-ocean-evidence', 'enceladus-plume-evidence', 'titan-chemistry-evidence'],
            expeditionUpgradeIds: ['paper-seismometer', 'ice-radar', 'plume-collector', 'atmosphere-lab']
        }));
    }, { chapters });
    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));
    await page.locator('#mission-center-trigger').click();
    await page.locator('[data-passport-section="investigation"]').click();
    await page.locator('[data-expedition-chapter="ocean-worlds-finale"]').click();
    await expect(page.locator('#expedition-finale')).toBeVisible();
}

test('builds, retries and persists the bilingual evidence conclusion', async ({ page }, testInfo) => {
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    await readyForFinale(page);
    for (const card of await page.locator('[data-finale-evidence]').all()) await card.click();
    await page.locator('input[value="aliens-everywhere"]').check();
    await page.locator('#expedition-finale-submit').click();
    await expect(page.locator('#expedition-finale-feedback')).toContainText('ainda não provam vida');
    await page.locator('input[value="potential-not-proof"]').check();
    await page.locator('#expedition-finale-submit').click();
    await expect(page.locator('#expedition-finale-feedback')).toContainText('Habitável não significa habitado');
    await page.screenshot({ path: testInfo.outputPath('ocean-finale-desktop.png') });
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('paperSolarExplorer:progress:v1')));
    expect(stored.completedExpeditionChapterIds).toContain('ocean-worlds-finale');
    expect(stored.expeditionUpgradeIds).toContain('guardian-ocean-seal');
    await page.reload(); await page.waitForFunction(() => Boolean(window.__paperPreview));
    expect((await page.evaluate(() => window.__paperPreview.getState().expedition.completedChapterIds))).toContain('ocean-worlds-finale');
    expect(errors).toEqual([]);
});

test('keeps the evidence map touch-safe on a narrow phone and translates live', async ({ page }, testInfo) => {
    await readyForFinale(page, { width: 390, height: 844 });
    await page.locator('#expedition-finale-close').click();
    await page.locator('[data-language-toggle]').click();
    await page.locator('#mission-center-trigger').click();
    await page.locator('[data-passport-section="investigation"]').click();
    await page.locator('[data-expedition-chapter="ocean-worlds-finale"]').click();
    await expect(page.locator('#expedition-finale-title')).toHaveText('The invisible map');
    const dialog = await page.locator('.expedition-finale-sheet').boundingBox();
    expect(dialog.x).toBeGreaterThanOrEqual(0); expect(dialog.x + dialog.width).toBeLessThanOrEqual(390);
    for (const card of await page.locator('[data-finale-evidence]').all()) {
        const box = await card.boundingBox(); expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('ocean-finale-mobile.png') });
});
