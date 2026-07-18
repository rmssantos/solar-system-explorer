export const PLUME_LIMITS = Object.freeze({ maxPosition: 1, maxDeltaSeconds: 0.25, totalSamples: 5, catchRadius: 0.18 });

const DEFAULT_GRAINS = Object.freeze([
    { id: 'c1', x: -0.72, y: -0.6, size: 'small' }, { id: 'c2', x: -0.3, y: -0.22, size: 'small' },
    { id: 'b1', x: 0.05, y: -0.48, size: 'large' }, { id: 'c3', x: 0.42, y: -0.58, size: 'small' },
    { id: 'c4', x: 0.72, y: -0.08, size: 'small' }, { id: 'b2', x: -0.52, y: 0.25, size: 'large' },
    { id: 'c5', x: -0.08, y: 0.2, size: 'small' }, { id: 'c6', x: 0.34, y: 0.5, size: 'small' },
    { id: 'c7', x: 0.78, y: 0.62, size: 'small' }, { id: 'b3', x: 0.02, y: 0.76, size: 'large' }
]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;

function freezeState(value) {
    return Object.freeze({ ...value, position: Object.freeze({ ...value.position }), grains: Object.freeze(value.grains.map((grain) => Object.freeze({ ...grain }))) });
}

export function createPlumeState(value = {}) {
    const samples = Math.round(clamp(finite(value.samples, 0), 0, PLUME_LIMITS.totalSamples));
    const phase = samples >= PLUME_LIMITS.totalSamples || value.phase === 'complete' ? 'complete' : 'collecting';
    const source = Array.isArray(value.grains) && value.grains.length ? value.grains : DEFAULT_GRAINS;
    return freezeState({
        phase, elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: phase === 'complete' ? 'plume-sampled' : (typeof value.event === 'string' ? value.event : null),
        position: { x: clamp(finite(value.position?.x, -0.82), -1, 1), y: clamp(finite(value.position?.y, 0.55), -1, 1) },
        samples, purity: clamp(finite(value.purity, 1), 0, 1), cooling: clamp(finite(value.cooling, 1), 0, 1),
        collector: phase !== 'complete' && Boolean(value.collector),
        grains: source.slice(0, 24).map((grain, index) => ({
            id: String(grain?.id ?? `g${index}`).slice(0, 24), x: clamp(finite(grain?.x, 0), -1, 1),
            y: clamp(finite(grain?.y, 0), -1, 1), size: grain?.size === 'large' ? 'large' : 'small', collected: Boolean(grain?.collected)
        }))
    });
}

export function getPlumeTelemetry(state) {
    const base = createPlumeState(state);
    return Object.freeze({
        samples: base.samples, total: PLUME_LIMITS.totalSamples, purity: base.purity, cooling: base.cooling,
        primary: base.samples / PLUME_LIMITS.totalSamples, secondary: base.purity, tertiary: base.cooling,
        primarySafe: base.samples >= PLUME_LIMITS.totalSamples, secondarySafe: base.purity >= 0.7, tertiarySafe: base.cooling >= 0.45
    });
}

export function stepPlume(state, input = {}, deltaSeconds = 0) {
    const base = createPlumeState(state);
    if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, PLUME_LIMITS.maxDeltaSeconds);
    const position = {
        x: clamp(base.position.x + clamp(finite(input.horizontal, 0), -1, 1) * 1.18 * delta, -1, 1),
        y: clamp(base.position.y - clamp(finite(input.vertical, 0), -1, 1) * 1.18 * delta, -1, 1)
    };
    let collector = Boolean(input.collector);
    let samples = base.samples;
    let purity = base.purity;
    let cooling = clamp(base.cooling + (collector ? -0.28 : 0.22) * delta, 0, 1);
    let event = null;
    const grains = base.grains.map((grain) => ({ ...grain }));
    if (collector && cooling > 0.16) {
        const hit = grains.find((grain) => !grain.collected && Math.hypot(grain.x - position.x, grain.y - position.y) <= PLUME_LIMITS.catchRadius + (grain.size === 'large' ? 0.06 : 0));
        if (hit) {
            hit.collected = true;
            if (hit.size === 'large') {
                event = 'large-grain-hit'; collector = false; purity = clamp(purity - 0.22, 0, 1); cooling = clamp(cooling - 0.18, 0, 1);
            } else samples = Math.min(PLUME_LIMITS.totalSamples, samples + 1);
        }
    }
    const complete = samples >= PLUME_LIMITS.totalSamples;
    return createPlumeState({ ...base, phase: complete ? 'complete' : 'collecting', elapsedSeconds: base.elapsedSeconds + delta,
        event: complete ? 'plume-sampled' : event, position, samples, purity, cooling, collector: complete ? false : collector, grains });
}
