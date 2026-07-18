import { describe, expect, it } from 'vitest';
import {
    ICE_RADAR_LIMITS,
    createIceRadarState,
    getIceRadarTelemetry,
    stepIceRadar
} from '../paper-preview/src/minigames/iceRadarSimulation.js';

describe('Europa ice radar simulation', () => {
    it('starts cool with three uncovered fissure passes', () => {
        const state = createIceRadarState();
        expect(state).toMatchObject({ phase: 'scanning', heat: 0, scanning: false, passProgress: [0, 0, 0] });
        expect(getIceRadarTelemetry(state)).toMatchObject({ coverage: 0, heat: 0, echoConfidence: expect.any(Number) });
    });

    it('moves the radar strip and adjusts power within safe limits', () => {
        const state = createIceRadarState();
        const result = stepIceRadar(state, { horizontal: 1, vertical: 1 }, 1);
        expect(result.position).toBeGreaterThan(state.position);
        expect(result.power).toBeGreaterThan(state.power);
        expect(result.position).toBeLessThanOrEqual(ICE_RADAR_LIMITS.maxPosition);
        expect(result.power).toBeLessThanOrEqual(1);
    });

    it('reveals only the pass under the radar beam', () => {
        const state = createIceRadarState({ position: -0.62, power: 0.7 });
        const result = stepIceRadar(state, { scan: true }, 0.25);
        expect(result.passProgress[0]).toBeGreaterThan(0);
        expect(result.passProgress[1]).toBe(0);
        expect(result.heat).toBeGreaterThan(0);
    });

    it('overheats safely, pauses scanning and cools without losing the map', () => {
        const state = createIceRadarState({
            position: 0, power: 1, heat: 0.94, passProgress: [0.4, 0.3, 0]
        });
        const hot = stepIceRadar(state, { scan: true }, 0.25);
        expect(hot.event).toBe('radar-overheat');
        expect(hot.scanning).toBe(false);
        expect(hot.passProgress[0]).toBeGreaterThanOrEqual(0.4);
        const cooled = stepIceRadar(hot, {}, 0.25);
        expect(cooled.heat).toBeLessThan(hot.heat);
        expect(cooled.passProgress).toEqual(hot.passProgress);
    });

    it('cannot finish the final radar pass on the frame that overheats', () => {
        const state = createIceRadarState({
            position: 0.62, power: 1, heat: 0.94, passProgress: [1, 1, 0.99]
        });
        const hot = stepIceRadar(state, { scan: true }, 0.25);
        expect(hot.phase).toBe('scanning');
        expect(hot.event).toBe('radar-overheat');
        expect(hot.passProgress).toEqual([1, 1, 0.99]);
    });

    it('completes after all three echoes are mapped', () => {
        const state = createIceRadarState({
            position: 0.62, power: 0.8, heat: 0.2, passProgress: [1, 1, 0.94]
        });
        const result = stepIceRadar(state, { scan: true }, 0.25);
        expect(result.phase).toBe('complete');
        expect(result.event).toBe('ice-map-complete');
        expect(getIceRadarTelemetry(result)).toMatchObject({
            coverage: 1, echoConfidence: 1, primarySafe: true, secondarySafe: true, tertiarySafe: true
        });
    });

    it('sanitizes restores and stays idempotent when complete', () => {
        const state = createIceRadarState({ phase: 'complete', heat: Number.NaN, passProgress: [9, -2, 1] });
        expect(state.passProgress).toEqual([1, 0, 1]);
        expect(stepIceRadar(state, { scan: true }, 1)).toEqual(state);
        expect(Object.isFrozen(state.passProgress)).toBe(true);
    });
});
