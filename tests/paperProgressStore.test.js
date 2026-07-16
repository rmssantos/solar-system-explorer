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
            completedContractIds: []
        });
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
            completedContractIds: []
        });
    });
});
