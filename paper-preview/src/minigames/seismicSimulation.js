export const SEISMIC_LIMITS = Object.freeze({
    minX: -0.78,
    maxX: 0.78,
    minY: -0.66,
    maxY: 0.66,
    maxDeltaSeconds: 0.25,
    minimumSensorDistance: 0.3,
    alignmentTolerance: 0.12,
    sensorTotal: 3,
    correctImpact: 1
});

const CURSOR_RATE = 1.8;
const ALIGNMENT_RATE = 1.25;
const CANDIDATE_RATE = 4;

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
        attempts: value.attempts,
        actionHeld: value.actionHeld,
        cursor: Object.freeze({ ...value.cursor }),
        sensors: Object.freeze(value.sensors.map((sensor) => Object.freeze({ ...sensor }))),
        alignmentOffset: value.alignmentOffset,
        selectedImpact: value.selectedImpact
    });
}

function sanitizeSensors(values = []) {
    return values.slice(0, SEISMIC_LIMITS.sensorTotal).map((sensor, index) => ({
        id: typeof sensor?.id === 'string' ? sensor.id : `sensor-${index + 1}`,
        x: clamp(finite(sensor?.x, 0), SEISMIC_LIMITS.minX, SEISMIC_LIMITS.maxX),
        y: clamp(finite(sensor?.y, 0), SEISMIC_LIMITS.minY, SEISMIC_LIMITS.maxY)
    }));
}

export function createSeismicState(value = {}) {
    const sensors = sanitizeSensors(value.sensors);
    const requestedPhase = ['placing', 'aligning', 'classifying', 'complete'].includes(value.phase)
        ? value.phase
        : 'placing';
    const phase = requestedPhase === 'placing' && sensors.length >= SEISMIC_LIMITS.sensorTotal
        ? 'aligning'
        : requestedPhase;
    return freezeState({
        phase,
        elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: typeof value.event === 'string' ? value.event : null,
        attempts: Math.max(0, Math.floor(finite(value.attempts, 0))),
        actionHeld: Boolean(value.actionHeld),
        cursor: {
            x: clamp(finite(value.cursor?.x, -0.58), SEISMIC_LIMITS.minX, SEISMIC_LIMITS.maxX),
            y: clamp(finite(value.cursor?.y, -0.28), SEISMIC_LIMITS.minY, SEISMIC_LIMITS.maxY)
        },
        sensors,
        alignmentOffset: clamp(finite(value.alignmentOffset, 0.56), -1, 1),
        selectedImpact: clamp(finite(value.selectedImpact, 0), 0, 2)
    });
}

function distance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

export function getSeismicTelemetry(state) {
    const base = createSeismicState(state);
    const clarity = base.phase === 'complete'
        ? 1
        : (base.phase === 'placing' ? 0 : clamp(1 - Math.abs(base.alignmentOffset), 0, 1));
    const triangulation = base.phase === 'complete'
        ? 1
        : (base.phase === 'classifying'
            ? clamp(1 - Math.abs(base.selectedImpact - SEISMIC_LIMITS.correctImpact) / 2, 0, 0.85)
            : base.sensors.length / (SEISMIC_LIMITS.sensorTotal * 2));
    return Object.freeze({
        sensorsPlaced: base.sensors.length,
        total: SEISMIC_LIMITS.sensorTotal,
        signalClarity: clarity,
        triangulation,
        primary: base.sensors.length,
        secondary: clarity,
        tertiary: triangulation,
        primarySafe: base.sensors.length === SEISMIC_LIMITS.sensorTotal,
        secondarySafe: clarity >= 0.85,
        tertiarySafe: base.phase === 'complete'
    });
}

export function stepSeismic(state, input = {}, deltaSeconds = 0) {
    const base = createSeismicState(state);
    if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, SEISMIC_LIMITS.maxDeltaSeconds);
    const horizontal = clamp(finite(input.horizontal, 0), -1, 1);
    const vertical = clamp(finite(input.vertical, 0), -1, 1);
    const actionHeld = Boolean(input.activate);
    const activated = actionHeld && !base.actionHeld;
    const elapsedSeconds = base.elapsedSeconds + delta;

    if (base.phase === 'placing') {
        const cursor = {
            x: clamp(base.cursor.x + horizontal * CURSOR_RATE * delta, SEISMIC_LIMITS.minX, SEISMIC_LIMITS.maxX),
            y: clamp(base.cursor.y + vertical * CURSOR_RATE * delta, SEISMIC_LIMITS.minY, SEISMIC_LIMITS.maxY)
        };
        let sensors = base.sensors;
        let event = null;
        if (activated) {
            if (sensors.some((sensor) => distance(sensor, cursor) < SEISMIC_LIMITS.minimumSensorDistance)) {
                event = 'sensor-too-close';
            } else {
                sensors = [...sensors, { id: `sensor-${sensors.length + 1}`, ...cursor }];
                event = sensors.length === SEISMIC_LIMITS.sensorTotal ? 'sensors-ready' : 'sensor-placed';
            }
        }
        return createSeismicState({
            ...base,
            phase: sensors.length === SEISMIC_LIMITS.sensorTotal ? 'aligning' : 'placing',
            elapsedSeconds,
            event,
            actionHeld,
            cursor,
            sensors
        });
    }

    if (base.phase === 'aligning') {
        const alignmentOffset = clamp(
            base.alignmentOffset + horizontal * ALIGNMENT_RATE * delta,
            -1,
            1
        );
        const aligned = Math.abs(alignmentOffset) <= SEISMIC_LIMITS.alignmentTolerance;
        return createSeismicState({
            ...base,
            phase: activated && aligned ? 'classifying' : 'aligning',
            elapsedSeconds,
            event: activated ? (aligned ? 'pulse-aligned' : 'wrong-pulse') : null,
            actionHeld,
            alignmentOffset
        });
    }

    const selectedImpact = clamp(
        base.selectedImpact + horizontal * CANDIDATE_RATE * delta,
        0,
        2
    );
    const selectedIndex = Math.round(selectedImpact);
    const correct = activated && selectedIndex === SEISMIC_LIMITS.correctImpact;
    return createSeismicState({
        ...base,
        phase: correct ? 'complete' : 'classifying',
        elapsedSeconds,
        event: activated ? (correct ? 'seismic-solved' : 'wrong-pulse') : null,
        attempts: base.attempts + Number(activated && !correct),
        actionHeld,
        selectedImpact
    });
}
