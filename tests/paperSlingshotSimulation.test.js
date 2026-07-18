import { describe, expect, it } from 'vitest';
import {
    SLINGSHOT_LIMITS,
    createSlingshotState,
    getSlingshotTelemetry,
    stepSlingshot
} from '../paper-preview/src/minigames/slingshotSimulation.js';

describe('Jupiter gravitational slingshot simulation', () => {
    it('starts with a visible route to correct and serializable state', () => {
        const state = createSlingshotState();
        expect(state).toMatchObject({
            phase: 'planning', event: null, boostProgress: 0,
            angleError: expect.any(Number), flybyDistance: expect.any(Number)
        });
        expect(() => JSON.stringify(state)).not.toThrow();
    });

    it('adjusts approach angle and flyby distance deterministically', () => {
        const state = createSlingshotState({ angleError: -0.5, flybyDistance: 0.8 });
        const first = stepSlingshot(state, { horizontal: 1, vertical: -1 }, 0.05);
        const second = stepSlingshot(state, { horizontal: 1, vertical: -1 }, 0.05);
        expect(first).toEqual(second);
        expect(first.angleError).toBeGreaterThan(state.angleError);
        expect(first.flybyDistance).toBeLessThan(state.flybyDistance);
    });

    it('clamps long frames and control bounds', () => {
        const state = createSlingshotState({ angleError: 0.99, flybyDistance: 0.01 });
        expect(stepSlingshot(state, { horizontal: 1, vertical: -1 }, 5))
            .toEqual(stepSlingshot(state, { horizontal: 1, vertical: -1 }, SLINGSHOT_LIMITS.maxDeltaSeconds));
    });

    it('warns when the chosen pass is too close and does not build boost', () => {
        const state = createSlingshotState({ angleError: 0, flybyDistance: 0.12 });
        const result = stepSlingshot(state, { commit: true }, 0.05);
        expect(result.event).toBe('heat-warning');
        expect(result.boostProgress).toBe(0);
        expect(getSlingshotTelemetry(result).secondarySafe).toBe(false);
    });

    it('starts the gravity boost only inside the safe corridor', () => {
        const state = createSlingshotState({ angleError: 0.02, flybyDistance: 0.5 });
        const result = stepSlingshot(state, { commit: true }, 0.05);
        expect(result.event).toBe('slingshot-boost');
        expect(result.boostProgress).toBeGreaterThan(0);
        expect(getSlingshotTelemetry(result)).toMatchObject({
            primarySafe: true, secondarySafe: true, speedGain: expect.any(Number)
        });
    });

    it('completes after holding a safe route long enough', () => {
        const state = createSlingshotState({
            angleError: 0,
            flybyDistance: 0.5,
            boostProgress: SLINGSHOT_LIMITS.requiredBoostSeconds - 0.02
        });
        const result = stepSlingshot(state, { commit: true }, 0.05);
        expect(result.phase).toBe('complete');
        expect(result.event).toBe('slingshot-complete');
        expect(getSlingshotTelemetry(result)).toMatchObject({ speedGain: 14, tertiarySafe: true });
        expect(stepSlingshot(result, {}, 0.05)).toMatchObject({
            phase: 'complete', event: null
        });
    });
});
