import { expect, test } from '@playwright/test';

const missions = [
    { id: 'europa-radar', destination: 'europa', title: 'Debaixo do gelo', training: 'ice-radar', completed: ['moon-seismology'] },
    { id: 'enceladus-plume', destination: 'enceladus', title: 'A fonte congelada', training: 'plume', completed: ['moon-seismology', 'europa-radar'] },
    { id: 'titan-dragonfly', destination: 'titan', title: 'Chuva de metano', training: 'dragonfly', completed: ['moon-seismology', 'europa-radar', 'enceladus-plume'] }
];

for (const mission of missions) {
    test(`${mission.id} renders its paper experiment on desktop and phone`, async ({ page }, testInfo) => {
        const errors = []; page.on('pageerror', (error) => errors.push(error.message));
        await page.addInitScript(({ mission }) => {
            localStorage.setItem('paperSolarExplorer:analyticsConsent', JSON.stringify({ version: 1, choice: 'denied', updatedAt: new Date().toISOString() }));
            localStorage.setItem('paperSolarExplorer:progress:v1', JSON.stringify({
                discoveredKeys: ['moon', 'europa', 'enceladus', 'titan'], completedContractIds: ['iss-delivery'],
                acceptedExpeditionChapterIds: [...mission.completed, mission.id], completedExpeditionChapterIds: mission.completed,
                seenMissionTrainingIds: [mission.training]
            }));
        }, { mission });
        await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => Boolean(window.__paperPreview));
        await page.evaluate((destination) => { window.__paperPreview.setOrbitalTimeScale(0); window.__paperPreview.teleport(destination); }, mission.destination);
        await page.locator('#mission-center-trigger').click();
        await page.locator('[data-passport-section="investigation"]').click();
        const action = page.locator(`[data-expedition-chapter="${mission.id}"]`);
        await expect(action).toHaveAttribute('data-expedition-action', 'start'); await action.click();
        await page.locator('#local-orbit-loading').waitFor({ state: 'hidden' });
        await expect(page.locator('#local-orbit-title')).toHaveText(mission.title);
        await expect(page.locator('#local-orbit-stage canvas')).toBeVisible();
        await expect(page.locator('[data-mission-assist="calmPace"]')).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath(`${mission.id}-desktop.png`) });
        await page.setViewportSize({ width: 390, height: 844 });
        const canvas = await page.locator('#local-orbit-stage canvas').boundingBox();
        expect(canvas.x).toBeGreaterThanOrEqual(0); expect(canvas.x + canvas.width).toBeLessThanOrEqual(390);
        for (const control of await page.locator('.docking-control:visible').all()) {
            const box = await control.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
        }
        await page.screenshot({ path: testInfo.outputPath(`${mission.id}-mobile.png`) });
        expect(errors).toEqual([]);
    });
}
