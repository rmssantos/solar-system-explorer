import { describe, expect, it } from 'vitest';
import { createExpeditionState } from '../paper-preview/src/expedition/expeditionState.js';
import {
    getNextExpeditionChapter,
    isExpeditionDestinationNearby
} from '../paper-preview/src/expedition/expeditionDirector.js';

const context = { discoveredKeys: ['moon'], completedContractIds: ['iss-delivery'] };

describe('Signal of the Moons director', () => {
    it('selects the first available unfinished chapter', () => {
        expect(getNextExpeditionChapter(createExpeditionState(), context)?.id).toBe('moon-seismology');
        expect(getNextExpeditionChapter(createExpeditionState({
            completedExpeditionChapterIds: ['moon-seismology']
        }), context)?.id).toBe('europa-radar');
    });

    it('returns no chapter before the season unlocks', () => {
        expect(getNextExpeditionChapter(createExpeditionState(), {})).toBeNull();
    });

    it('recognizes moons directly or through their parent system', () => {
        expect(isExpeditionDestinationNearby('europa-radar', { objectKey: 'europa' })).toBe(true);
        expect(isExpeditionDestinationNearby('europa-radar', { planetKey: 'jupiter', objectKey: 'io' })).toBe(false);
        expect(isExpeditionDestinationNearby('titan-dragonfly', { objectKey: 'titan', orbitingParentKey: 'saturn' })).toBe(true);
        expect(isExpeditionDestinationNearby('titan-dragonfly', { objectKey: 'enceladus', orbitingParentKey: 'saturn' })).toBe(false);
    });
});
