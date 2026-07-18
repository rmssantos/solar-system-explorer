import { LIVING_SKY_EVENTS, getLivingSkyEvent } from './livingSkyCatalog.js';

const DAY_MS = 86_400_000;
const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;

export function getLivingSkyEventWindow(eventId, dateMs = Date.now()) {
    const event = getLivingSkyEvent(eventId);
    if (!event) return null;
    const now = finite(Number(dateMs), Date.now());
    const periodMs = event.schedule.periodDays * DAY_MS;
    const durationMs = event.schedule.durationDays * DAY_MS;
    const cycle = Math.floor((now - event.schedule.epochMs) / periodMs);
    const cycleStart = event.schedule.epochMs + cycle * periodMs;
    const cycleEnd = cycleStart + durationMs;
    const active = now >= cycleStart && now < cycleEnd;
    const startMs = active || now < cycleEnd ? cycleStart : cycleStart + periodMs;
    return Object.freeze({
        eventId,
        active,
        startMs,
        endMs: startMs + durationMs,
        cycle: active ? cycle : cycle + (now >= cycleEnd ? 1 : 0)
    });
}
export function getNextLivingSkyObservationDate(eventId, dateMs = Date.now()) {
    const window = getLivingSkyEventWindow(eventId, dateMs);
    if (!window) return null;
    return window.active ? Number(dateMs) : window.startMs + Math.min(DAY_MS * 0.25, (window.endMs - window.startMs) / 2);
}

function presentEvent(event, window, language) {
    const locale = language === 'en' ? 'en' : 'pt';
    return Object.freeze({ ...event, ...event.copy[locale], copy: event.copy[locale], window });
}

export function presentLivingSky(dateMs = Date.now(), language = 'pt') {
    const locale = language === 'en' ? 'en' : 'pt';
    const windows = LIVING_SKY_EVENTS.map((event) => ({ event, window: getLivingSkyEventWindow(event.id, dateMs) }));
    const activeEvents = windows
        .filter(({ window }) => window.active)
        .map(({ event, window }) => presentEvent(event, window, locale));
    const allEvents = windows.map(({ event, window }) => presentEvent(event, window, locale));
    const upcomingEvents = windows.map(({ event, window }) => {
        const nextWindow = window.active
            ? getLivingSkyEventWindow(event.id, window.endMs + 1)
            : window;
        return presentEvent(event, nextWindow, locale);
    }).sort((a, b) => a.window.startMs - b.window.startMs).slice(0, 3);
    return Object.freeze({
        dateMs: Number(dateMs),
        simulationDisclosure: locale === 'en'
            ? 'Observation windows are a learning simulation inside the compressed paper diorama.'
            : 'As janelas de observação são uma simulação educativa dentro do diorama de papel comprimido.',
        activeEvents: Object.freeze(activeEvents),
        upcomingEvents: Object.freeze(upcomingEvents),
        allEvents: Object.freeze(allEvents)
    });
}

export function assessLivingSkyObservation(eventId, telemetry = {}) {
    const event = getLivingSkyEvent(eventId);
    const visible = Boolean(telemetry.visible);
    const filter = typeof telemetry.filter === 'string' ? telemetry.filter : 'visible';
    const screenDistance = Math.max(0, finite(telemetry.screenDistance, 1));
    const worldDistance = Math.max(0, finite(telemetry.worldDistance, Infinity));
    const stability = clamp(finite(telemetry.stability, 0));
    const active = Boolean(telemetry.active);
    const alignment = visible ? clamp(1 - screenDistance / 0.5) : 0;
    const distanceSafe = event
        ? worldDistance >= event.distanceRange[0] && worldDistance <= event.distanceRange[1]
        : Number.isFinite(worldDistance);
    const distanceScore = distanceSafe ? 1 : clamp(1 - Math.abs(worldDistance - 10) / 30);
    const filterCorrect = event ? filter === event.preferredFilter : true;
    const score = clamp(alignment * 0.45 + stability * 0.2 + distanceScore * 0.15 + (filterCorrect ? 0.2 : 0));
    const ready = visible;
    const qualified = Boolean(event && active && visible && screenDistance <= 0.18
        && stability >= 0.65 && distanceSafe && filterCorrect && score >= 0.72);
    let feedback = 'find-target';
    if (!event && ready) feedback = 'free-photo';
    else if (event && !active && ready) feedback = 'outside-window';
    else if (event && ready && screenDistance > 0.18) feedback = 'center-target';
    else if (event && ready && stability < 0.65) feedback = 'hold-steady';
    else if (event && ready && !distanceSafe) feedback = 'adjust-distance';
    else if (event && ready && !filterCorrect) feedback = 'try-instrument';
    else if (qualified) feedback = 'ready';
    return Object.freeze({
        eventId: event?.id ?? null,
        ready,
        qualified,
        score: Number(score.toFixed(3)),
        alignment: Number(alignment.toFixed(3)),
        stability,
        distanceSafe,
        filterCorrect,
        feedback
    });
}
