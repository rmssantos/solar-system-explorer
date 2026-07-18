import { expect, test } from '@playwright/test';

const STORAGE_KEY = 'paperSolarExplorer:progress:v1';
const CONSENT_KEY = 'paperSolarExplorer:analyticsConsent';

test('opens the lunar seismology mission with paper controls and live telemetry', async ({ page }, testInfo) => {
    await page.addInitScript(({ storageKey, consentKey }) => {
        localStorage.setItem(storageKey, JSON.stringify({
            discoveredKeys: ['moon'],
            completedContractIds: ['iss-delivery'],
            acceptedExpeditionChapterIds: ['moon-seismology'],
            seenMissionTrainingIds: ['seismic']
        }));
        localStorage.setItem(consentKey, JSON.stringify({
            version: 1, choice: 'denied', updatedAt: new Date().toISOString()
        }));
    }, { storageKey: STORAGE_KEY, consentKey: CONSENT_KEY });

    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));
    await page.evaluate(() => {
        window.__paperPreview.setOrbitalTimeScale(0);
        window.__paperPreview.teleport('moon');
    });
    await page.locator('#mission-center-trigger').click();
    await page.locator('[data-passport-section="investigation"]').click();
    const action = page.locator('[data-expedition-chapter="moon-seismology"]');
    await expect(action).toHaveAttribute('data-expedition-action', 'start');
    await action.click();
    await page.locator('#local-orbit-loading').waitFor({ state: 'hidden' });

    await expect(page.locator('#local-orbit-title')).toHaveText('O eco da Lua');
    await expect(page.locator('.docking-instruments')).toContainText('Sensores');
    await expect(page.locator('.docking-instruments')).toContainText('Clareza');
    await expect(page.locator('.docking-instruments')).toContainText('Triangulação');
    await expect(page.locator('#local-orbit-stage canvas')).toBeVisible();
    for (const control of ['forward', 'reverse', 'up', 'down', 'stabilize']) {
        const button = page.locator(`[data-docking-action="${control}"]`);
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
    }

    const state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
    expect(state.expedition.activeExpeditionChapterId).toBe('moon-seismology');
    expect(state.orbitalMission.simulation.phase).toBe('placing');
    await page.screenshot({ path: testInfo.outputPath('seismic-mission.png') });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#local-orbit-mission')).toBeVisible();
    const canvasBox = await page.locator('#local-orbit-stage canvas').boundingBox();
    expect(canvasBox.x).toBeGreaterThanOrEqual(0);
    expect(canvasBox.y).toBeGreaterThanOrEqual(0);
    expect(canvasBox.width).toBeLessThanOrEqual(390);
    expect(canvasBox.height).toBeLessThanOrEqual(844);
    for (const control of ['forward', 'reverse', 'up', 'down', 'stabilize']) {
        const box = await page.locator(`[data-docking-action="${control}"]`).boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: testInfo.outputPath('seismic-mission-mobile.png') });
});
