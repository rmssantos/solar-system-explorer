export const AGENCY_JOURNEY_STAGES = Object.freeze([
    'mission',
    'equip',
    'travel',
    'investigate',
    'discovery'
]);

function operationReports(reports, operationId) {
    return (Array.isArray(reports) ? reports : [])
        .filter((report) => report?.operationId === operationId && Number.isFinite(report.quality));
}

export function getOperationHistory(reports, operationId) {
    const attempts = operationReports(reports, operationId);
    const bestReport = attempts.reduce((best, report) => (
        !best || report.quality > best.quality ? report : best
    ), null);
    return Object.freeze({
        attempts: attempts.length,
        bestQuality: bestReport?.quality ?? 0,
        bestScienceScore: Number.isFinite(bestReport?.scienceScore) ? bestReport.scienceScore : 0,
        bestReport
    });
}

export function getAgencyMastery(history = {}) {
    const attempts = Math.max(0, Number(history.attempts) || 0);
    const quality = Math.max(0, Number(history.bestQuality) || 0);
    if (attempts === 0) return Object.freeze({ id: 'new', level: 0 });
    if (quality >= 90) return Object.freeze({ id: 'specialist', level: 3 });
    if (quality >= 70) return Object.freeze({ id: 'investigator', level: 2 });
    return Object.freeze({ id: 'discovered', level: 1 });
}

export function createAgencyJourney({ operationId = null, reports = [] } = {}) {
    const history = getOperationHistory(reports, operationId);
    return Object.freeze({
        operationId,
        stage: AGENCY_JOURNEY_STAGES[0],
        stageIndex: 0,
        tutorial: history.attempts === 0,
        attempt: history.attempts + 1
    });
}

export function advanceAgencyJourney(journey, requestedStage = null) {
    if (!journey) return journey;
    const nextIndex = Math.min(AGENCY_JOURNEY_STAGES.length - 1, journey.stageIndex + 1);
    if (nextIndex === journey.stageIndex) return journey;
    const nextStage = AGENCY_JOURNEY_STAGES[nextIndex];
    if (requestedStage !== null && requestedStage !== nextStage) return journey;
    return Object.freeze({ ...journey, stage: nextStage, stageIndex: nextIndex });
}
