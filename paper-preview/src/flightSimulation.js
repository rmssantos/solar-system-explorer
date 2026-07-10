export const MAX_SPEED = 3.9;
export const DEPTH_LAYERS = Object.freeze([-0.8, 0, 0.8]);
export const FLIGHT_BOUNDS = Object.freeze({
    minX: -10.5,
    maxX: 10.5,
    minY: -5.2,
    maxY: 5.2
});

export const PLANET_ANCHORS = Object.freeze({
    sun: Object.freeze({ key: 'sun', x: -6.4, y: 0.5, z: 0, interactionRadius: 3 }),
    earth: Object.freeze({ key: 'earth', x: 0, y: 1.25, z: 0.25, interactionRadius: 2.3 }),
    saturn: Object.freeze({ key: 'saturn', x: 6.4, y: -0.55, z: -0.35, interactionRadius: 2.65 })
});

const ACCELERATION = 8;
const ACTIVE_DRAG = 0.55;
const IDLE_DRAG = 3.2;
const DEPTH_RESPONSE = 5.5;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function findNearbyPlanet(position) {
    let closest = null;
    let closestDistance = Infinity;

    for (const planet of Object.values(PLANET_ANCHORS)) {
        const distance = Math.hypot(
            position.x - planet.x,
            position.y - planet.y,
            position.z - planet.z
        );
        if (distance <= planet.interactionRadius && distance < closestDistance) {
            closest = planet.key;
            closestDistance = distance;
        }
    }
    return closest;
}

export function createFlightState() {
    const position = { x: -4.3, y: -1.4, z: DEPTH_LAYERS[1] };
    return {
        position,
        velocity: { x: 0, y: 0 },
        depthLayer: 1,
        nearbyPlanetKey: findNearbyPlanet(position)
    };
}

export function cycleDepthLayer(state, direction) {
    const depthLayer = clamp(state.depthLayer + Math.sign(direction), 0, DEPTH_LAYERS.length - 1);
    return {
        ...state,
        position: { ...state.position },
        velocity: { ...state.velocity },
        depthLayer
    };
}

export function stepFlight(state, input, deltaSeconds) {
    const delta = clamp(deltaSeconds, 0, 0.5);
    const inputLength = Math.hypot(input.moveX, input.moveY);
    const normalizedInput = inputLength > 1
        ? { x: input.moveX / inputLength, y: input.moveY / inputLength }
        : { x: input.moveX, y: input.moveY };

    let velocityX = state.velocity.x + normalizedInput.x * ACCELERATION * delta;
    let velocityY = state.velocity.y + normalizedInput.y * ACCELERATION * delta;
    const acceleratedSpeed = Math.hypot(velocityX, velocityY);
    if (acceleratedSpeed > MAX_SPEED) {
        velocityX = (velocityX / acceleratedSpeed) * MAX_SPEED;
        velocityY = (velocityY / acceleratedSpeed) * MAX_SPEED;
    }

    const drag = inputLength > 0.01 ? ACTIVE_DRAG : IDLE_DRAG;
    const damping = Math.exp(-drag * delta);
    velocityX *= damping;
    velocityY *= damping;

    let nextX = state.position.x + velocityX * delta;
    let nextY = state.position.y + velocityY * delta;
    const clampedX = clamp(nextX, FLIGHT_BOUNDS.minX, FLIGHT_BOUNDS.maxX);
    const clampedY = clamp(nextY, FLIGHT_BOUNDS.minY, FLIGHT_BOUNDS.maxY);
    if (clampedX !== nextX) velocityX = 0;
    if (clampedY !== nextY) velocityY = 0;
    nextX = clampedX;
    nextY = clampedY;

    const targetZ = DEPTH_LAYERS[state.depthLayer];
    const depthBlend = 1 - Math.exp(-DEPTH_RESPONSE * delta);
    const nextZ = state.position.z + (targetZ - state.position.z) * depthBlend;
    const position = { x: nextX, y: nextY, z: nextZ };

    return {
        position,
        velocity: { x: velocityX, y: velocityY },
        depthLayer: state.depthLayer,
        nearbyPlanetKey: findNearbyPlanet(position)
    };
}
