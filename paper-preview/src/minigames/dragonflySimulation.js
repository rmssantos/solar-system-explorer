export const DRAGONFLY_SITES = Object.freeze([
    Object.freeze({ id: 'dunes', routeProgress: 0.45 }),
    Object.freeze({ id: 'lake-shore', routeProgress: 0.84 })
]);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const MAX_LANDING_ALTITUDE = 0.32;

export function createDragonflyState(value = {}) {
    const analysedSites = [...new Set((Array.isArray(value.analysedSites) ? value.analysedSites : []).filter((id) => DRAGONFLY_SITES.some((site) => site.id === id)))];
    const complete = value.phase === 'complete' || analysedSites.length === DRAGONFLY_SITES.length;
    return Object.freeze({
        phase: complete ? 'complete' : 'flying', elapsedSeconds: Math.max(0, finite(value.elapsedSeconds, 0)),
        event: complete ? 'dragonfly-landed' : (typeof value.event === 'string' ? value.event : null),
        routeProgress: clamp(finite(value.routeProgress, 0), 0, 1), altitude: clamp(finite(value.altitude, 0.5), 0.12, 1),
        stability: clamp(finite(value.stability, 1), 0, 1), wind: clamp(finite(value.wind, 0), -1, 1),
        analysedSites: Object.freeze(analysedSites), actionHeld: complete ? false : Boolean(value.actionHeld)
    });
}

export function getDragonflyTelemetry(state) {
    const base = createDragonflyState(state); const siteConfidence = base.analysedSites.length / DRAGONFLY_SITES.length;
    return Object.freeze({ routeProgress: base.routeProgress, stability: base.stability, siteConfidence,
        primary: base.routeProgress, secondary: base.stability, tertiary: siteConfidence,
        primarySafe: base.routeProgress >= 0.8, secondarySafe: base.stability >= 0.55, tertiarySafe: siteConfidence >= 1 });
}

export function stepDragonfly(state, input = {}, deltaSeconds = 0) {
    const base = createDragonflyState(state); if (base.phase === 'complete') return base;
    const delta = clamp(finite(deltaSeconds, 0), 0, 0.25), horizontal = clamp(finite(input.horizontal, 0), -1, 1), vertical = clamp(finite(input.vertical, 0), -1, 1);
    const wind = Math.sin((base.elapsedSeconds + delta) * 1.37) * 0.72;
    const routeProgress = clamp(base.routeProgress + Math.max(0, horizontal) * 0.24 * delta - Math.max(0, -horizontal) * 0.16 * delta, 0, 1);
    const altitude = clamp(base.altitude + vertical * 0.52 * delta + wind * 0.035 * delta, 0.12, 1);
    const correction = 1 - Math.min(1, Math.abs(vertical + wind * 0.65));
    let stability = clamp(base.stability + (correction * 0.18 - 0.06) * delta, 0, 1);
    const action = Boolean(input.action), pressed = action && !base.actionHeld; const analysedSites = [...base.analysedSites]; let event = null;
    if (pressed) {
        const site = DRAGONFLY_SITES.find((candidate) => !analysedSites.includes(candidate.id) && Math.abs(routeProgress - candidate.routeProgress) <= 0.12);
        if (site) {
            if (site.id === 'lake-shore' && (stability < 0.55 || altitude > MAX_LANDING_ALTITUDE)) {
                event = 'rough-landing';
                stability = Math.max(0.5, stability);
            }
            else analysedSites.push(site.id);
        }
    }
    const complete = analysedSites.length === DRAGONFLY_SITES.length;
    return createDragonflyState({ ...base, phase: complete ? 'complete' : 'flying', elapsedSeconds: base.elapsedSeconds + delta,
        event: complete ? 'dragonfly-landed' : event, routeProgress, altitude, stability, wind, analysedSites, actionHeld: action });
}
