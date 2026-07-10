export const MAX_SPEED = 5;
export const BOOST_MAX_SPEED = 8.5;
export const FLIGHT_BOUNDS = Object.freeze({
    minX: -50,
    maxX: 50,
    minY: -25,
    maxY: 25,
    minZ: -55,
    maxZ: 30
});

export const PLANET_ANCHORS = Object.freeze({
    sun: Object.freeze({ key: 'sun', x: 0, y: 0, z: 0, interactionRadius: 4.8 }),
    earth: Object.freeze({ key: 'earth', x: 15, y: 4, z: -18, interactionRadius: 3.5 }),
    saturn: Object.freeze({ key: 'saturn', x: -18, y: -5, z: -38, interactionRadius: 5.4 })
});

const ACCELERATION = 7.5;
const ACTIVE_DRAG = 0.25;
const IDLE_DRAG = 2.4;
const BRAKE_DRAG = 7.5;
const ROLL_SPEED = 1.7;
const MAX_PITCH = (Math.PI / 2) - 0.08;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function wrapAngle(value) {
    const fullTurn = Math.PI * 2;
    return ((((value + Math.PI) % fullTurn) + fullTurn) % fullTurn) - Math.PI;
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
    const position = { x: 0, y: 0, z: 7 };
    return {
        position,
        velocity: { x: 0, y: 0, z: 0 },
        orientation: { yaw: 0, pitch: 0, roll: 0 },
        nearbyPlanetKey: findNearbyPlanet(position),
        depthLayer: 1
    };
}

// Temporary compatibility for the shallow-flight checkpoint; callers migrate
// to vertical thrust in the 360-degree flight composition.
export function cycleDepthLayer(state) {
    return state;
}

export function stepFlight(state, input, deltaSeconds) {
    const delta = clamp(deltaSeconds, 0, 0.5);
    const orientation = {
        yaw: wrapAngle(state.orientation.yaw + (input.yawDelta ?? 0)),
        pitch: clamp(state.orientation.pitch + (input.pitchDelta ?? 0), -MAX_PITCH, MAX_PITCH),
        roll: wrapAngle(state.orientation.roll + (input.roll ?? 0) * ROLL_SPEED * delta)
    };

    const forwardIntent = input.forward ?? input.moveY ?? 0;
    const strafeIntent = input.strafe ?? input.moveX ?? 0;
    const verticalIntent = input.vertical ?? 0;
    const cosPitch = Math.cos(orientation.pitch);
    const forward = {
        x: Math.sin(orientation.yaw) * cosPitch,
        y: Math.sin(orientation.pitch),
        z: -Math.cos(orientation.yaw) * cosPitch
    };
    const right = {
        x: Math.cos(orientation.yaw),
        y: 0,
        z: Math.sin(orientation.yaw)
    };

    let intentX = (forward.x * forwardIntent) + (right.x * strafeIntent);
    let intentY = (forward.y * forwardIntent) + verticalIntent;
    let intentZ = (forward.z * forwardIntent) + (right.z * strafeIntent);
    const intentLength = Math.hypot(intentX, intentY, intentZ);
    if (intentLength > 1) {
        intentX /= intentLength;
        intentY /= intentLength;
        intentZ /= intentLength;
    }

    const acceleration = ACCELERATION * (input.boost ? 1.4 : 1);
    let velocityX = state.velocity.x + intentX * acceleration * delta;
    let velocityY = state.velocity.y + intentY * acceleration * delta;
    let velocityZ = state.velocity.z + intentZ * acceleration * delta;
    const speedLimit = input.boost ? BOOST_MAX_SPEED : MAX_SPEED;
    const acceleratedSpeed = Math.hypot(velocityX, velocityY, velocityZ);
    if (acceleratedSpeed > speedLimit) {
        const scale = speedLimit / acceleratedSpeed;
        velocityX *= scale;
        velocityY *= scale;
        velocityZ *= scale;
    }

    const hasIntent = intentLength > 0.01;
    const drag = input.brake ? BRAKE_DRAG : (hasIntent ? ACTIVE_DRAG : IDLE_DRAG);
    const damping = Math.exp(-drag * delta);
    velocityX *= damping;
    velocityY *= damping;
    velocityZ *= damping;

    const requestedPosition = {
        x: state.position.x + velocityX * delta,
        y: state.position.y + velocityY * delta,
        z: state.position.z + velocityZ * delta
    };
    const position = {
        x: clamp(requestedPosition.x, FLIGHT_BOUNDS.minX, FLIGHT_BOUNDS.maxX),
        y: clamp(requestedPosition.y, FLIGHT_BOUNDS.minY, FLIGHT_BOUNDS.maxY),
        z: clamp(requestedPosition.z, FLIGHT_BOUNDS.minZ, FLIGHT_BOUNDS.maxZ)
    };
    if (position.x !== requestedPosition.x) velocityX = 0;
    if (position.y !== requestedPosition.y) velocityY = 0;
    if (position.z !== requestedPosition.z) velocityZ = 0;

    return {
        position,
        velocity: { x: velocityX, y: velocityY, z: velocityZ },
        orientation,
        nearbyPlanetKey: findNearbyPlanet(position),
        depthLayer: state.depthLayer ?? 1
    };
}
