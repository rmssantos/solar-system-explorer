import { PRIMARY_WORLDS } from './world/worldCatalog.js';

export const MAX_SPEED = 12;
export const BOOST_MAX_SPEED = 24;
export const FLIGHT_BOUNDS = Object.freeze({
    minX: -175,
    maxX: 175,
    minY: -50,
    maxY: 50,
    minZ: -175,
    maxZ: 175
});

export const PLANET_ANCHORS = Object.freeze(Object.fromEntries(PRIMARY_WORLDS.map((world) => [
    world.key,
    Object.freeze({
        key: world.key,
        x: world.anchor[0],
        y: world.anchor[1],
        z: world.anchor[2],
        collisionRadius: world.collisionRadius,
        interactionRadius: world.interactionRadius
    })
])));

const ACCELERATION = 15;
const ACTIVE_DRAG = 0.25;
const IDLE_DRAG = 2.4;
const BRAKE_DRAG = 7.5;
const ROLL_SPEED = 1.7;
const STEERING_RESPONSE = 12;
const MAX_PITCH = (Math.PI / 2) - 0.08;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function wrapAngle(value) {
    const fullTurn = Math.PI * 2;
    return ((((value + Math.PI) % fullTurn) + fullTurn) % fullTurn) - Math.PI;
}

function bodyPosition(body) {
    return body.position ?? body;
}

export function findNearbyPlanet(position, bodies = []) {
    let closest = null;
    let closestDistance = Infinity;
    for (const planet of bodies) {
        const currentPosition = bodyPosition(planet);
        const distance = Math.hypot(
            position.x - currentPosition.x,
            position.y - currentPosition.y,
            position.z - currentPosition.z
        );
        if (distance <= planet.interactionRadius && distance < closestDistance) {
            closest = planet.key;
            closestDistance = distance;
        }
    }
    return closest;
}

export function createFlightState(bodies = []) {
    const position = { x: 0, y: 0, z: 14 };
    return {
        position,
        velocity: { x: 0, y: 0, z: 0 },
        orientation: { yaw: 0, pitch: 0, roll: 0 },
        nearbyPlanetKey: findNearbyPlanet(position, bodies)
    };
}

export function stepFlight(state, input, deltaSeconds, bodies = []) {
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
    const movementBasis = input.movementBasis;
    const forward = movementBasis?.forward ?? {
        x: Math.sin(orientation.yaw) * cosPitch,
        y: Math.sin(orientation.pitch),
        z: -Math.cos(orientation.yaw) * cosPitch
    };
    const right = movementBasis?.right ?? {
        x: Math.cos(orientation.yaw),
        y: 0,
        z: Math.sin(orientation.yaw)
    };
    const up = movementBasis?.up ?? { x: 0, y: 1, z: 0 };

    let intentX = (forward.x * forwardIntent) + (right.x * strafeIntent) + (up.x * verticalIntent);
    let intentY = (forward.y * forwardIntent) + (right.y * strafeIntent) + (up.y * verticalIntent);
    let intentZ = (forward.z * forwardIntent) + (right.z * strafeIntent) + (up.z * verticalIntent);
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
    if (hasIntent) {
        const speed = Math.hypot(velocityX, velocityY, velocityZ);
        const steeringBlend = 1 - Math.exp(-STEERING_RESPONSE * delta);
        const targetX = (intentX / intentLength) * speed;
        const targetY = (intentY / intentLength) * speed;
        const targetZ = (intentZ / intentLength) * speed;
        velocityX += (targetX - velocityX) * steeringBlend;
        velocityY += (targetY - velocityY) * steeringBlend;
        velocityZ += (targetZ - velocityZ) * steeringBlend;

        const steeredSpeed = Math.hypot(velocityX, velocityY, velocityZ);
        if (steeredSpeed > 0.0001) {
            const preserveSpeed = speed / steeredSpeed;
            velocityX *= preserveSpeed;
            velocityY *= preserveSpeed;
            velocityZ *= preserveSpeed;
        }
    }
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

    for (const planet of bodies) {
        const currentPosition = bodyPosition(planet);
        let offsetX = position.x - currentPosition.x;
        let offsetY = position.y - currentPosition.y;
        let offsetZ = position.z - currentPosition.z;
        let distance = Math.hypot(offsetX, offsetY, offsetZ);
        if (distance >= planet.collisionRadius) continue;

        if (distance < 0.0001) {
            offsetX = state.position.x - currentPosition.x;
            offsetY = state.position.y - currentPosition.y;
            offsetZ = state.position.z - currentPosition.z;
            distance = Math.hypot(offsetX, offsetY, offsetZ) || 1;
        }
        const normalX = offsetX / distance;
        const normalY = offsetY / distance;
        const normalZ = offsetZ / distance;
        position.x = currentPosition.x + normalX * planet.collisionRadius;
        position.y = currentPosition.y + normalY * planet.collisionRadius;
        position.z = currentPosition.z + normalZ * planet.collisionRadius;

        const inwardSpeed = (velocityX * normalX) + (velocityY * normalY) + (velocityZ * normalZ);
        if (inwardSpeed < 0) {
            velocityX -= inwardSpeed * normalX;
            velocityY -= inwardSpeed * normalY;
            velocityZ -= inwardSpeed * normalZ;
        }
    }

    return {
        position,
        velocity: { x: velocityX, y: velocityY, z: velocityZ },
        orientation,
        nearbyPlanetKey: findNearbyPlanet(position, bodies)
    };
}
