import {
    INSTRUMENT_CATALOG,
    POWER_PROFILE_CATALOG,
    ROUTE_PROFILE_CATALOG,
    getAgencyCatalogItem
} from './agencyCatalog.js';

export const MAX_ACTIVE_AGENCY_MISSIONS = 3;

function finiteTimestamp(value, fallback = 0) {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
}

function freezeMission(value) {
    return Object.freeze({
        ...value,
        facts: Object.freeze({ ...(value.facts ?? {}) }),
        source: Object.freeze({ ...(value.source ?? {}) })
    });
}

function freezeReport(value) {
    return Object.freeze({
        ...value,
        facts: Object.freeze({ ...(value.facts ?? {}) })
    });
}

function isStoredMission(value) {
    return value
        && typeof value.id === 'string'
        && typeof value.operationId === 'string'
        && typeof value.kind === 'string'
        && typeof value.targetKey === 'string'
        && Number.isFinite(value.startedAt)
        && Number.isFinite(value.endsAt)
        && value.endsAt >= value.startedAt
        && Boolean(getAgencyCatalogItem(INSTRUMENT_CATALOG, value.instrumentId))
        && Boolean(getAgencyCatalogItem(POWER_PROFILE_CATALOG, value.powerProfileId))
        && Boolean(getAgencyCatalogItem(ROUTE_PROFILE_CATALOG, value.routeProfileId));
}

function isStoredReport(value) {
    return value
        && typeof value.id === 'string'
        && typeof value.missionId === 'string'
        && typeof value.operationId === 'string'
        && typeof value.kind === 'string'
        && typeof value.targetKey === 'string'
        && Number.isFinite(value.completedAt)
        && Number.isFinite(value.quality)
        && value.quality >= 0
        && value.quality <= 100
        && typeof value.collected === 'boolean';
}

export function createAgencyState(value = {}) {
    const activeMissions = Array.isArray(value.activeMissions)
        ? value.activeMissions.filter(isStoredMission).map(freezeMission)
        : [];
    const reports = Array.isArray(value.reports)
        ? value.reports.filter(isStoredReport).map(freezeReport)
        : [];
    return Object.freeze({
        activeMissions: Object.freeze(activeMissions),
        reports: Object.freeze(reports)
    });
}

export function getAgencyCapacity(state) {
    const normalized = createAgencyState(state);
    const used = Math.min(MAX_ACTIVE_AGENCY_MISSIONS, normalized.activeMissions.length);
    return Object.freeze({ used, total: MAX_ACTIVE_AGENCY_MISSIONS, available: MAX_ACTIVE_AGENCY_MISSIONS - used });
}

function isValidOperation(operation) {
    return operation
        && typeof operation.id === 'string'
        && typeof operation.kind === 'string'
        && typeof operation.targetKey === 'string'
        && Number.isFinite(operation.durationMs)
        && operation.durationMs > 0;
}

function invalidConfiguration(operation, instrumentId, powerProfileId, routeProfileId) {
    return !isValidOperation(operation)
        || !getAgencyCatalogItem(INSTRUMENT_CATALOG, instrumentId)
        || !getAgencyCatalogItem(POWER_PROFILE_CATALOG, powerProfileId)
        || !getAgencyCatalogItem(ROUTE_PROFILE_CATALOG, routeProfileId);
}

/** @param {any} state @param {any} configuration */
export function launchAgencyMission(state, configuration = {}) {
    const {
        operation,
        instrumentId,
        powerProfileId,
        routeProfileId,
        nowMs = Date.now()
    } = configuration;
    const base = createAgencyState(state);
    if (invalidConfiguration(operation, instrumentId, powerProfileId, routeProfileId)) {
        return Object.freeze({ state, mission: null, error: 'invalid-configuration' });
    }
    if (base.activeMissions.length >= MAX_ACTIVE_AGENCY_MISSIONS) {
        return Object.freeze({ state, mission: null, error: 'capacity-full' });
    }
    if (base.activeMissions.some((mission) => mission.operationId === operation.id)) {
        return Object.freeze({ state, mission: null, error: 'already-active' });
    }

    const startedAt = finiteTimestamp(nowMs);
    const route = getAgencyCatalogItem(ROUTE_PROFILE_CATALOG, routeProfileId);
    const durationMs = Math.max(1, Math.round(operation.durationMs * route.durationMultiplier));
    const mission = freezeMission({
        id: `${operation.id}:${startedAt}`,
        operationId: operation.id,
        kind: operation.kind,
        targetKey: operation.targetKey,
        status: 'active',
        startedAt,
        endsAt: startedAt + durationMs,
        instrumentId,
        powerProfileId,
        routeProfileId,
        recommendedInstrumentId: operation.recommendedInstrumentId ?? null,
        recommendedPowerProfileId: operation.recommendedPowerProfileId ?? null,
        facts: operation.facts,
        source: operation.source
    });
    const next = createAgencyState({ ...base, activeMissions: [...base.activeMissions, mission] });
    return Object.freeze({ state: next, mission, error: null });
}

function reportQuality(mission) {
    const power = getAgencyCatalogItem(POWER_PROFILE_CATALOG, mission.powerProfileId);
    const route = getAgencyCatalogItem(ROUTE_PROFILE_CATALOG, mission.routeProfileId);
    const instrumentBonus = mission.instrumentId === mission.recommendedInstrumentId ? 25 : 0;
    const powerBonus = mission.powerProfileId === mission.recommendedPowerProfileId ? 10 : Math.min(5, power?.qualityBonus ?? 0);
    return Math.max(50, Math.min(100, 55 + instrumentBonus + powerBonus + (route?.qualityBonus ?? 0)));
}

function createReport(mission) {
    return freezeReport({
        id: `report:${mission.id}`,
        missionId: mission.id,
        operationId: mission.operationId,
        kind: mission.kind,
        targetKey: mission.targetKey,
        instrumentId: mission.instrumentId,
        powerProfileId: mission.powerProfileId,
        routeProfileId: mission.routeProfileId,
        quality: reportQuality(mission),
        facts: mission.facts,
        sourceStatus: mission.source?.status ?? 'fallback',
        sourceName: mission.source?.name ?? '',
        sourceUrl: mission.source?.url ?? '',
        completedAt: mission.endsAt,
        collected: false,
        collectedAt: null
    });
}

export function reconcileAgencyState(state, nowMs = Date.now()) {
    const base = createAgencyState(state);
    const currentTime = finiteTimestamp(nowMs);
    const completed = base.activeMissions.filter((mission) => currentTime >= mission.endsAt);
    if (completed.length === 0) return base;
    const existingReportIds = new Set(base.reports.map((report) => report.missionId));
    const reports = [
        ...base.reports,
        ...completed.filter((mission) => !existingReportIds.has(mission.id)).map(createReport)
    ];
    return createAgencyState({
        activeMissions: base.activeMissions.filter((mission) => currentTime < mission.endsAt),
        reports
    });
}

export function collectAgencyReport(state, reportId, nowMs = Date.now()) {
    const base = createAgencyState(state);
    const current = base.reports.find((report) => report.id === reportId);
    if (!current) return Object.freeze({ state, report: null, error: 'not-found' });
    if (current.collected) return Object.freeze({ state, report: current, error: 'already-collected' });
    const report = freezeReport({ ...current, collected: true, collectedAt: finiteTimestamp(nowMs) });
    const next = createAgencyState({
        ...base,
        reports: base.reports.map((candidate) => candidate.id === reportId ? report : candidate)
    });
    return Object.freeze({ state: next, report, error: null });
}
