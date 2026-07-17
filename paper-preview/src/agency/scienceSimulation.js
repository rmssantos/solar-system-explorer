const SUPPORTED_KINDS = new Set(['solar-weather', 'near-earth-object', 'planetary-map']);
const LAUNCH_DURATION_MS = 1_600;
const REQUIRED_SAMPLES = 3;
const SIGNAL_LOCK_MS = 2_000;

function clamp(value, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}

function hashSeed(value) {
    let hash = 2166136261;
    for (const character of String(value ?? 'paper-probe')) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function seededUnit(seed, offset = 0) {
    let value = (seed + Math.imul(offset + 1, 0x9e3779b1)) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d);
    value ^= value >>> 15;
    value = Math.imul(value, 0x846ca68b);
    value ^= value >>> 16;
    return (value >>> 0) / 4294967295;
}

function freezeState(value) {
    return Object.freeze({
        ...value,
        aim: Object.freeze({ ...(value.aim ?? { x: .5, y: .5 }) }),
        sampleScores: Object.freeze([...(value.sampleScores ?? [])])
    });
}

export function createScienceSimulation({ kind = 'solar-weather', seed = 'paper-probe', tutorial = false, attempt = 1 } = {}) {
    const normalizedKind = SUPPORTED_KINDS.has(kind) ? kind : 'solar-weather';
    const numericSeed = hashSeed(seed);
    return freezeState({
        kind: normalizedKind,
        seed: numericSeed,
        tutorial: Boolean(tutorial),
        attempt: Math.max(1, Math.round(Number(attempt) || 1)),
        phase: 'launch',
        elapsedMs: 0,
        scienceElapsedMs: 0,
        launchProgress: 0,
        completed: false,
        score: 0,
        samples: 0,
        mistakes: 0,
        feedback: 'launch',
        sampleScores: [],
        scan: 0,
        aim: { x: .5, y: .5 },
        tuning: .5,
        signalStrength: 0,
        lockProgress: 0,
        focusProgress: 0
    });
}

/** @returns {any} */
export function getScienceTarget(state) {
    if (state.kind === 'solar-weather') {
        const offset = 1 + (state.attempt - 1) * 11 + state.samples;
        return Object.freeze({ scan: .18 + seededUnit(state.seed, offset) * .64 });
    }
    if (state.kind === 'near-earth-object') {
        const time = (state.scienceElapsedMs ?? 0) / 1000;
        const phaseX = seededUnit(state.seed, 2) * Math.PI * 2;
        const phaseY = seededUnit(state.seed, 3) * Math.PI * 2;
        return Object.freeze({
            x: clamp(.5 + Math.sin(time * .24 + phaseX) * .34, .08, .92),
            y: clamp(.5 + Math.cos(time * .31 + phaseY) * .27, .1, .9)
        });
    }
    const base = .18 + seededUnit(state.seed, 4 + (state.attempt - 1) * 7) * .64;
    const driftAmplitude = state.tutorial ? .012 : .042;
    const drift = Math.sin((state.scienceElapsedMs ?? 0) / 720 + seededUnit(state.seed, 9) * Math.PI * 2) * driftAmplitude;
    return Object.freeze({ tuning: clamp(base + drift, .12, .88) });
}

function scienceScore(state, nextSampleScore) {
    const scores = [...state.sampleScores, nextSampleScore];
    return Math.round(scores.reduce((total, value) => total + value, 0) / scores.length);
}

