import { describe, expect, it } from 'vitest';
import {
    createFlightState,
    findNearbyPlanet,
    stepFlight
} from '../paper-preview/src/flightSimulation.js';

const idleInput = Object.freeze({
    forward: 0, strafe: 0, vertical: 0, yawDelta: 0, pitchDelta: 0,
    roll: 0, boost: false, brake: false
});

function body(key, x, y, z, collisionRadius = 2, interactionRadius = 3) {
    return Object.freeze({
        key,
        position: Object.freeze({ x, y, z }),
        collisionRadius,
        interactionRadius
    });
}

describe('dynamic orbital bodies in flight simulation', () => {
    it('finds a planet at its current snapshot position rather than a historical anchor', () => {
        const movingEarth = body('earth', -24, 3, 18);
        expect(findNearbyPlanet({ x: -23, y: 3, z: 18 }, [movingEarth])).toBe('earth');
        expect(findNearbyPlanet({ x: 34, y: 3, z: -22 }, [movingEarth])).toBe(null);
    });

    it('resolves collision against a dynamically supplied planet position', () => {
        const movingMars = body('mars', -20, 0, 12, 2, 3);
        const state = {
            ...createFlightState(),
            position: { x: -20, y: 0, z: 14.05 },
            velocity: { x: 0.6, y: 0, z: -8 }
        };
        const result = stepFlight(state, idleInput, 0.25, [movingMars]);
        const offset = {
            x: result.position.x - movingMars.position.x,
            y: result.position.y - movingMars.position.y,
            z: result.position.z - movingMars.position.z
        };
        const distance = Math.hypot(offset.x, offset.y, offset.z);
        const inward = result.velocity.x * offset.x
            + result.velocity.y * offset.y
            + result.velocity.z * offset.z;
        expect(distance).toBeGreaterThanOrEqual(1.9999);
        expect(inward).toBeGreaterThanOrEqual(-0.0001);
    });

    it('does not collide with a body after its snapshot has moved away', () => {
        const state = {
            ...createFlightState(),
            position: { x: 0, y: 0, z: 2.1 },
            velocity: { x: 0, y: 0, z: -2 }
        };
        const movedSun = body('sun', 50, 0, 0, 4.2, 5.2);
        const result = stepFlight(state, idleInput, 0.1, [movedSun]);
        expect(result.position.z).toBeLessThan(state.position.z);
    });
});
