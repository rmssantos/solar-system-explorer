import { describe, expect, it } from 'vitest';

let progressPresentation = null;
try {
    progressPresentation = await import('../paper-preview/src/progression/progressPresentation.js');
} catch {}

describe('visible expedition progress presentation', () => {
    it('provides pure presentation and comparison functions', () => {
        expect(progressPresentation?.presentProgress).toBeTypeOf('function');
        expect(progressPresentation?.compareProgress).toBeTypeOf('function');
    });

    it('describes current rank and exact progress toward the next level', () => {
        const view = progressPresentation.presentProgress({ xp: 125 }, {}, 'pt');

        expect(view).toMatchObject({
            xp: 125,
            level: 2,
            title: 'Cartógrafo Lunar',
            currentThreshold: 100,
            nextThreshold: 250,
            xpIntoLevel: 25,
            xpForLevel: 150,
            xpRemaining: 125
        });
        expect(view.progressPercent).toBeCloseTo(16.67, 1);
    });

    it('localizes the rank and caps a maximum-level explorer', () => {
        expect(progressPresentation.presentProgress({ xp: 50_000 }, {}, 'en')).toMatchObject({
            level: 6,
            title: 'Guardian of the System',
            xpRemaining: 0,
            progressPercent: 100,
            isMaxLevel: true
        });
    });

    it('reports XP, level and newly unlocked awards between snapshots', () => {
        const before = progressPresentation.presentProgress({ xp: 80 }, { discoveredKeys: [] });
        const after = progressPresentation.presentProgress({ xp: 100 }, { discoveredKeys: ['earth'] });
        const delta = progressPresentation.compareProgress(before, after);

        expect(delta.xpGained).toBe(20);
        expect(delta.leveledUp).toBe(true);
        expect(delta.newLevel).toMatchObject({ level: 2, title: 'Cartógrafo Lunar' });
        expect(delta.newAwards.map((award) => award.id)).toEqual(['first-light']);
    });
});
