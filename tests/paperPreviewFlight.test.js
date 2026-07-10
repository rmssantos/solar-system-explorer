import { describe, expect, it } from 'vitest';
import {
    DEPTH_LAYERS,
    FLIGHT_BOUNDS,
    MAX_SPEED,
    PLANET_ANCHORS,
    createFlightState,
    cycleDepthLayer,
    findNearbyPlanet,
    stepFlight
} from '../paper-preview/src/flightSimulation.js';
import { createPreviewState, explorePlanet } from '../paper-preview/src/state.js';

const idleInput = Object.freeze({ moveX: 0, moveY: 0 });

describe('Paper flight simulation', () => {
    it('starts stationary inside the world on the middle paper layer', () => {
        const state = createFlightState();

        expect(state.velocity).toEqual({ x: 0, y: 0 });
        expect(state.depthLayer).toBe(1);
        expect(state.position.z).toBe(DEPTH_LAYERS[1]);
        expect(state.position.x).toBeGreaterThan(FLIGHT_BOUNDS.minX);
        expect(state.position.x).toBeLessThan(FLIGHT_BOUNDS.maxX);
        expect(state.nearbyPlanetKey).toBe('sun');
    });

    it('accelerates, caps speed, then damps without input', () => {
        let state = createFlightState();
        for (let index = 0; index < 180; index += 1) {
            state = stepFlight(state, { moveX: 1, moveY: 1 }, 1 / 60);
        }

        const speed = Math.hypot(state.velocity.x, state.velocity.y);
        expect(state.position.x).toBeGreaterThan(createFlightState().position.x);
        expect(state.position.y).toBeGreaterThan(createFlightState().position.y);
        expect(speed).toBeLessThanOrEqual(MAX_SPEED + 0.0001);

        const beforeCoast = speed;
        const coasted = stepFlight(state, idleInput, 0.5);
        expect(Math.hypot(coasted.velocity.x, coasted.velocity.y)).toBeLessThan(beforeCoast);
    });

    it('clamps position at world edges and cancels outward velocity', () => {
        const state = {
            ...createFlightState(),
            position: { x: FLIGHT_BOUNDS.maxX - 0.01, y: FLIGHT_BOUNDS.maxY - 0.01, z: 0 },
            velocity: { x: MAX_SPEED, y: MAX_SPEED }
        };
        const result = stepFlight(state, { moveX: 1, moveY: 1 }, 0.5);

        expect(result.position.x).toBe(FLIGHT_BOUNDS.maxX);
        expect(result.position.y).toBe(FLIGHT_BOUNDS.maxY);
        expect(result.velocity).toEqual({ x: 0, y: 0 });
    });

    it('cycles between three depth layers and approaches the selected Z', () => {
        const initial = createFlightState();
        const front = cycleDepthLayer(cycleDepthLayer(initial, 1), 1);
        const clampedFront = cycleDepthLayer(front, 1);
        const stepped = stepFlight(front, idleInput, 0.5);
        const back = cycleDepthLayer(cycleDepthLayer(clampedFront, -1), -1);

        expect(front.depthLayer).toBe(2);
        expect(clampedFront.depthLayer).toBe(2);
        expect(stepped.position.z).toBeGreaterThan(initial.position.z);
        expect(stepped.position.z).toBeLessThanOrEqual(DEPTH_LAYERS[2]);
        expect(back.depthLayer).toBe(0);
    });

    it('finds only planets inside their discovery radius', () => {
        expect(findNearbyPlanet(PLANET_ANCHORS.earth)).toBe('earth');
        expect(findNearbyPlanet({ x: FLIGHT_BOUNDS.maxX, y: FLIGHT_BOUNDS.maxY, z: DEPTH_LAYERS[2] })).toBe(null);
    });
});

describe('Proximity exploration state', () => {
    it('opens the requested planet and completes only Saturn', () => {
        const earth = explorePlanet(createPreviewState(), 'earth');
        const saturn = explorePlanet(createPreviewState(), 'saturn');

        expect(earth.notebook).toEqual({ open: true, planetKey: 'earth' });
        expect(earth.missionComplete).toBe(false);
        expect(saturn.notebook).toEqual({ open: true, planetKey: 'saturn' });
        expect(saturn.missionComplete).toBe(true);
    });
});
