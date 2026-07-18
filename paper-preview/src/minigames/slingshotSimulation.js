export const SLINGSHOT_LIMITS = Object.freeze({
    maxError: 1,
    targetAngleError: 0.12,
    minSafeDistance: 0.34,
    maxSafeDistance: 0.66,
    requiredBoostSeconds: 2.4,
    maxDeltaSeconds: 0.05,
    maxSpeedGain: 14
});

const CONTROL_RATE = 0.72;
const PROGRESS_DECAY = 0.35;

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
        angleError: value.angleError,
        flybyDistance: value.flybyDistance,
        boostProgress: value.boostProgress,
        committing: value.committing,
        risk: value.risk
    });
}

export function createSlingshotState(value = {}) {
    const boostProgress = clamp(
        finite(value.boostProgress, 0),
        0,
        SLINGSHOT_LIMITS.requiredBoostSeconds
    );
    const complete = value.phase === 'complete' || boostProgress >= SLINGSHOT_LIMITS.requiredBoostSeconds;
    return freezeState({
        phase: complete ? 'complete' : 'planning',
        elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: typeof value.event === 'string' ? value.event : null,
        angleError: clamp(finite(value.angleError, -0.48), -SLINGSHOT_LIMITS.maxError, SLINGSHOT_LIMITS.maxError),
        flybyDistance: clamp(finite(value.flybyDistance, 0.78), 0, 1),
        boostProgress: complete ? SLINGSHOT_LIMITS.requiredBoostSeconds : boostProgress,
        committing: Boolean(value.committing),
        risk: ['heat', 'miss'].includes(value.risk) ? value.risk : null
    });
}

export function getSlingshotTelemetry(state) {
    const routePercent = clamp(1 - Math.abs(state.angleError) / SLINGSHOT_LIMITS.maxError, 0, 1);
    const distanceQuality = clamp(1 - Math.abs(state.flybyDistance - 0.5) / 0.5, 0, 1);
    const boostPercent = clamp(state.boostProgress / SLINGSHOT_LIMITS.requiredBoostSeconds, 0, 1);
    const angleSafe = Math.abs(state.angleError) <= SLINGSHOT_LIMITS.targetAngleError;
    const distanceSafe = state.flybyDistance >= SLINGSHOT_LIMITS.minSafeDistance
        && state.flybyDistance <= SLINGSHOT_LIMITS.maxSafeDistance;
    return Object.freeze({
        routePercent,
        altitudeKm: Math.round(80_000 + state.flybyDistance * 520_000),
        distanceQuality,
        boostPercent,
        speedGain: Number((boostPercent * SLINGSHOT_LIMITS.maxSpeedGain).toFixed(1)),
        primary: routePercent,
        secondary: distanceQuality,
        tertiary: boostPercent,
        primarySafe: angleSafe,
        secondarySafe: distanceSafe,
        tertiarySafe: boostPercent >= 0.5
    });
}

export function stepSlingshot(state, input = {}, deltaSeconds = 0) {
    const base = createSlingshotState(state);
    if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, SLINGSHOT_LIMITS.maxDeltaSeconds);
    const horizontal = clamp(finite(input.horizontal, 0), -1, 1);
    const vertical = clamp(finite(input.vertical, 0), -1, 1);
    const angleError = clamp(
        base.angleError + horizontal * CONTROL_RATE * delta,
        -SLINGSHOT_LIMITS.maxError,
        SLINGSHOT_LIMITS.maxError
    );
    const flybyDistance = clamp(base.flybyDistance + vertical * CONTROL_RATE * delta, 0, 1);
    const committing = Boolean(input.commit);
    const angleSafe = Math.abs(angleError) <= SLINGSHOT_LIMITS.targetAngleError;
    const tooClose = flybyDistance < SLINGSHOT_LIMITS.minSafeDistance;
    const tooFar = flybyDistance > SLINGSHOT_LIMITS.maxSafeDistance;
    let boostProgress = base.boostProgress;
    let event = null;
    let risk = null;

    if (committing && angleSafe && !tooClose && !tooFar) {
        boostProgress = Math.min(SLINGSHOT_LIMITS.requiredBoostSeconds, boostProgress + delta);
        if (base.boostProgress === 0 && boostProgress > 0) event = 'slingshot-boost';
    } else {
        boostProgress = Math.max(0, boostProgress - PROGRESS_DECAY * delta);
        if (committing && tooClose) {
            risk = 'heat';
            if (base.risk !== risk) event = 'heat-warning';
        } else if (committing && (tooFar || !angleSafe)) {
            risk = 'miss';
            if (base.risk !== risk) event = 'slingshot-miss';
        }
    }

    if (boostProgress >= SLINGSHOT_LIMITS.requiredBoostSeconds) {
        return createSlingshotState({
            ...base,
            phase: 'complete',
            elapsedSeconds: base.elapsedSeconds + delta,
            event: 'slingshot-complete',
            angleError: 0,
            flybyDistance: 0.5,
            boostProgress,
            committing: true,
            risk: null
        });
    }

    return createSlingshotState({
        ...base,
        elapsedSeconds: base.elapsedSeconds + delta,
        event,
        angleError,
        flybyDistance,
        boostProgress,
        committing,
        risk
    });
}
