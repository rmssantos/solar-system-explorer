export const SIGNAL_LIMITS = Object.freeze({
    maxError: 1,
    targetError: 0.12,
    requiredLockSeconds: 2,
    maxDeltaSeconds: 0.05
});

const TUNING_RATE = 0.9;
const LOCK_DECAY_RATE = 0.72;

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
        frequencyError: value.frequencyError,
        lockSeconds: value.lockSeconds,
        transmitting: value.transmitting
    });
}

export function createSignalState(value = {}) {
    const phase = value.phase === 'complete' ? 'complete' : 'tuning';
    return freezeState({
        phase,
        elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: typeof value.event === 'string' ? value.event : null,
        angleError: clamp(finite(value.angleError, -0.48), -SIGNAL_LIMITS.maxError, SIGNAL_LIMITS.maxError),
        frequencyError: clamp(finite(value.frequencyError, 0.56), -SIGNAL_LIMITS.maxError, SIGNAL_LIMITS.maxError),
        lockSeconds: phase === 'complete'
            ? SIGNAL_LIMITS.requiredLockSeconds
            : clamp(finite(value.lockSeconds, 0), 0, SIGNAL_LIMITS.requiredLockSeconds),
        transmitting: Boolean(value.transmitting)
    });
}

export function getSignalTelemetry(state) {
    const anglePercent = clamp(1 - Math.abs(state.angleError) / SIGNAL_LIMITS.maxError, 0, 1);
    const frequencyPercent = clamp(1 - Math.abs(state.frequencyError) / SIGNAL_LIMITS.maxError, 0, 1);
    const lockPercent = clamp(state.lockSeconds / SIGNAL_LIMITS.requiredLockSeconds, 0, 1);
    return Object.freeze({
        anglePercent,
        frequencyPercent,
        lockPercent,
        angleDegrees: Math.abs(state.angleError) * 45,
        frequencyOffset: Math.abs(state.frequencyError) * 100,
        primary: anglePercent,
        secondary: frequencyPercent,
        tertiary: lockPercent,
        primarySafe: Math.abs(state.angleError) <= SIGNAL_LIMITS.targetError,
        secondarySafe: Math.abs(state.frequencyError) <= SIGNAL_LIMITS.targetError,
        tertiarySafe: lockPercent >= 0.5
    });
}

export function stepSignal(state, input = {}, deltaSeconds = 0) {
    const base = createSignalState(state);
    if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, SIGNAL_LIMITS.maxDeltaSeconds);
    const horizontal = clamp(finite(input.horizontal, 0), -1, 1);
    const vertical = clamp(finite(input.vertical, 0), -1, 1);
    const drift = Math.sin((base.elapsedSeconds + delta) * 1.23) * 0.018 * delta;
    const angleError = clamp(
        base.angleError + horizontal * TUNING_RATE * delta + drift,
        -SIGNAL_LIMITS.maxError,
        SIGNAL_LIMITS.maxError
    );
    const frequencyError = clamp(
        base.frequencyError + vertical * TUNING_RATE * delta - drift * 0.72,
        -SIGNAL_LIMITS.maxError,
        SIGNAL_LIMITS.maxError
    );
    const tuned = Math.abs(angleError) <= SIGNAL_LIMITS.targetError
        && Math.abs(frequencyError) <= SIGNAL_LIMITS.targetError;
    const transmitting = Boolean(input.transmit);
    const lockSeconds = transmitting && tuned
        ? Math.min(SIGNAL_LIMITS.requiredLockSeconds, base.lockSeconds + delta)
        : Math.max(0, base.lockSeconds - LOCK_DECAY_RATE * delta);
    if (lockSeconds >= SIGNAL_LIMITS.requiredLockSeconds) {
        return createSignalState({
            ...base,
            phase: 'complete',
            elapsedSeconds: base.elapsedSeconds + delta,
            event: 'signal-complete',
            angleError: 0,
            frequencyError: 0,
            lockSeconds,
            transmitting: true
        });
    }
    return createSignalState({
        ...base,
        elapsedSeconds: base.elapsedSeconds + delta,
        event: null,
        angleError,
        frequencyError,
        lockSeconds,
        transmitting
    });
}
