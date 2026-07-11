import { describe, expect, it } from 'vitest';
import {
    AWARD_CATALOG,
    EVENT_XP,
    awardExpeditionEvent,
    createExpeditionProgress,
    evaluateAwards,
    getExplorerLevel,
    reconcileExpeditionProgress
} from '../paper-preview/src/progression/expeditionProgress.js';

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
});