export function applyScienceAction(state, action = {}) {
    if (!state || state.completed || state.phase !== 'science') return state;
    if (action.type === 'set-scan' && state.kind === 'solar-weather') {
        return freezeState({ ...state, scan: clamp(Number(action.value)), feedback: 'scan' });
    }
    if (action.type === 'aim' && state.kind === 'near-earth-object') {
        return freezeState({
            ...state,
            aim: { x: clamp(Number(action.x)), y: clamp(Number(action.y)) },
            feedback: 'follow-object'
        });
    }
    if (action.type === 'tune' && state.kind === 'planetary-map') {
        const tuning = clamp(Number(action.value));
        const target = getScienceTarget(state).tuning;
        const signalStrength = clamp(1 - Math.abs(tuning - target) / .38);
        return freezeState({ ...state, tuning, signalStrength, feedback: signalStrength >= .86 ? 'signal-strong' : 'find-signal' });
    }
    if (action.type !== 'capture') return state;

    if (state.kind === 'solar-weather') {
        const target = getScienceTarget(state).scan;
        const rawDistance = Math.abs(state.scan - target);
        const distance = Math.min(rawDistance, 1 - rawDistance);
        if (distance > .16) {
            return freezeState({ ...state, mistakes: state.mistakes + 1, feedback: 'find-pulse' });
        }
        const sampleScore = state.tutorial ? 100 : Math.round(clamp(1 - distance / .18) * 100);
        const samples = state.samples + 1;
        const score = scienceScore(state, sampleScore);
        return freezeState({
            ...state,
            samples,
            sampleScores: [...state.sampleScores, sampleScore],
            score,
            feedback: samples >= REQUIRED_SAMPLES ? 'complete' : 'pulse-captured',
            completed: samples >= REQUIRED_SAMPLES,
            phase: samples >= REQUIRED_SAMPLES ? 'complete' : state.phase
        });
    }

    if (state.kind === 'near-earth-object') {
        if (state.focusProgress < .75) {
            return freezeState({ ...state, mistakes: state.mistakes + 1, feedback: 'hold-focus' });
        }
        const target = getScienceTarget(state);
        const distance = Math.hypot(state.aim.x - target.x, state.aim.y - target.y);
        const sampleScore = state.tutorial ? 100 : Math.round(clamp(1 - distance / .28) * 100);
        const samples = state.samples + 1;
        const score = scienceScore(state, sampleScore);
        return freezeState({
            ...state,
            samples,
            sampleScores: [...state.sampleScores, sampleScore],
            score,
            focusProgress: samples >= REQUIRED_SAMPLES ? state.focusProgress : 0,
            feedback: samples >= REQUIRED_SAMPLES ? 'complete' : 'photo-captured',
            completed: samples >= REQUIRED_SAMPLES,
            phase: samples >= REQUIRED_SAMPLES ? 'complete' : state.phase
        });
    }
    return state;
}

export function advanceScienceSimulation(state, deltaMs) {
    const milliseconds = Number(deltaMs);
    if (!state || state.completed || !Number.isFinite(milliseconds) || milliseconds <= 0) return state;
    const elapsedMs = state.elapsedMs + milliseconds;
    const scienceElapsedMs = Math.max(0, elapsedMs - LAUNCH_DURATION_MS);
    const scienceDeltaMs = Math.max(0, scienceElapsedMs - (state.scienceElapsedMs ?? 0));
    const phase = elapsedMs >= LAUNCH_DURATION_MS ? 'science' : 'launch';
    const next = {
        ...state,
        elapsedMs,
        scienceElapsedMs,
        phase,
        launchProgress: clamp(elapsedMs / LAUNCH_DURATION_MS)
    };

    if (phase === 'science' && state.kind === 'solar-weather') {
        next.scan = (scienceElapsedMs % 2_400) / 2_400;
        if (state.phase === 'launch') next.feedback = 'find-pulse';
    }
    if (phase === 'science' && state.kind === 'near-earth-object') {
        const target = getScienceTarget(next);
        const distance = Math.hypot(next.aim.x - target.x, next.aim.y - target.y);
        const focusMilliseconds = clamp(
            state.focusProgress * 650 + (distance <= .2 ? scienceDeltaMs : -scienceDeltaMs * .55),
            0,
            650
        );
        next.focusProgress = focusMilliseconds / 650;
        next.feedback = next.focusProgress >= .75 ? 'focus-ready' : distance <= .2 ? 'hold-focus' : 'follow-object';
    }
    if (phase === 'science' && state.kind === 'planetary-map') {
        const target = getScienceTarget(next).tuning;
        next.signalStrength = clamp(1 - Math.abs(next.tuning - target) / .38);
        const locked = next.signalStrength >= .86;
        const lockMilliseconds = clamp((state.lockProgress * SIGNAL_LOCK_MS + (locked ? scienceDeltaMs : -scienceDeltaMs * .65)), 0, SIGNAL_LOCK_MS);
        next.lockProgress = lockMilliseconds / SIGNAL_LOCK_MS;
        next.feedback = locked ? 'hold-signal' : 'find-signal';
        if (next.lockProgress >= 1) {
            next.completed = true;
            next.phase = 'complete';
            next.score = next.tutorial ? 100 : Math.round(next.signalStrength * 100);
            next.feedback = 'complete';
        }
    }
    return freezeState(next);
}

export const SCIENCE_SIMULATION_CONSTANTS = Object.freeze({
    launchDurationMs: LAUNCH_DURATION_MS,
    requiredSamples: REQUIRED_SAMPLES,
    signalLockMs: SIGNAL_LOCK_MS
});
