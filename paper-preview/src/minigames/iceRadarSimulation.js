export const ICE_RADAR_LIMITS = Object.freeze({
    minPosition: -1,
    maxPosition: 1,
    maxDeltaSeconds: 0.25,
    overheat: 0.95,
    restartHeat: 0.5,
    passRadius: 0.24
});

export const ICE_RADAR_PASS_POSITIONS = Object.freeze([-0.62, 0, 0.62]);

const POSITION_RATE = 1.25;
const POWER_RATE = 0.72;
const SCAN_RATE = 0.55;
const HEAT_RATE = 0.58;
const COOL_RATE = 0.34;

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
        position: value.position,
        power: value.power,
        heat: value.heat,
        scanning: value.scanning,
        overheated: value.overheated,
        passProgress: Object.freeze([...value.passProgress])
    });
}

export function createIceRadarState(value = {}) {
    const phase = value.phase === 'complete' ? 'complete' : 'scanning';
    const passProgress = [0, 1, 2].map((index) => clamp(finite(value.passProgress?.[index], 0), 0, 1));
    return freezeState({
        phase,
        elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: typeof value.event === 'string' ? value.event : null,
        position: clamp(finite(value.position, -0.72), ICE_RADAR_LIMITS.minPosition, ICE_RADAR_LIMITS.maxPosition),
        power: clamp(finite(value.power, 0.58), 0.2, 1),
        heat: clamp(finite(value.heat, 0), 0, 1),
        scanning: phase !== 'complete' && Boolean(value.scanning),
        overheated: phase !== 'complete' && Boolean(value.overheated),
        passProgress
    });
}

function nearestPassIndex(position) {
    let index = 0;
    let distance = Infinity;
    ICE_RADAR_PASS_POSITIONS.forEach((candidate, candidateIndex) => {
        const nextDistance = Math.abs(position - candidate);
        if (nextDistance < distance) {
            index = candidateIndex;
            distance = nextDistance;
        }
    });
    return { index, distance };
}

export function getIceRadarTelemetry(state) {
    const base = createIceRadarState(state);
    const coverage = base.passProgress.reduce((sum, value) => sum + value, 0) / base.passProgress.length;
    const nearest = nearestPassIndex(base.position);
    const positionConfidence = clamp(1 - nearest.distance / 0.65, 0, 1);
    const echoConfidence = base.phase === 'complete'
        ? 1
        : clamp(positionConfidence * (0.45 + base.power * 0.55) * (0.6 + coverage * 0.4), 0, 1);
    return Object.freeze({
        coverage,
        heat: base.heat,
        echoConfidence,
        primary: coverage,
        secondary: base.heat,
        tertiary: echoConfidence,
        primarySafe: coverage >= 1,
        secondarySafe: base.heat < 0.8,
        tertiarySafe: base.phase === 'complete' || echoConfidence >= 0.72
    });
}

export function stepIceRadar(state, input = {}, deltaSeconds = 0) {
    const base = createIceRadarState(state);
    if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, ICE_RADAR_LIMITS.maxDeltaSeconds);
    const horizontal = clamp(finite(input.horizontal, 0), -1, 1);
    const vertical = clamp(finite(input.vertical, 0), -1, 1);
    const position = clamp(
        base.position + horizontal * POSITION_RATE * delta,
        ICE_RADAR_LIMITS.minPosition,
        ICE_RADAR_LIMITS.maxPosition
    );
    const power = clamp(base.power + vertical * POWER_RATE * delta, 0.2, 1);
    const requestedScan = Boolean(input.scan);
    const canRestart = !base.overheated || base.heat <= ICE_RADAR_LIMITS.restartHeat;
    const scanning = requestedScan && canRestart;
    const heat = clamp(
        base.heat + (scanning ? HEAT_RATE * power : -COOL_RATE) * delta,
        0,
        1
    );
    const justOverheated = scanning && heat >= ICE_RADAR_LIMITS.overheat;
    const overheated = justOverheated || (base.overheated && heat > ICE_RADAR_LIMITS.restartHeat);
    const passProgress = [...base.passProgress];
    if (scanning) {
        const nearest = nearestPassIndex(position);
        if (nearest.distance <= ICE_RADAR_LIMITS.passRadius) {
            const alignment = 1 - nearest.distance / ICE_RADAR_LIMITS.passRadius;
            passProgress[nearest.index] = clamp(
                passProgress[nearest.index] + SCAN_RATE * power * (0.55 + alignment * 0.45) * delta,
                0,
                1
            );
        }
    }
    const complete = passProgress.every((value) => value >= 1);
    return createIceRadarState({
        ...base,
        phase: complete ? 'complete' : 'scanning',
        elapsedSeconds: base.elapsedSeconds + delta,
        event: complete ? 'ice-map-complete' : (justOverheated ? 'radar-overheat' : null),
        position,
        power,
        heat: complete ? Math.min(heat, 0.75) : heat,
        scanning: complete || justOverheated ? false : scanning,
        overheated: complete ? false : overheated,
        passProgress
    });
}
