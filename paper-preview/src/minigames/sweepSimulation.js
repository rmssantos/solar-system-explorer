export const SWEEP_LIMITS = Object.freeze({
    minX: -0.9,
    maxX: 0.9,
    minY: -0.68,
    maxY: 0.68,
    maxDeltaSeconds: 0.05,
    collectionRadius: 0.105,
    debrisRadius: 0.115
});

const THRUST_ACCELERATION = 1.45;
const PASSIVE_DAMPING = 0.42;
const STABILIZE_DAMPING = 5.2;
const RESET_POSITION = Object.freeze({ x: -0.72, y: 0.26 });
const DEFAULT_TRANSMITTERS = Object.freeze([
    Object.freeze({ id: 'luna-1', x: -0.32, y: 0.18, collected: false }),
    Object.freeze({ id: 'luna-2', x: 0.12, y: -0.12, collected: false }),
    Object.freeze({ id: 'luna-3', x: 0.34, y: 0.48, collected: false }),
    Object.freeze({ id: 'luna-4', x: 0.62, y: 0.18, collected: false })
]);
const DEFAULT_DEBRIS = Object.freeze([
    Object.freeze({ id: 'rock-1', x: -0.05, y: -0.42, radius: 0.09 }),
    Object.freeze({ id: 'rock-2', x: 0.28, y: 0.13, radius: 0.075 }),
    Object.freeze({ id: 'rock-3', x: 0.64, y: -0.36, radius: 0.1 }),
    Object.freeze({ id: 'rock-4', x: -0.48, y: 0.49, radius: 0.07 })
]);

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function finite(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function freezeState(value) {
    return Object.freeze({
        phase: value.phase,
        elapsedSeconds: value.elapsedSeconds,
        event: value.event,
        shield: value.shield,
        invulnerabilitySeconds: value.invulnerabilitySeconds,
        position: Object.freeze({ ...value.position }),
        velocity: Object.freeze({ ...value.velocity }),
        transmitters: Object.freeze(value.transmitters.map((item) => Object.freeze({ ...item }))),
        debris: Object.freeze(value.debris.map((item) => Object.freeze({ ...item })))
    });
}

function distanceBetween(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

export function createSweepState(value = {}) {
    const transmitters = (value.transmitters ?? DEFAULT_TRANSMITTERS).map((item, index) => ({
        id: typeof item.id === 'string' ? item.id : `luna-${index + 1}`,
        x: finite(item.x, DEFAULT_TRANSMITTERS[index]?.x ?? 0),
        y: finite(item.y, DEFAULT_TRANSMITTERS[index]?.y ?? 0),
        collected: Boolean(item.collected)
    }));
    return freezeState({
        phase: value.phase === 'complete' || transmitters.every((item) => item.collected) ? 'complete' : 'sweeping',
        elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: typeof value.event === 'string' ? value.event : null,
        shield: clamp(Math.floor(finite(value.shield, 3)), 1, 3),
        invulnerabilitySeconds: Math.max(0, finite(value.invulnerabilitySeconds, 0)),
        position: {
            x: clamp(finite(value.position?.x, RESET_POSITION.x), SWEEP_LIMITS.minX, SWEEP_LIMITS.maxX),
            y: clamp(finite(value.position?.y, RESET_POSITION.y), SWEEP_LIMITS.minY, SWEEP_LIMITS.maxY)
        },
        velocity: {
            x: finite(value.velocity?.x, 0.16),
            y: finite(value.velocity?.y, 0)
        },
        transmitters,
        debris: (value.debris ?? DEFAULT_DEBRIS).map((item, index) => ({
            id: typeof item.id === 'string' ? item.id : `rock-${index + 1}`,
            x: finite(item.x, DEFAULT_DEBRIS[index]?.x ?? 0),
            y: finite(item.y, DEFAULT_DEBRIS[index]?.y ?? 0),
            radius: Math.max(0.03, finite(item.radius, DEFAULT_DEBRIS[index]?.radius ?? 0.08))
        }))
    });
}

export function getSweepTelemetry(state) {
    const collected = state.transmitters.filter((item) => item.collected).length;
    const nearest = state.transmitters
        .filter((item) => !item.collected)
        .reduce((distance, item) => Math.min(distance, distanceBetween(state.position, item)), Infinity);
    const signalStrength = Number.isFinite(nearest) ? clamp(1 - nearest / 1.2, 0, 1) : 1;
    return Object.freeze({
        collected,
        total: state.transmitters.length,
        shield: state.shield,
        signalStrength,
        speed: Math.hypot(state.velocity.x, state.velocity.y),
        primary: collected,
        secondary: state.shield,
        tertiary: signalStrength,
        primarySafe: collected > 0,
        secondarySafe: state.shield > 1,
        tertiarySafe: signalStrength >= 0.45
    });
}

export function stepSweep(state, input = {}, deltaSeconds = 0) {
    const base = createSweepState(state);
    if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, SWEEP_LIMITS.maxDeltaSeconds);
    const horizontal = clamp(finite(input.horizontal, 0), -1, 1);
    const vertical = clamp(finite(input.vertical, 0), -1, 1);
    const damping = Math.exp(-(input.stabilize ? STABILIZE_DAMPING : PASSIVE_DAMPING) * delta);
    let velocity = {
        x: (base.velocity.x + horizontal * THRUST_ACCELERATION * delta) * damping,
        y: (base.velocity.y + vertical * THRUST_ACCELERATION * delta) * damping
    };
    const position = {
        x: clamp(base.position.x + velocity.x * delta, SWEEP_LIMITS.minX, SWEEP_LIMITS.maxX),
        y: clamp(base.position.y + velocity.y * delta, SWEEP_LIMITS.minY, SWEEP_LIMITS.maxY)
    };
    if (position.x === SWEEP_LIMITS.minX || position.x === SWEEP_LIMITS.maxX) velocity.x *= -0.28;
    if (position.y === SWEEP_LIMITS.minY || position.y === SWEEP_LIMITS.maxY) velocity.y *= -0.28;
    let event = null;
    const transmitters = base.transmitters.map((item) => {
        if (item.collected || distanceBetween(position, item) > SWEEP_LIMITS.collectionRadius) return item;
        event = 'transmitter-collected';
        return { ...item, collected: true };
    });
    if (transmitters.every((item) => item.collected)) {
        return createSweepState({
            ...base,
            phase: 'complete',
            elapsedSeconds: base.elapsedSeconds + delta,
            event: 'sweep-complete',
            position,
            velocity: { x: 0, y: 0 },
            transmitters
        });
    }
    const invulnerabilitySeconds = Math.max(0, base.invulnerabilitySeconds - delta);
    const debrisHit = invulnerabilitySeconds === 0 && base.debris.some((item) => (
        distanceBetween(position, item) <= SWEEP_LIMITS.debrisRadius + item.radius
    ));
    if (debrisHit) {
        return createSweepState({
            ...base,
            elapsedSeconds: base.elapsedSeconds + delta,
            event: 'debris-hit',
            shield: Math.max(1, base.shield - 1),
            invulnerabilitySeconds: 1.25,
            position: RESET_POSITION,
            velocity: { x: 0.08, y: 0 },
            transmitters
        });
    }
    return createSweepState({
        ...base,
        elapsedSeconds: base.elapsedSeconds + delta,
        event,
        invulnerabilitySeconds,
        position,
        velocity,
        transmitters
    });
}
