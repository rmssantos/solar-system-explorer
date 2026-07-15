import { describe, expect, it } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import {
    AWARD_CATALOG,
    EVENT_XP,
    awardExpeditionEvent,
    createExpeditionProgress,
    evaluateAwards,
    getExplorerLevel,
    reconcileExpeditionProgress
} from '../paper-preview/src/progression/expeditionProgress.js';
import { AWARD_ART } from '../paper-preview/src/progression/awardArt.js';

describe('paper expedition progression', () => {
    it('awards discoveries, quizzes, surprises and missions only once', () => {
        let progress = createExpeditionProgress();
        progress = awardExpeditionEvent(progress, { type: 'discovery', id: 'earth' });
        progress = awardExpeditionEvent(progress, { type: 'quiz', id: 'earth-0' });
        progress = awardExpeditionEvent(progress, { type: 'surprise', id: 'signal-1' });
        progress = awardExpeditionEvent(progress, { type: 'mission', id: 'rings-route' });
        progress = awardExpeditionEvent(progress, { type: 'discovery', id: 'earth' });

        expect(progress.xp).toBe(EVENT_XP.discovery + EVENT_XP.quiz + EVENT_XP.surprise + EVENT_XP.mission);
        expect(progress.awardedEventIds).toHaveLength(4);
    });

    it('awards an orbital delivery contract only once', () => {
        const snapshot = { completedContractIds: ['iss-delivery', 'iss-delivery'] };
        const first = reconcileExpeditionProgress(createExpeditionProgress(), snapshot);
        const second = reconcileExpeditionProgress(first, snapshot);

        expect(first.xp).toBe(EVENT_XP.contract);
        expect(first.awardedEventIds).toEqual(['contract:iss-delivery']);
        expect(second).toEqual(first);
    });

    it('calculates calm, finite explorer levels and progress to the next one', () => {
        expect(getExplorerLevel(0)).toMatchObject({ level: 1, title: 'Cadete de Papel', progress: 0 });
        expect(getExplorerLevel(125)).toMatchObject({ level: 2, title: 'Cartógrafo Lunar' });
        expect(getExplorerLevel(500).progress).toBeGreaterThanOrEqual(0);
        expect(getExplorerLevel(50_000)).toMatchObject({ level: 6, title: 'Guardião do Sistema', progress: 1 });
    });

    it('derives medals and trophies from meaningful exploration milestones', () => {
        const awards = evaluateAwards({
            discoveredKeys: ['sun', 'mercury', 'venus', 'earth', 'mars', 'moon', 'europa', 'enceladus', 'titan'],
            completedQuizIds: ['earth-0'],
            completedMissionIds: ['rings-route', 'inner-worlds', 'moon-oceans']
        });

        expect(awards.map((award) => award.id)).toEqual(expect.arrayContaining([
            'first-light', 'inner-cartographer', 'moon-hopper', 'rings-route'
        ]));
        expect(AWARD_CATALOG.every((award) => award.title && award.description && award.kind)).toBe(true);
    });

    it('gives every award a distinct paper-style image asset', () => {
        const art = AWARD_CATALOG.map((award) => AWARD_ART[award.id]);
        expect(new Set(art).size).toBe(AWARD_CATALOG.length);
        for (const assetPath of art) {
            expect(assetPath).toMatch(/^\/art\/awards\/award-[a-z-]+\.webp$/);
            const asset = new URL(`../paper-preview/public${assetPath}`, import.meta.url);
            expect(existsSync(asset)).toBe(true);
            expect(statSync(asset).size).toBeGreaterThan(10_000);
        }
    });

    it('migrates existing discoveries, quizzes and missions into idempotent XP', () => {
        const snapshot = {
            discoveredKeys: ['earth', 'saturn'],
            completedQuizIds: ['earth-0'],
            completedMissionIds: ['rings-route']
        };
        const first = reconcileExpeditionProgress(createExpeditionProgress(), snapshot);
        const second = reconcileExpeditionProgress(first, snapshot);
        expect(second).toEqual(first);
        expect(first.xp).toBe((2 * EVENT_XP.discovery) + EVENT_XP.quiz + EVENT_XP.mission);
    });

    it('persists surprise history together with its XP event', () => {
        const progress = reconcileExpeditionProgress(createExpeditionProgress(), {
            seenSurpriseIds: ['paper-comet']
        });
        expect(progress.seenSurpriseIds).toEqual(['paper-comet']);
        expect(progress.awardedEventIds).toContain('surprise:paper-comet');
        expect(progress.xp).toBe(EVENT_XP.surprise);
    });
});
