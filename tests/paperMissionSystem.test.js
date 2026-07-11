import { describe, expect, it } from 'vitest';
import { evaluateMissions, MISSION_CATALOG } from '../paper-preview/src/missions/missionSystem.js';

describe('paper explorer missions', () => {
    it('starts with the Saturn route and reports exact progress', () => {
        const result = evaluateMissions({ discoveredKeys: ['sun'], completedQuizIds: [] });
        expect(result.active.id).toBe('rings-route');
        expect(result.active.progress).toEqual({ current: 0, total: 1 });
    });

    it('unlocks a sequence covering planets, moons and human objects', () => {
        const allRequired = [...new Set(MISSION_CATALOG.flatMap((mission) => mission.discover))];
        const result = evaluateMissions({ discoveredKeys: allRequired, completedQuizIds: ['earth-0'] });
        expect(result.completedIds).toHaveLength(MISSION_CATALOG.length);
        expect(result.active).toBeNull();
    });
});
