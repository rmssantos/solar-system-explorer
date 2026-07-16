import { describe, expect, it } from 'vitest';
import {
    SIGNAL_LIMITS,
    createSignalState,
    getSignalTelemetry,
    stepSignal
} from '../paper-preview/src/minigames/signalSimulation.js';

describe('Mars relay signal simulation', () => {
    it('starts out of tune with serializable calibration state', () => {
        const state = createSignalState();

        expect(state).toMatchObject({
            phase: 'tuning', event: null, lockSeconds: 0,
            angleError: expect.any(Number), frequencyError: expect.any(Number)
        });
        expect(() => JSON.stringify(state)).not.toThrow();
    });

    it('adjusts angle and frequency deterministically', () => {
        const state = createSignalState({ angleError: -0.4, frequencyError: 0.5 });
        const first = stepSignal(state, { horizontal: 1, vertical: -1 }, 0.05);
        const second = stepSignal(state, { horizontal: 1, vertical: -1 }, 0.05);

        expect(first).toEqual(second);
        expect(first.angleError).toBeGreaterThan(state.angleError);
        expect(first.frequencyError).toBeLessThan(state.frequencyError);
    });

    it('clamps long frames and tuning bounds', () => {
        const state = createSignalState({ angleError: 0.99, frequencyError: -0.99 });
        const longFrame = stepSignal(state, { horizontal: 1, vertical: -1 }, 5);
        const shortFrame = stepSignal(state, { horizontal: 1, vertical: -1 }, SIGNAL_LIMITS.maxDeltaSeconds);

        expect(longFrame).toEqual(shortFrame);
        expect(Math.abs(longFrame.angleError)).toBeLessThanOrEqual(SIGNAL_LIMITS.maxError);
        expect(Math.abs(longFrame.frequencyError)).toBeLessThanOrEqual(SIGNAL_LIMITS.maxError);
    });

    it('builds lock only while transmitting inside both target bands', () => {
        const tuned = createSignalState({ angleError: 0.02, frequencyError: -0.03 });
        const transmitting = stepSignal(tuned, { transmit: true }, 0.05);
        const waiting = stepSignal(tuned, {}, 0.05);
        const mistuned = stepSignal(createSignalState({ angleError: 0.5, frequencyError: 0 }), { transmit: true }, 0.05);

        expect(transmitting.lockSeconds).toBeGreaterThan(0);
        expect(waiting.lockSeconds).toBe(0);
        expect(mistuned.lockSeconds).toBe(0);
    });

    it('lets the signal lock decay gently when calibration slips', () => {
        const state = createSignalState({ angleError: 0.4, frequencyError: 0, lockSeconds: 1 });
        const result = stepSignal(state, { transmit: true }, 0.05);

        expect(result.lockSeconds).toBeGreaterThan(0);
        expect(result.lockSeconds).toBeLessThan(1);
    });

    it('completes after holding a stable signal for the required duration', () => {
        const state = createSignalState({
            angleError: 0,
            frequencyError: 0,
            lockSeconds: SIGNAL_LIMITS.requiredLockSeconds - 0.02
        });
        const result = stepSignal(state, { transmit: true }, 0.05);

        expect(result.phase).toBe('complete');
        expect(result.event).toBe('signal-complete');
        expect(getSignalTelemetry(result)).toMatchObject({
            anglePercent: 1,
            frequencyPercent: 1,
            lockPercent: 1,
            primary: expect.any(Number),
            secondary: expect.any(Number),
            tertiary: 1
        });
    });
});
