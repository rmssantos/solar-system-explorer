import { describe, expect, it } from 'vitest';
import { loadProgress, saveProgress } from '../paper-preview/src/missions/progressStore.js';

function createMemoryStorage(initialValue = null) {
    let value = initialValue;
    return {
        getItem: () => value,
        setItem: (_key, nextValue) => { value = nextValue; },
        read: () => value
    };
}

describe('paper progress store contract migration', () => {
    it('loads old saves with empty contract collections', () => {
        const storage = createMemoryStorage(JSON.stringify({
            discoveredKeys: ['earth'],
            completedQuizIds: ['earth-0'],
            xp: 55
        }));

        expect(loadProgress(storage)).toMatchObject({
            discoveredKeys: ['earth'],
            completedQuizIds: ['earth-0'],
            xp: 55,
            acceptedContractIds: [],
            completedContractIds: [],
            agencyActiveMissions: [],
            agencyReports: []
        });
    });

    it('round-trips active probes and scientific reports without changing the storage key', () => {
        const storage = createMemoryStorage();
        const mission = { id: 'solar:1', operationId: 'solar', startedAt: 10, endsAt: 20 };
        const report = { id: 'report:solar:1', operationId: 'solar', collected: true };

        saveProgress({ agencyActiveMissions: [mission], agencyReports: [report] }, storage);

        expect(loadProgress(storage)).toMatchObject({
            agencyActiveMissions: [mission],
            agencyReports: [report]
        });
    });

    it('round-trips versioned orbital contract attempts', () => {
        const storage = createMemoryStorage();
        const contractAttempts = {
            'iss-delivery': {
                version: 1, missionId: 'iss-docking', savedAt: 123,
                simulation: { phase: 'approach', position: { x: -4, y: 0 } }
            }
        };

        expect(saveProgress({ contractAttempts }, storage)).toBe(true);
        expect(loadProgress(storage).contractAttempts).toEqual(contractAttempts);
    });

    it('does not serialize arrays as contract attempt maps', () => {
        const storage = createMemoryStorage();
        saveProgress({ contractAttempts: [] }, storage);
        expect(JSON.parse(storage.read()).contractAttempts).toEqual({});
    });

    it('round-trips completed mission training families', () => {
        const storage = createMemoryStorage();
        saveProgress({ seenMissionTrainingIds: ['docking', 'signal', 'docking'] }, storage);
        expect(loadProgress(storage).seenMissionTrainingIds).toEqual(['docking', 'signal']);
    });

    it('discards malformed agency collections while keeping other progress', () => {
        const storage = createMemoryStorage(JSON.stringify({
            xp: 90,
            agencyActiveMissions: { broken: true },
            agencyReports: 'broken'
        }));
        expect(loadProgress(storage)).toMatchObject({ xp: 90, agencyActiveMissions: [], agencyReports: [] });
    });

    it('saves unique accepted and completed contract identifiers', () => {
        const storage = createMemoryStorage();
        saveProgress({
            acceptedContractIds: ['iss-delivery', 'iss-delivery'],
            completedContractIds: ['iss-delivery', 'iss-delivery']
        }, storage);

        expect(JSON.parse(storage.read())).toMatchObject({
            acceptedContractIds: ['iss-delivery'],
            completedContractIds: ['iss-delivery']
        });
    });

    it('returns safe contract defaults for malformed storage', () => {
        expect(loadProgress(createMemoryStorage('{broken'))).toMatchObject({
            acceptedContractIds: [],
            completedContractIds: [],
            agencyActiveMissions: [],
            agencyReports: []
        });
    });
});
