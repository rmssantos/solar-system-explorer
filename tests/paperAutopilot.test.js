import { describe, expect, it } from 'vitest';
import { createAutopilot, stepAutopilot } from '../paper-preview/src/navigation/autopilot.js';

const flight = Object.freeze({
    position: { x: 0, y: 0, z: 14 },
    velocity: { x: 0, y: 0, z: 0 },
    orientation: { yaw: 0, pitch: 0, roll: 0 },
    nearbyPlanetKey: null
});

describe('paper flight autopilot', () => {
    it('travels in 3D toward a moving target and stops at a safe exploration radius', () => {
        let state = flight;
        let autopilot = createAutopilot('saturn', state.position, { x: 40, y: 8, z: -30 }, 6.8);
        let target = { x: 40, y: 8, z: -30 };
        for (let index = 0; index < 600 && autopilot; index += 1) {
            target = { x: 40 + index * 0.002, y: 8, z: -30 };
            ({ flightState: state, autopilot } = stepAutopilot(state, autopilot, target, 1 / 60));
        }

        const distance = Math.hypot(state.position.x - target.x, state.position.y - target.y, state.position.z - target.z);
        expect(autopilot).toBeNull();
        expect(distance).toBeGreaterThanOrEqual(6.7);
        expect(distance).toBeLessThan(7.1);
        expect(state.velocity).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('faces the direction of travel and adds a playful bank during the journey', () => {
        const autopilot = createAutopilot('europa', flight.position, { x: 20, y: 10, z: -20 }, 2.2);
        const result = stepAutopilot(flight, autopilot, { x: 20, y: 10, z: -20 }, 0.25);
        expect(result.flightState.position.x).toBeGreaterThan(0);
        expect(result.flightState.position.y).toBeGreaterThan(0);
        expect(result.flightState.position.z).toBeLessThan(14);
        expect(result.flightState.orientation.yaw).toBeLessThan(0);
        const visualForward = {
            x: -Math.sin(result.flightState.orientation.yaw) * Math.cos(result.flightState.orientation.pitch),
            y: Math.sin(result.flightState.orientation.pitch),
            z: -Math.cos(result.flightState.orientation.yaw) * Math.cos(result.flightState.orientation.pitch)
        };
        const speed = Math.hypot(
            result.flightState.velocity.x,
            result.flightState.velocity.y,
            result.flightState.velocity.z
        );
        const alignment = (
            visualForward.x * result.flightState.velocity.x
            + visualForward.y * result.flightState.velocity.y
            + visualForward.z * result.flightState.velocity.z
        ) / speed;
        expect(alignment).toBeGreaterThan(0.85);
        expect(Math.abs(result.flightState.orientation.roll)).toBeGreaterThan(0);
        expect(result.autopilot.progress).toBeGreaterThan(0);
    });

    it('uses an outward paper arc instead of cutting straight through the Sun', () => {
        let state = flight;
        let autopilot = createAutopilot('earth', state.position, { x: 34, y: 0, z: -22 }, 3.4);
        let closestToSun = Infinity;
        for (let index = 0; index < 600 && autopilot; index += 1) {
            ({ flightState: state, autopilot } = stepAutopilot(state, autopilot, { x: 34, y: 0, z: -22 }, 1 / 60));
            closestToSun = Math.min(closestToSun, Math.hypot(state.position.x, state.position.y, state.position.z));
        }
        expect(autopilot).toBeNull();
        expect(closestToSun).toBeGreaterThan(4.2);
    });
});
