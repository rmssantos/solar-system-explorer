import { describe, expect, it } from 'vitest';
import {
    SWEEP_LIMITS,
    createSweepState,
    getSweepTelemetry,
    stepSweep
} from '../paper-preview/src/minigames/sweepSimulation.js';

describe('lunar transmitter sweep simulation', () => {
    it('starts with four transmitters, three shield layers and serializable state', () => {
        const state = createSweepState();

        expect(state).toMatchObject({ phase: 'sweeping', shield: 3, event: null });
        expect(state.transmitters).toHaveLength(4);
        expect(state.transmitters.every((item) => item.collected === false)).toBe(true);
        expect(() => JSON.stringify(state)).not.toThrow();
    });

    it('applies directional thrust deterministically', () => {
        const state = createSweepState({ position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } });
        const first = stepSweep(state, { horizontal: 1, vertical: -1 }, 0.05);
        const second = stepSweep(state, { horizontal: 1, vertical: -1 }, 0.05);

        expect(first).toEqual(second);
        expect(first.position.x).toBeGreaterThan(0);
        expect(first.position.y).toBeLessThan(0);
    });

    it('clamps long frame deltas and keeps the ship inside the playfield', () => {
        const state = createSweepState({
            position: { x: SWEEP_LIMITS.maxX - 0.01, y: SWEEP_LIMITS.minY + 0.01 },
            velocity: { x: 20, y: -20 }
        });

        expect(stepSweep(state, {}, 5)).toEqual(stepSweep(state, {}, SWEEP_LIMITS.maxDeltaSeconds));
        const result = stepSweep(state, {}, 5);
        expect(result.position.x).toBeLessThanOrEqual(SWEEP_LIMITS.maxX);
        expect(result.position.y).toBeGreaterThanOrEqual(SWEEP_LIMITS.minY);
    });

    it('collects a transmitter when the ship crosses its signal', () => {
        const state = createSweepState({
            position: { x: -0.31, y: 0.18 },
            velocity: { x: 0, y: 0 }
        });
        const result = stepSweep(state, {}, 0.01);

        expect(result.event).toBe('transmitter-collected');
        expect(result.transmitters[0].collected).toBe(true);
        expect(getSweepTelemetry(result).collected).toBe(1);
    });

    it('uses an assisted reset and shield after touching debris', () => {
        const state = createSweepState({
            position: { x: -0.05, y: -0.42 },
            velocity: { x: 0, y: 0 }
        });
        const result = stepSweep(state, {}, 0.01);

        expect(result.event).toBe('debris-hit');
        expect(result.shield).toBe(2);
        expect(result.position.x).toBeLessThan(-0.5);
        expect(result.invulnerabilitySeconds).toBeGreaterThan(0);
    });

    it('stabilizes velocity without changing mission progress', () => {
        const state = createSweepState({ velocity: { x: 1.2, y: -0.8 } });
        const drifting = stepSweep(state, {}, 0.05);
        const stabilizing = stepSweep(state, { stabilize: true }, 0.05);

        expect(Math.hypot(stabilizing.velocity.x, stabilizing.velocity.y))
            .toBeLessThan(Math.hypot(drifting.velocity.x, drifting.velocity.y));
        expect(stabilizing.transmitters).toEqual(drifting.transmitters);
    });

    it('completes after the last transmitter and exposes generic telemetry', () => {
        const state = createSweepState({
            position: { x: 0.61, y: 0.17 },
            velocity: { x: 0, y: 0 },
            transmitters: [
                { id: 'luna-1', x: -0.32, y: 0.18, collected: true },
                { id: 'luna-2', x: 0.12, y: -0.12, collected: true },
                { id: 'luna-3', x: 0.34, y: 0.48, collected: true },
                { id: 'luna-4', x: 0.62, y: 0.18, collected: false }
            ]
        });
        const result = stepSweep(state, {}, 0.01);

        expect(result.phase).toBe('complete');
        expect(result.event).toBe('sweep-complete');
        expect(getSweepTelemetry(result)).toMatchObject({
            collected: 4,
            total: 4,
            shield: 3,
            primary: expect.any(Number),
            secondary: expect.any(Number),
            tertiary: expect.any(Number)
        });
    });
});
