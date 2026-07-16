import { describe, expect, it } from 'vitest';
import {
    DOCKING_LIMITS,
    createDockingState,
    getDockingTelemetry,
    stepDocking
} from '../paper-preview/src/minigames/dockingSimulation.js';
import { getOrbitalMissionProfile } from '../paper-preview/src/minigames/orbitalMissionProfiles.js';

describe('ISS docking simulation', () => {
    it('starts on a calm approach with serializable state', () => {
        const state = createDockingState();
        expect(state).toMatchObject({
            phase: 'approach',
            attempts: 0,
            event: null,
            position: { x: expect.any(Number), y: expect.any(Number) },
            velocity: { x: expect.any(Number), y: expect.any(Number) }
        });
        expect(() => JSON.stringify(state)).not.toThrow();
    });

    it('applies translation and rotation thrust deterministically', () => {
        const state = createDockingState({
            position: { x: -7, y: 0 },
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0
        });
        const first = stepDocking(state, { horizontal: 1, vertical: -1, rotation: 1 }, 0.05);
        const second = stepDocking(state, { horizontal: 1, vertical: -1, rotation: 1 }, 0.05);

        expect(first).toEqual(second);
        expect(first.position.x).toBeGreaterThan(state.position.x);
        expect(first.position.y).toBeLessThan(state.position.y);
        expect(first.angle).toBeGreaterThan(state.angle);
    });

    it('clamps long frame deltas and flight bounds', () => {
        const state = createDockingState({
            position: { x: -8.95, y: 4.95 },
            velocity: { x: -20, y: 20 }
        });
        const longFrame = stepDocking(state, {}, 5);
        const clampedFrame = stepDocking(state, {}, DOCKING_LIMITS.maxDeltaSeconds);

        expect(longFrame).toEqual(clampedFrame);
        expect(longFrame.position.x).toBeGreaterThanOrEqual(DOCKING_LIMITS.minX);
        expect(longFrame.position.y).toBeLessThanOrEqual(DOCKING_LIMITS.maxY);
    });

    it('docks only with safe position, speed and alignment', () => {
        const safe = createDockingState({
            position: { x: -0.34, y: 0.1 },
            velocity: { x: 0.2, y: 0.05 },
            angle: 0.04,
            angularVelocity: 0.01
        });
        const result = stepDocking(safe, {}, 0.05);

        expect(result.phase).toBe('docked');
        expect(result.event).toBe('docked');
        expect(result.velocity).toEqual({ x: 0, y: 0 });
    });

    it('assists recovery after an unsafe contact without a game-over state', () => {
        const unsafe = createDockingState({
            position: { x: -0.34, y: 1.2 },
            velocity: { x: 2.4, y: 0 },
            angle: 0.4
        });
        const result = stepDocking(unsafe, {}, 0.05);

        expect(result.phase).toBe('approach');
        expect(result.event).toBe('unsafe-contact');
        expect(result.attempts).toBe(1);
        expect(result.position.x).toBeLessThan(-4);
        expect(Math.abs(result.position.y)).toBeLessThanOrEqual(2);
    });

    it('stabilizes linear and angular velocity', () => {
        const state = createDockingState({
            velocity: { x: 1.5, y: -1 },
            angularVelocity: 0.8
        });
        const drifting = stepDocking(state, {}, 0.05);
        const stabilizing = stepDocking(state, { stabilize: true }, 0.05);

        expect(Math.hypot(stabilizing.velocity.x, stabilizing.velocity.y))
            .toBeLessThan(Math.hypot(drifting.velocity.x, drifting.velocity.y));
        expect(Math.abs(stabilizing.angularVelocity)).toBeLessThan(Math.abs(drifting.angularVelocity));
    });

    it('reports readable safety telemetry', () => {
        const telemetry = getDockingTelemetry(createDockingState({
            position: { x: -2, y: 0.2 },
            velocity: { x: 0.3, y: 0.1 },
            angle: 0.05
        }));

        expect(telemetry).toMatchObject({
            distance: expect.any(Number),
            relativeSpeed: expect.any(Number),
            alignmentDegrees: expect.any(Number),
            corridorSafe: true,
            speedSafe: true,
            alignmentSafe: true
        });
    });

    it('adds deterministic orbital drift only to the Hubble approach', () => {
        const state = createDockingState({
            elapsedSeconds: 1,
            position: { x: -7, y: 0 },
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0
        });
        const iss = stepDocking(state, {}, 0.05, getOrbitalMissionProfile('iss-docking'));
        const hubble = stepDocking(state, {}, 0.05, getOrbitalMissionProfile('hubble-service'));

        expect(iss.velocity.y).toBe(0);
        expect(hubble.velocity.y).not.toBe(0);
        expect(stepDocking(state, {}, 0.05, getOrbitalMissionProfile('hubble-service'))).toEqual(hubble);
    });
});

