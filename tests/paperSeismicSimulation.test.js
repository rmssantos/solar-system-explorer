import { describe, expect, it } from 'vitest';
import {
    SEISMIC_LIMITS,
    createSeismicState,
    getSeismicTelemetry,
    stepSeismic
} from '../paper-preview/src/minigames/seismicSimulation.js';

function tap(state, input = {}) {
    const pressed = stepSeismic(state, { ...input, activate: true }, 0.016);
    return stepSeismic(pressed, { ...input, activate: false }, 0.016);
}

describe('lunar seismology simulation', () => {
    it('starts with a movable cursor and no placed sensors', () => {
        const state = createSeismicState();
        expect(state).toMatchObject({ phase: 'placing', sensors: [], event: null, actionHeld: false });
        expect(state.cursor.x).toBeGreaterThanOrEqual(SEISMIC_LIMITS.minX);
        expect(getSeismicTelemetry(state)).toMatchObject({
            sensorsPlaced: 0, total: 3, signalClarity: 0, triangulation: 0
        });
    });

    it('places three separated sensors and advances to timing alignment', () => {
        let state = createSeismicState({ cursor: { x: -0.65, y: -0.3 } });
        state = tap(state);
        state = stepSeismic(state, { horizontal: 1 }, 0.5);
        state = tap(state);
        state = stepSeismic(state, { vertical: 1 }, 0.5);
        state = tap(state);

        expect(state.sensors).toHaveLength(3);
        expect(state.phase).toBe('aligning');
        expect(state.event).toBeNull();
        expect(getSeismicTelemetry(state).sensorsPlaced).toBe(3);
    });

    it('rejects a clustered sensor without punishment', () => {
        let state = createSeismicState({ cursor: { x: 0, y: 0 } });
        state = tap(state);
        const clustered = tap(state);
        expect(clustered.sensors).toHaveLength(1);
        expect(clustered.event).toBeNull();
        const feedback = stepSeismic(state, { activate: true }, 0.016);
        expect(feedback.event).toBe('sensor-too-close');
        expect(feedback.attempts).toBe(0);
    });

    it('aligns the common pulse before asking for its source', () => {
        let state = createSeismicState({
            phase: 'aligning',
            sensors: [{ id: 's1', x: -0.6, y: 0 }, { id: 's2', x: 0, y: 0.5 }, { id: 's3', x: 0.6, y: 0 }],
            alignmentOffset: 0.08
        });
        state = tap(state);
        expect(state.phase).toBe('classifying');
        expect(getSeismicTelemetry(state).signalClarity).toBeGreaterThan(0.85);
    });

    it('gives corrective feedback and completes on the shared impact', () => {
        let state = createSeismicState({
            phase: 'classifying', selectedImpact: 0,
            sensors: [{ id: 's1', x: -0.6, y: 0 }, { id: 's2', x: 0, y: 0.5 }, { id: 's3', x: 0.6, y: 0 }]
        });
        const wrong = stepSeismic(state, { activate: true }, 0.016);
        expect(wrong.event).toBe('wrong-pulse');
        expect(wrong.phase).toBe('classifying');
        state = stepSeismic(wrong, { activate: false }, 0.016);
        state = stepSeismic(state, { horizontal: 1 }, 0.6);
        state = tap(state);
        expect(state.phase).toBe('complete');
        expect(getSeismicTelemetry(state)).toMatchObject({
            signalClarity: 1, triangulation: 1, primarySafe: true, secondarySafe: true, tertiarySafe: true
        });
    });

    it('is immutable and idempotent after completion', () => {
        const state = createSeismicState({ phase: 'complete' });
        const result = stepSeismic(state, { horizontal: 1, activate: true }, 1);
        expect(result).toEqual(state);
        expect(Object.isFrozen(result)).toBe(true);
    });
});
