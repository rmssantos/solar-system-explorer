const DAY_MS = 86_400_000;

export const ORBITAL_TIME_SCALES = Object.freeze([0, 1, 10, 100]);
export const DEFAULT_ORBITAL_TIME_SCALE = 1;

function supportedScale(value) {
    const scale = Number(value);
    return ORBITAL_TIME_SCALES.includes(scale) ? scale : null;
}

export function createOrbitalClock({ dateMs = Date.now(), timeScale = DEFAULT_ORBITAL_TIME_SCALE } = {}) {
    const timestamp = Number(dateMs);
    return Object.freeze({
        dateMs: Number.isFinite(timestamp) ? timestamp : Date.now(),
        timeScale: supportedScale(timeScale) ?? DEFAULT_ORBITAL_TIME_SCALE
    });
}

export function setOrbitalTimeScale(clock, timeScale) {
    const scale = supportedScale(timeScale);
    if (scale === null || scale === clock.timeScale) return clock;
    return createOrbitalClock({ ...clock, timeScale: scale });
}

export function resetOrbitalClockToToday(clock, dateMs = Date.now()) {
    return createOrbitalClock({ dateMs, timeScale: clock.timeScale });
}

export function stepOrbitalClock(clock, deltaSeconds) {
    const delta = Number(deltaSeconds);
    if (!Number.isFinite(delta) || delta <= 0 || clock.timeScale === 0) return clock;
    return createOrbitalClock({
        dateMs: clock.dateMs + delta * clock.timeScale * DAY_MS,
        timeScale: clock.timeScale
    });
}

export function presentOrbitalClock(clock) {
    const paused = clock.timeScale === 0;
    return Object.freeze({
        dateMs: clock.dateMs,
        isoDate: new Date(clock.dateMs).toISOString(),
        timeScale: clock.timeScale,
        paused,
        daysPerSecond: clock.timeScale,
        satelliteFactor: paused ? 0 : Math.min(30, clock.timeScale),
        rotationFactor: paused ? 0 : Math.min(10, Math.sqrt(clock.timeScale))
    });
}
