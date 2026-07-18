import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const game = read('../paper-preview/src/main.js');

describe('Signal of the Moons runtime integration', () => {
    it('restores and persists expedition state, attempts and XP inputs', () => {
        expect(game).toContain('createExpeditionState(savedProgress)');
        expect(game).toContain('acceptedExpeditionChapterIds: expeditionState.acceptedChapterIds');
        expect(game).toContain('completedExpeditionChapterIds: expeditionState.completedChapterIds');
        expect(game).toContain('expeditionAttempts: expeditionAttemptState.contractAttempts');
        expect(game).toContain('completedExpeditionChapterIds: expeditionState.completedChapterIds');
    });

    it('connects board actions to accept, autopilot travel, arrival and mission open', () => {
        expect(game).toContain('function handleExpeditionAction(chapterId, action)');
        expect(game).toContain('acceptExpeditionChapter(');
        expect(game).toContain('startExpeditionTravel(expeditionJourney, chapterId)');
        expect(game).toContain('flyToWorldObject(next.targetKey, { allowMissionLog: true })');
        expect(game).toContain('arriveExpeditionTravel(expeditionJourney, autopilotTargetKey)');
        expect(game).toContain("previewUI.openMissionLog('investigation')");
        expect(game).toContain('startExpeditionChapter(chapterId)');
    });

    it('routes completion to the active expedition chapter without changing Courier contracts', () => {
        expect(game).toContain('activeExpeditionChapterId');
        expect(game).toContain('completeExpeditionChapter(expeditionState, activeExpeditionChapterId)');
        expect(game).toContain('onComplete: handleLocalMissionComplete');
        expect(game).toContain('return handleOrbitalContractComplete(context)');
        expect(game).toContain('attemptKey: chapter.id');
    });

    it('includes the expedition in deterministic browser state and debug controls', () => {
        expect(game).toContain('expedition: { ...expeditionState, journey: expeditionJourney');
        expect(game).toContain('acceptExpeditionChapter:');
        expect(game).toContain('travelExpeditionChapter:');
        expect(game).toContain('startExpeditionChapter');
    });
});
