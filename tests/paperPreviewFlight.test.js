import { describe, expect, it } from 'vitest';
import {
    BOOST_MAX_SPEED,
    FLIGHT_BOUNDS,
    MAX_SPEED,
    PLANET_ANCHORS,
    createFlightState,
    findNearbyPlanet,
    stepFlight
} from '../paper-preview/src/flightSimulation.js';
import { normalizeJoystick } from '../paper-preview/src/flightInput.js';
import { createPreviewState, explorePlanet } from '../paper-preview/src/state.js';

const idleInput = Object.freeze({
    forward: 0,
    strafe: 0,
    vertical: 0,
    yawDelta: 0,
    pitchDelta: 0,
    roll: 0,
    boost: false,
    brake: false
});

function stepMany(state, input, frames = 60) {
    let current = state;
    for (let index = 0; index < frames; index += 1) current = stepFlight(current, input, 1 / 60);
    return current;
}

describe('Full 3D paper flight simulation', () => {
    it('starts stationary with a complete 3D orientation inside the world', () => {
        const state = createFlightState();

        expect(state.velocity).toEqual({ x: 0, y: 0, z: 0 });
        expect(state.orientation).toEqual({ yaw: 0, pitch: 0, roll: 0 });
        expect(state.position.x).toBeGreaterThan(FLIGHT_BOUNDS.minX);
        expect(state.position.z).toBeLessThan(FLIGHT_BOUNDS.maxZ);
        expect(state.nearbyPlanetKey).toBe(null);
    });

    it('moves forward along camera heading and strafes camera-right', () => {
        const initial = createFlightState();
        const forward = stepMany(initial, { ...idleInput, forward: 1 });
        const rightFacing = { ...initial, orientation: { ...initial.orientation, yaw: Math.PI / 2 } };
        const turnedForward = stepMany(rightFacing, { ...idleInput, forward: 1 });
        const strafed = stepMany(initial, { ...idleInput, strafe: 1 });

        expect(forward.position.z).toBeLessThan(initial.position.z);
        expect(Math.abs(forward.position.x - initial.position.x)).toBeLessThan(0.001);
        expect(turnedForward.position.x).toBeGreaterThan(initial.position.x);
        expect(strafed.position.x).toBeGreaterThan(initial.position.x);
    });

    it('uses pitch for forward elevation and world Y for vertical thrust', () => {
        const initial = createFlightState();
        const pitched = {
            ...initial,
            orientation: { ...initial.orientation, pitch: Math.PI / 4 }
        };
        const pitchedForward = stepMany(pitched, { ...idleInput, forward: 1 });
        const vertical = stepMany(initial, { ...idleInput, vertical: 1 });

        expect(pitchedForward.position.y).toBeGreaterThan(initial.position.y);
        expect(pitchedForward.position.z).toBeLessThan(initial.position.z);
        expect(vertical.position.y).toBeGreaterThan(initial.position.y);
        expect(Math.abs(vertical.position.z - initial.position.z)).toBeLessThan(0.001);
    });

    it('caps normal speed, raises the cap while boosting and damps while idle', () => {
        const normal = stepMany(createFlightState(), { ...idleInput, forward: 1 }, 240);
        const boosted = stepMany(createFlightState(), { ...idleInput, forward: 1, boost: true }, 240);
        const normalSpeed = Math.hypot(normal.velocity.x, normal.velocity.y, normal.velocity.z);
        const boostSpeed = Math.hypot(boosted.velocity.x, boosted.velocity.y, boosted.velocity.z);
        const coasted = stepFlight(normal, idleInput, 0.5);

        expect(normalSpeed).toBeLessThanOrEqual(MAX_SPEED + 0.0001);
        expect(boostSpeed).toBeGreaterThan(normalSpeed);
        expect(boostSpeed).toBeLessThanOrEqual(BOOST_MAX_SPEED + 0.0001);
        expect(Math.hypot(coasted.velocity.x, coasted.velocity.y, coasted.velocity.z)).toBeLessThan(normalSpeed);
    });

    it('wraps yaw, clamps pitch, changes roll and brakes', () => {
        const moving = stepMany(createFlightState(), { ...idleInput, forward: 1 }, 60);
        const changed = stepFlight(moving, {
            ...idleInput,
            yawDelta: (Math.PI * 2) + 0.25,
            pitchDelta: Math.PI,
            roll: 1,
            brake: true
        }, 0.25);

        expect(changed.orientation.yaw).toBeGreaterThanOrEqual(-Math.PI);
        expect(changed.orientation.yaw).toBeLessThanOrEqual(Math.PI);
        expect(changed.orientation.pitch).toBeLessThan(Math.PI / 2);
        expect(changed.orientation.roll).toBeGreaterThan(0);
        expect(Math.hypot(changed.velocity.x, changed.velocity.y, changed.velocity.z))
            .toBeLessThan(Math.hypot(moving.velocity.x, moving.velocity.y, moving.velocity.z));
    });

    it('clamps all world axes and cancels outward velocity', () => {
        const initial = createFlightState();
        const edgeState = {
            ...initial,
            position: {
                x: FLIGHT_BOUNDS.maxX - 0.01,
                y: FLIGHT_BOUNDS.maxY - 0.01,
                z: FLIGHT_BOUNDS.maxZ - 0.01
            },
            velocity: { x: MAX_SPEED, y: MAX_SPEED, z: MAX_SPEED }
        };
        const result = stepFlight(edgeState, idleInput, 0.5);

        expect(result.position).toEqual({
            x: FLIGHT_BOUNDS.maxX,
            y: FLIGHT_BOUNDS.maxY,
            z: FLIGHT_BOUNDS.maxZ
        });
        expect(result.velocity).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('finds only planets inside their real 3D discovery radius', () => {
        expect(findNearbyPlanet(PLANET_ANCHORS.earth)).toBe('earth');
        expect(findNearbyPlanet({
            x: FLIGHT_BOUNDS.maxX,
            y: FLIGHT_BOUNDS.maxY,
            z: FLIGHT_BOUNDS.maxZ
        })).toBe(null);
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

describe('Paper flight input', () => {
    it('normalizes joystick intent with a dead zone and unit clamp', () => {
        expect(normalizeJoystick(2, 2, 60)).toEqual({ x: 0, y: 0 });
        expect(normalizeJoystick(60, 0, 60)).toEqual({ x: 1, y: 0 });

        const diagonal = normalizeJoystick(60, 60, 60);
        expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(1, 6);
        expect(diagonal.x).toBeCloseTo(diagonal.y, 6);
        expect(normalizeJoystick(30, -40, 50)).toEqual({ x: 0.6, y: -0.8 });
    });
});
