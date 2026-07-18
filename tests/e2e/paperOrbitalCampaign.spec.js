import { expect, test } from '@playwright/test';

const CONTRACTS = [
    { id: 'iss-delivery', destination: 'earth', reward: 'Selo Órbita Amiga' },
    { id: 'hubble-maintenance', destination: 'earth', reward: 'Selo Olho Cósmico' },
    { id: 'lunar-sweep', destination: 'moon', reward: 'Selo Guardião Lunar' },
    { id: 'mars-relay', destination: 'mars', reward: 'Selo Ponte Vermelha' },
    { id: 'jupiter-slingshot', destination: 'jupiter', reward: 'Selo Curva Gigante' }
];

const DISCOVERIES = ['earth', 'moon', 'mars', 'jupiter'];
const STORAGE_KEY = 'paperSolarExplorer:progress:v1';
const CONSENT_KEY = 'paperSolarExplorer:analyticsConsent';

async function seed(page, progress = {}) {
    await page.addInitScript(({ progressValue, storageKey, consentKey, discoveryKeys }) => {
        if (sessionStorage.getItem('paper-e2e-seeded') === 'yes') return;
        localStorage.setItem(storageKey, JSON.stringify({
            discoveredKeys: discoveryKeys,
            ...progressValue
        }));
        localStorage.setItem(consentKey, JSON.stringify({
            version: 1,
            choice: 'denied',
            updatedAt: new Date().toISOString()
        }));
        sessionStorage.setItem('paper-e2e-seeded', 'yes');
    }, { progressValue: progress, storageKey: STORAGE_KEY, consentKey: CONSENT_KEY, discoveryKeys: DISCOVERIES });
}

async function ready(page) {
    await page.goto('/jogo/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.__paperPreview));
}

async function openMissions(page) {
    const dialog = page.locator('#mission-log');
    if (!await dialog.evaluate((element) => element.open)) await page.locator('#mission-center-trigger').click();
    await expect(dialog).toBeVisible();
}

function contractCard(page, contractId) {
    return page.locator('.contract-card', {
        has: page.locator(`[data-contract-id="${contractId}"]`)
    });
}

async function dismissTraining(page) {
    const training = page.locator('#local-orbit-training');
    for (let step = 0; step < 4 && await training.isVisible(); step += 1) {
        await page.locator('#local-orbit-training-next').click();
    }
    await expect(training).toBeHidden();
}

async function acceptTravelAndOpen(page, contract) {
    await openMissions(page);
    const action = page.locator(`[data-contract-id="${contract.id}"]`);
    await expect(action).toHaveAttribute('data-contract-action', 'accept');
    await action.click();
    await expect(action).toHaveAttribute('data-contract-action', 'travel');
    await action.click();
    await page.evaluate((destination) => window.__paperPreview.teleport(destination), contract.destination);
    await expect(page.locator('#mission-log')).toBeVisible();
    await expect(action).toHaveAttribute('data-contract-action', 'start');
    await action.click();
    await page.locator('#local-orbit-loading').waitFor({ state: 'hidden' });
    await dismissTraining(page);
}

test('accepts, travels, resumes and completes the five-contract campaign', async ({ page }) => {
    test.setTimeout(120_000);
    await seed(page);
    await ready(page);

    for (const [index, contract] of CONTRACTS.entries()) {
        await acceptTravelAndOpen(page, contract);

        if (index === 0) {
            await page.evaluate(() => window.advanceTime(300));
            await page.locator('#local-orbit-close').click();
            await page.locator('#local-orbit-leave-save').click();
            await ready(page);
            await page.evaluate((destination) => window.__paperPreview.teleport(destination), contract.destination);
            await openMissions(page);
            await page.locator(`[data-contract-id="${contract.id}"]`).click();
            await page.locator('#local-orbit-loading').waitFor({ state: 'hidden' });
            const restored = await page.evaluate(() => JSON.parse(window.render_game_to_text()).orbitalMission.simulation);
            expect(restored.elapsedSeconds).toBeGreaterThan(0);
        }

        await expect(page.evaluate(() => window.__paperPreview.completeOrbitalContract())).resolves.toBe(true);
        await ready(page);
        await openMissions(page);
        const card = contractCard(page, contract.id);
        await expect(card).toHaveAttribute('data-status', 'completed');
        await expect(card).toContainText(contract.reward);
        await page.locator('#close-mission-log').click();
    }

    const state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
    expect(state.contract.completedContractIds).toEqual(CONTRACTS.map((contract) => contract.id));
    expect(state.progression.xp).toBe(950);

    await page.locator('[data-language-toggle]').click();
    await openMissions(page);
    await expect(contractCard(page, 'jupiter-slingshot'))
        .toContainText('Jupiter slingshot');
});

for (const viewport of [
    { name: 'tablet-portrait', width: 820, height: 1180 },
    { name: 'phone-portrait', width: 390, height: 844 },
    { name: 'phone-landscape', width: 844, height: 390 }
]) {
    test(`keeps missions and touch controls usable at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await seed(page, {
            completedContractIds: CONTRACTS.slice(0, 4).map((contract) => contract.id),
            acceptedContractIds: ['jupiter-slingshot'],
            seenMissionTrainingIds: ['slingshot']
        });
        await ready(page);
        await page.evaluate(() => window.__paperPreview.trainContract('jupiter-slingshot'));
        await page.locator('#local-orbit-loading').waitFor({ state: 'hidden' });
        await dismissTraining(page);

        const dialogBox = await page.locator('#local-orbit-mission').boundingBox();
        expect(dialogBox.x).toBeGreaterThanOrEqual(0);
        expect(dialogBox.y).toBeGreaterThanOrEqual(0);
        expect(dialogBox.width).toBeLessThanOrEqual(viewport.width);
        expect(dialogBox.height).toBeLessThanOrEqual(viewport.height);

        for (const action of ['forward', 'reverse', 'up', 'down', 'stabilize']) {
            const control = page.locator(`[data-docking-action="${action}"]`);
            await expect(control).toBeVisible();
            const box = await control.boundingBox();
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
        }
        await page.locator('#local-orbit-close').click();
        await expect(page.locator('#local-orbit-mission')).toBeHidden();
    });
}
