import { describe, expect, it } from 'vitest';
import {
    completeMissionTraining,
    createMissionTrainingState,
    needsMissionTraining
} from '../paper-preview/src/contracts/missionTrainingState.js';

describe('orbital mission training state', () => {
    it('shows one first-play tutorial per gameplay family', () => {
        const initial = createMissionTrainingState();
        expect(needsMissionTraining(initial, 'docking')).toBe(true);

        const completed = completeMissionTraining(initial, 'docking');
        expect(needsMissionTraining(completed, 'docking')).toBe(false);
        expect(needsMissionTraining(completed, 'sweep')).toBe(true);
        expect(completed.seenMissionTrainingIds).toEqual(['docking']);
    });

    it('can force replay without changing the persisted completion set', () => {
        const completed = completeMissionTraining(createMissionTrainingState(), 'signal');
        expect(needsMissionTraining(completed, 'signal', { force: true })).toBe(true);
        expect(completeMissionTraining(completed, 'signal')).toBe(completed);
    });
});
