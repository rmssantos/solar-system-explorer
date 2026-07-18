import { describe, expect, it } from 'vitest';
import { createPlumeState, getPlumeTelemetry, stepPlume } from '../paper-preview/src/minigames/plumeSimulation.js';

describe('Enceladus plume simulation', () => {
    it('starts with a clean collector and deterministic grains', () => {
        const state = createPlumeState();
        expect(state.phase).toBe('collecting');
        expect(state.samples).toBe(0);
        expect(state.grains.length).toBeGreaterThanOrEqual(8);
        expect(createPlumeState()).toEqual(state);
    });

    it('moves inside the plume and catches a small grain with the collector open', () => {
        const initial = createPlumeState({ position: { x: 0, y: 0 }, grains: [{ id: 'a', x: 0, y: 0, size: 'small', collected: false }] });
        const next = stepPlume(initial, { collector: true }, 0.1);
        expect(next.samples).toBe(1);
        expect(next.grains[0].collected).toBe(true);
        expect(next.purity).toBe(1);
    });

    it('turns a large grain into corrective feedback without deleting good samples', () => {
        const initial = createPlumeState({ samples: 2, position: { x: 0, y: 0 }, grains: [{ id: 'b', x: 0, y: 0, size: 'large', collected: false }] });
        const hit = stepPlume(initial, { collector: true }, 0.1);
        expect(hit.event).toBe('large-grain-hit');
        expect(hit.samples).toBe(2);
        expect(hit.collector).toBe(false);
        expect(hit.purity).toBeLessThan(1);
    });

    it('completes after five clean crystals', () => {
        const state = createPlumeState({ samples: 5, purity: 0.9 });
        expect(state.phase).toBe('complete');
        expect(state.event).toBe('plume-sampled');
        expect(getPlumeTelemetry(state)).toMatchObject({ samples: 5, total: 5, primarySafe: true });
    });

    it('sanitizes malformed restored values and remains immutable', () => {
        const state = createPlumeState({ samples: 99, purity: Number.NaN, cooling: -2, position: { x: 9, y: -9 } });
        expect(state.samples).toBe(5);
        expect(state.purity).toBe(1);
        expect(state.cooling).toBe(0);
        expect(state.position).toEqual({ x: 1, y: -1 });
        expect(Object.isFrozen(state)).toBe(true);
    });
});
