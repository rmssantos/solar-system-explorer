import { describe, expect, it } from 'vitest';
import {
    SURPRISE_CATALOG,
    createSurpriseState,
    dismissSurprise,
    stepSurpriseDirector
} from '../paper-preview/src/surprises/surpriseDirector.js';

describe('calm in-game surprise director', () => {
    it('waits for active flight away from the origin and never interrupts a dialog', () => {
        const state = createSurpriseState({ nextAtSeconds: 5 });
        expect(stepSurpriseDirector(state, { deltaSeconds: 6, speed: 0, distanceFromOrigin: 30 }).event).toBeNull();
        expect(stepSurpriseDirector(state, { deltaSeconds: 6, speed: 2, distanceFromOrigin: 2 }).event).toBeNull();
        expect(stepSurpriseDirector(state, { deltaSeconds: 6, speed: 2, distanceFromOrigin: 30, dialogOpen: true }).event).toBeNull();
    });

    it('selects an unseen surprise deterministically after the cooldown', () => {
        const state = createSurpriseState({ nextAtSeconds: 5 });
        const result = stepSurpriseDirector(state, {
            deltaSeconds: 6,
            speed: 2,
            distanceFromOrigin: 30,
            random: () => 0
        });
        expect(result.event).toEqual(SURPRISE_CATALOG[0]);
        expect(result.state.activeId).toBe(SURPRISE_CATALOG[0].id);
        expect(result.state.seenIds).toContain(SURPRISE_CATALOG[0].id);
    });

    it('does not stack transmissions and rotates before repeating', () => {
        const first = stepSurpriseDirector(createSurpriseState({ nextAtSeconds: 0 }), {
            deltaSeconds: 1, speed: 2, distanceFromOrigin: 30, random: () => 0
        });
        expect(stepSurpriseDirector(first.state, {
            deltaSeconds: 200, speed: 2, distanceFromOrigin: 30, random: () => 0
        }).event).toBeNull();
        const dismissed = dismissSurprise(first.state);
        const second = stepSurpriseDirector({ ...dismissed, nextAtSeconds: dismissed.elapsedSeconds }, {
            deltaSeconds: 1, speed: 2, distanceFromOrigin: 30, random: () => 0
        });
        expect(second.event.id).not.toBe(first.event.id);
    });

    it('ships every surprise with guide copy and a visual effect', () => {
        expect(SURPRISE_CATALOG).toHaveLength(6);
        for (const surprise of SURPRISE_CATALOG) {
            expect(surprise).toMatchObject({ id: expect.any(String), title: expect.any(String), message: expect.any(String), effect: expect.any(String) });
        }
    });
});
