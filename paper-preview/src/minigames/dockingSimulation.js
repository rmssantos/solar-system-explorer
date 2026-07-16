export const DOCKING_LIMITS = Object.freeze({
    minX: -9,
    maxX: 0.4,
    minY: -5,
    maxY: 5,
    maxDeltaSeconds: 0.05,
    contactX: -0.35,
    safeCorridorY: 0.45,
    safeSpeed: 0.55,
    safeAngleRadians: 0.14,
    safeAngularSpeed: 0.3
});

const TRANSLATION_ACCELERATION = 1.7;
const ROTATION_ACCELERATION = 1.25;
const PASSIVE_DAMPING = 0.12;
const STABILIZE_DAMPING = 4.2;

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function wrapAngle(value) {
    const fullTurn = Math.PI * 2;
    return ((((value + Math.PI) % fullTurn) + fullTurn) % fullTurn) - Math.PI;
}

function freezeState(value) {
    return Object.freeze({
        phase: value.phase,
        attempts: value.attempts,
        elapsedSeconds: value.elapsedSeconds,
        event: value.event,
        position: Object.freeze({ ...value.position }),
        velocity: Object.freeze({ ...value.velocity }),
        angle: value.angle,
        angularVelocity: value.angularVelocity
    });
}

export function createDockingState(value = {}) {
    return freezeState({
        phase: value.phase === 'docked' ? 'docked' : 'approach',
        attempts: Math.max(0, Math.floor(finite(value.attempts, 0))),
        elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: typeof value.event === 'string' ? value.event : null,
        position: {
            x: finite(value.position?.x, -7),
            y: finite(value.position?.y, 1.35)
        },
        velocity: {
            x: finite(value.velocity?.x, 0.42),
            y: finite(value.velocity?.y, 0)
        },
        angle: wrapAngle(finite(value.angle, 0.08)),
        angularVelocity: finite(value.angularVelocity, 0)
    });
}

export function getDockingTelemetry(state) {
    const speed = Math.hypot(state.velocity.x, state.velocity.y);
    return Object.freeze({
        distance: Math.max(0, -state.position.x),
        relativeSpeed: speed,
        alignmentDegrees: Math.abs(state.angle) * (180 / Math.PI),
        corridorSafe: Math.abs(state.position.y) <= DOCKING_LIMITS.safeCorridorY,
        speedSafe: speed <= DOCKING_LIMITS.safeSpeed,
        alignmentSafe: Math.abs(state.angle) <= DOCKING_LIMITS.safeAngleRadians
            && Math.abs(state.angularVelocity) <= DOCKING_LIMITS.safeAngularSpeed
    });
}

export function stepDocking(state, input = {}, deltaSeconds = 0, profile = {}) {
    const base = createDockingState(state);
    if (base.phase === 'docked') return base;

    const delta = clamp(finite(deltaSeconds, 0), 0, DOCKING_LIMITS.maxDeltaSeconds);
    const horizontal = clamp(finite(input.horizontal, 0), -1, 1);
    const vertical = clamp(finite(input.vertical, 0), -1, 1);
    const rotation = clamp(finite(input.rotation, 0), -1, 1);
    const dampingRate = input.stabilize ? STABILIZE_DAMPING : PASSIVE_DAMPING;

    let velocityX = base.velocity.x + horizontal * TRANSLATION_ACCELERATION * delta;
    let velocityY = base.velocity.y + vertical * TRANSLATION_ACCELERATION * delta;
    const driftAcceleration = finite(profile.driftAcceleration, 0);
    const driftFrequency = finite(profile.driftFrequency, 0);
    velocityY += Math.sin((base.elapsedSeconds + delta) * driftFrequency) * driftAcceleration * delta;
    let angularVelocity = base.angularVelocity + rotation * ROTATION_ACCELERATION * delta;
    const damping = Math.exp(-dampingRate * delta);
    velocityX *= damping;
    velocityY *= damping;
    angularVelocity *= damping;

    const position = {
        x: clamp(base.position.x + velocityX * delta, DOCKING_LIMITS.minX, DOCKING_LIMITS.maxX),
        y: clamp(base.position.y + velocityY * delta, DOCKING_LIMITS.minY, DOCKING_LIMITS.maxY)
    };
    if (position.x === DOCKING_LIMITS.minX || position.x === DOCKING_LIMITS.maxX) velocityX = 0;
    if (position.y === DOCKING_LIMITS.minY || position.y === DOCKING_LIMITS.maxY) velocityY = 0;
    const angle = wrapAngle(base.angle + angularVelocity * delta);
    const candidate = createDockingState({
        ...base,
        event: null,
        elapsedSeconds: base.elapsedSeconds + delta,
        position,
        velocity: { x: velocityX, y: velocityY },
        angle,
        angularVelocity
    });

    if (candidate.position.x < DOCKING_LIMITS.contactX) return candidate;
    const telemetry = getDockingTelemetry(candidate);
    if (telemetry.corridorSafe && telemetry.speedSafe && telemetry.alignmentSafe && candidate.velocity.x >= 0) {
        return createDockingState({
            ...candidate,
            phase: 'docked',
            event: 'docked',
            position: { x: DOCKING_LIMITS.contactX, y: 0 },
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0
        });
    }

    return createDockingState({
        ...candidate,
        event: 'unsafe-contact',
        attempts: candidate.attempts + 1,
        position: { x: -5.5, y: clamp(candidate.position.y * 0.5, -2, 2) },
        velocity: { x: 0.25, y: 0 },
        angle: candidate.angle * 0.25,
        angularVelocity: 0
    });
}
