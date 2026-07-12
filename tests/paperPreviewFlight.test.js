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
import { createFlightInput, normalizeJoystick } from '../paper-preview/src/flightInput.js';
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

    it('curves forward velocity toward the camera while W remains pressed', () => {
        const initial = {
            ...createFlightState(),
            position: { x: 30, y: 0, z: 10 }
        };
        const movingForward = stepMany(initial, { ...idleInput, forward: 1 }, 120);
        const turned = stepMany(movingForward, {
            ...idleInput,
            forward: 1,
            yawDelta: Math.PI / 2
        }, 1);
        const settledIntoTurn = stepMany(turned, { ...idleInput, forward: 1 }, 14);

        expect(settledIntoTurn.orientation.yaw).toBeCloseTo(Math.PI / 2, 6);
        expect(settledIntoTurn.velocity.x).toBeGreaterThan(Math.abs(settledIntoTurn.velocity.z));
    });

    it('uses the rendered camera basis as the movement authority', () => {
        const initial = {
            ...createFlightState(),
            position: { x: 30, y: 0, z: 10 }
        };
        const moved = stepMany(initial, {
            ...idleInput,
            forward: 1,
            movementBasis: {
                forward: { x: 1, y: 0, z: 0 },
                right: { x: 0, y: 0, z: 1 },
                up: { x: 0, y: 1, z: 0 }
            }
        }, 30);

        expect(moved.position.x).toBeGreaterThan(initial.position.x);
        expect(Math.abs(moved.position.z - initial.position.z)).toBeLessThan(0.001);
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
        const clearRoute = {
            ...createFlightState(),
            orientation: { yaw: Math.PI / 2, pitch: 0, roll: 0 }
        };
        const normal = stepMany(clearRoute, { ...idleInput, forward: 1 }, 240);
        const boosted = stepMany(clearRoute, { ...idleInput, forward: 1, boost: true }, 240);
        const normalSpeed = Math.hypot(normal.velocity.x, normal.velocity.y, normal.velocity.z);
        const boostSpeed = Math.hypot(boosted.velocity.x, boosted.velocity.y, boosted.velocity.z);
        const coasted = stepFlight(normal, idleInput, 0.5);

        expect(normalSpeed).toBeLessThanOrEqual(MAX_SPEED + 0.0001);
        expect(boostSpeed).toBeGreaterThan(normalSpeed);
        expect(boostSpeed).toBeLessThanOrEqual(BOOST_MAX_SPEED + 0.0001);
        expect(Math.hypot(coasted.velocity.x, coasted.velocity.y, coasted.velocity.z)).toBeLessThan(normalSpeed);
    });

    it('wraps yaw, clamps pitch, changes roll and brakes', () => {
        const clearRoute = {
            ...createFlightState(),
            orientation: { yaw: Math.PI / 2, pitch: 0, roll: 0 }
        };
        const moving = stepMany(clearRoute, { ...idleInput, forward: 1 }, 60);
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

    it('stops inward velocity at a planet surface while preserving tangential movement', () => {
        const sun = PLANET_ANCHORS.sun;
        const initial = {
            ...createFlightState(),
            position: { x: sun.x + 0.2, y: sun.y, z: sun.z + sun.collisionRadius + 0.05 },
            velocity: { x: 1.2, y: 0, z: -MAX_SPEED }
        };
        const result = stepFlight(initial, idleInput, 0.25, [sun]);
        const fromSun = {
            x: result.position.x - sun.x,
            y: result.position.y - sun.y,
            z: result.position.z - sun.z
        };
        const distance = Math.hypot(fromSun.x, fromSun.y, fromSun.z);
        const inwardVelocity = (result.velocity.x * fromSun.x)
            + (result.velocity.y * fromSun.y)
            + (result.velocity.z * fromSun.z);

        expect(distance).toBeGreaterThanOrEqual(sun.collisionRadius - 0.0001);
        expect(inwardVelocity).toBeGreaterThanOrEqual(-0.0001);
        expect(Math.abs(result.velocity.x)).toBeGreaterThan(0);
    });

    it('keeps the whole rocket clear of Saturn paper rings at discovery range', () => {
        const saturn = PLANET_ANCHORS.saturn;

        expect(saturn.collisionRadius).toBeGreaterThanOrEqual(5.8);
        expect(saturn.interactionRadius).toBeGreaterThan(saturn.collisionRadius);
    });

    it('finds only planets inside their real 3D discovery radius', () => {
        expect(findNearbyPlanet(PLANET_ANCHORS.earth, Object.values(PLANET_ANCHORS))).toBe('earth');
        expect(findNearbyPlanet({
            x: FLIGHT_BOUNDS.maxX,
            y: FLIGHT_BOUNDS.maxY,
            z: FLIGHT_BOUNDS.maxZ
        }, Object.values(PLANET_ANCHORS))).toBe(null);
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

    it('combines simultaneous movement and continuous look sticks', () => {
        const harness = createInputHarness();
        let input;
        try {
            input = createFlightInput(harness.options);

            harness.left.emit('pointerdown', pointerEvent(1, 100, 50, harness.left));
            harness.look.emit('pointerdown', pointerEvent(2, 50, 100, harness.look));

            const active = input.sample();
            expect(active.strafe).toBeCloseTo(1, 4);
            expect(active.forward).toBeCloseTo(0, 4);
            expect(active.yawDelta).toBeCloseTo(0, 4);
            expect(active.pitchDelta).toBeLessThan(0);
            expect(input.sample().pitchDelta).toBeLessThan(0);

            harness.left.emit('pointerup', pointerEvent(1, 100, 50, harness.left));
            harness.look.emit('pointerup', pointerEvent(2, 50, 100, harness.look));
        } finally {
            input?.destroy();
            harness.restore();
        }
    });

    it('keeps advanced manoeuvres available to desktop keyboard pilots', () => {
        const harness = createInputHarness();
        let input;
        try {
            input = createFlightInput(harness.options);

            for (const code of ['Space', 'KeyR', 'ShiftLeft', 'KeyX']) {
                harness.window.emit('keydown', keyEvent(code));
            }

            expect(input.sample()).toMatchObject({ vertical: 1, roll: 1, brake: true, boost: true });

            input.reset();
            expect(input.sample()).toMatchObject({ vertical: 0, roll: 0, brake: false, boost: false });
        } finally {
            input?.destroy();
            harness.restore();
        }
    });
});

class FakeControl {
    constructor({ left = 0, top = 0, width = 100, height = 100 } = {}) {
        this.bounds = { left, top, width, height };
        this.listeners = new Map();
        this.attributes = new Map();
        this.style = {};
        this.classList = {
            values: new Set(),
            add: (...names) => names.forEach((name) => this.classList.values.add(name)),
            remove: (...names) => names.forEach((name) => this.classList.values.delete(name)),
            toggle: (name, force) => {
                const shouldAdd = force ?? !this.classList.values.has(name);
                if (shouldAdd) this.classList.values.add(name);
                else this.classList.values.delete(name);
                return shouldAdd;
            }
        };
    }

    addEventListener(type, handler) { this.listeners.set(type, handler); }
    removeEventListener(type) { this.listeners.delete(type); }
    emit(type, event) { this.listeners.get(type)?.(event); }
    getBoundingClientRect() { return this.bounds; }
    setPointerCapture() {}
    setAttribute(name, value) { this.attributes.set(name, value); }
}

function pointerEvent(pointerId, clientX, clientY, target) {
    return {
        pointerId,
        clientX,
        clientY,
        button: 0,
        target,
        preventDefault() {},
        stopPropagation() {}
    };
}

function keyEvent(code) {
    return { code, preventDefault() {} };
}

function createInputHarness() {
    const previousWindow = globalThis.window;
    const fakeWindow = new FakeControl();
    globalThis.window = fakeWindow;
    const stage = new FakeControl();
    const left = new FakeControl();
    const look = new FakeControl();
    const leftKnob = new FakeControl();
    const lookKnob = new FakeControl();
    return {
        window: fakeWindow, stage, left, look,
        options: {
            stage,
            joystick: left,
            joystickKnob: leftKnob,
            lookJoystick: look,
            lookJoystickKnob: lookKnob
        },
        restore() { globalThis.window = previousWindow; }
    };
}
