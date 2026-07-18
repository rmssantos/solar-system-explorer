import { describe, expect, it } from 'vitest';
import {
    createLivingSkyState,
    deleteLivingSkyPhoto,
    recordLivingSkyPhoto
} from '../paper-preview/src/living-sky/livingSkyState.js';

function photo(id, overrides = {}) {
    return {
        id,
        storageId: `blob:${id}`,
        eventId: null,
        targetKey: 'earth',
        filter: 'visible',
        capturedAt: Number(id.replace(/\D/g, '')) || 1,
        orbitDate: '2026-07-18T00:00:00.000Z',
        score: 0.5,
        qualified: false,
        ...overrides
    };
}

describe('Living Sky observation state', () => {
    it('sanitizes unknown values and freezes safe records', () => {
        const state = createLivingSkyState({
            completedEventIds: ['earth-aurora', 'unknown', 'earth-aurora'],
            photoRecords: [
                photo('photo-1', { score: 9 }),
                photo('', { filter: 'sepia' }),
                { broken: true }
            ],
            introSeen: 1
        });
        expect(state.completedEventIds).toEqual(['earth-aurora']);
        expect(state.photoRecords).toHaveLength(1);
        expect(state.photoRecords[0]).toMatchObject({ id: 'photo-1', score: 1, filter: 'visible' });
        expect(state.introSeen).toBe(true);
        expect(Object.isFrozen(state)).toBe(true);
        expect(Object.isFrozen(state.photoRecords[0])).toBe(true);
    });

    it('keeps only the best event photograph and completes a qualified event once', () => {
        let state = createLivingSkyState();
        state = recordLivingSkyPhoto(state, photo('photo-1', {
            eventId: 'earth-aurora', filter: 'magnetic', score: 0.78, qualified: true
        }));
        const same = recordLivingSkyPhoto(state, photo('photo-2', {
            eventId: 'earth-aurora', filter: 'magnetic', score: 0.6, qualified: true
        }));
        expect(same).toBe(state);
        const improved = recordLivingSkyPhoto(state, photo('photo-3', {
            eventId: 'earth-aurora', filter: 'magnetic', score: 0.94, qualified: true
        }));
        expect(improved.completedEventIds).toEqual(['earth-aurora']);
        expect(improved.photoRecords).toHaveLength(1);
        expect(improved.photoRecords[0]).toMatchObject({ id: 'photo-3', score: 0.94 });
    });

    it('repairs duplicate event photographs already present in a save', () => {
        const state = createLivingSkyState({
            photoRecords: [
                photo('photo-1', { eventId: 'earth-aurora', score: 0.4 }),
                photo('photo-2', { eventId: 'earth-aurora', score: 0.8 })
            ]
        });
        expect(state.photoRecords).toHaveLength(1);
        expect(state.photoRecords[0]).toMatchObject({ id: 'photo-2', score: 0.8 });
    });

    it('allows free photographs and caps the album at the newest twelve', () => {
        let state = createLivingSkyState();
        for (let index = 1; index <= 14; index += 1) state = recordLivingSkyPhoto(state, photo(`photo-${index}`));
        expect(state.photoRecords).toHaveLength(12);
        expect(state.photoRecords[0].id).toBe('photo-3');
        expect(state.photoRecords.at(-1).id).toBe('photo-14');
        expect(state.completedEventIds).toEqual([]);
        expect(state.introSeen).toBe(true);
    });

    it('keeps earned event photographs while rotating older free snapshots', () => {
        let state = recordLivingSkyPhoto(createLivingSkyState(), photo('event-1', {
            eventId: 'earth-aurora', filter: 'magnetic', score: 0.9, qualified: true, capturedAt: 1
        }));
        for (let index = 2; index <= 20; index += 1) state = recordLivingSkyPhoto(state, photo(`free-${index}`, { capturedAt: index }));
        expect(state.photoRecords).toHaveLength(12);
        expect(state.photoRecords.some((record) => record.id === 'event-1')).toBe(true);
        expect(state.photoRecords.some((record) => record.id === 'free-2')).toBe(false);
    });

    it('deletes album metadata without removing an earned observation', () => {
        const recorded = recordLivingSkyPhoto(createLivingSkyState(), photo('photo-1', {
            eventId: 'io-shadow-transit', score: 0.9, qualified: true
        }));
        const deleted = deleteLivingSkyPhoto(recorded, 'photo-1');
        expect(deleted.photoRecords).toEqual([]);
        expect(deleted.completedEventIds).toEqual(['io-shadow-transit']);
        expect(deleted.introSeen).toBe(true);
        expect(deleteLivingSkyPhoto(deleted, 'missing')).toBe(deleted);
    });
});
