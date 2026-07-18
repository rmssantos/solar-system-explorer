import { expect, test } from '@playwright/test';

test('renders Mars polar ice as part of the paper surface', async ({ page }) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await page.addInitScript(() => {
        localStorage.setItem('paperSolarExplorer:analyticsConsent', JSON.stringify({
            version: 1, choice: 'denied', updatedAt: new Date().toISOString()
        }));
    });
    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));

    await page.evaluate(() => {
        window.__paperPreview.setOrbitalTimeScale(0);
        window.__paperPreview.teleport('mars');
        window.advanceTime(2_000);
    });

    const view = await page.evaluate(() => {
        const gameState = JSON.parse(window.render_game_to_text());
        const mars = window.__paperPreview.worldPosition('mars');
        return {
            distance: Math.hypot(
                gameState.ship.position.x - mars.x,
                gameState.ship.position.y - mars.y,
                gameState.ship.position.z - mars.z
            )
        };
    });
    expect(view.distance).toBeLessThan(3);
    expect(runtimeErrors).toEqual([]);
    await page.screenshot({ path: '.local/playtest/mars-surface-integrated.png' });
});
