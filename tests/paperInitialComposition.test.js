import { describe, expect, it } from 'vitest';
import { createFlightState } from '../paper-preview/src/flightSimulation.js';

describe('paper explorer opening composition', () => {
    it('starts far enough from the Sun to reveal the surrounding system', () => {
        const state = createFlightState();
        const distanceFromSun = Math.hypot(state.position.x, state.position.y, state.position.z);
        expect(distanceFromSun).toBeGreaterThanOrEqual(12);
        expect(distanceFromSun).toBeLessThan(20);
    });
});
