import { getAgencyCapacity } from './agencyState.js';
import { getLocalizedOperation } from './operationDirector.js';

export function formatAgencyDuration(milliseconds, language = 'pt') {
    const seconds = Math.max(0, Math.ceil((Number.isFinite(milliseconds) ? milliseconds : 0) / 1000));
    if (seconds === 0) return language === 'en' ? 'Complete' : 'Concluída';
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    if (minutes === 0) return `${remainder} s`;
    return remainder === 0 ? `${minutes} min` : `${minutes} min ${remainder} s`;
}

function operationForRecord(record, operations) {
    return operations.find((candidate) => candidate.id === record.operationId) ?? {
        id: record.operationId,
        kind: record.kind,
        targetKey: record.targetKey,
        durationMs: Math.max(1, (record.endsAt ?? 1) - (record.startedAt ?? 0)),
        recommendedInstrumentId: record.instrumentId,
        recommendedPowerProfileId: record.powerProfileId,
        facts: record.facts ?? {},
        source: record.source ?? {
            status: record.sourceStatus,
            name: record.sourceName,
            url: record.sourceUrl
        }
    };
}

export function presentAgencyState(state, operations = [], language = 'pt', nowMs = Date.now()) {
    const currentTime = Number.isFinite(nowMs) ? nowMs : Date.now();
    const activeMissions = (state?.activeMissions ?? []).map((mission) => {
        const localized = getLocalizedOperation(operationForRecord(mission, operations), language);
        const duration = Math.max(1, mission.endsAt - mission.startedAt);
        const progressPercent = Math.max(0, Math.min(100, Math.round(((currentTime - mission.startedAt) / duration) * 100)));
        return Object.freeze({
            ...mission,
            title: localized.title,
            summary: localized.summary,
            progressPercent,
            remainingMs: Math.max(0, mission.endsAt - currentTime),
            remainingLabel: formatAgencyDuration(mission.endsAt - currentTime, language)
        });
    });
    const reports = (state?.reports ?? []).map((report) => {
        const localized = getLocalizedOperation(operationForRecord(report, operations), language);
        return Object.freeze({ ...report, title: localized.title, summary: localized.summary });
    });
    return Object.freeze({
        capacity: getAgencyCapacity(state),
        activeMissions: Object.freeze(activeMissions),
        reports: Object.freeze(reports)
    });
}
