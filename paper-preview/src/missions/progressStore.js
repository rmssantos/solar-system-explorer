const STORAGE_KEY = 'paperSolarExplorer:progress:v1';

export function loadProgress(storage = globalThis.localStorage) {
    try {
        const value = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
        return {
            discoveredKeys: Array.isArray(value.discoveredKeys) ? value.discoveredKeys : [],
            completedQuizIds: Array.isArray(value.completedQuizIds) ? value.completedQuizIds : [],
            xp: Number.isFinite(value.xp) ? value.xp : 0,
            awardedEventIds: Array.isArray(value.awardedEventIds) ? value.awardedEventIds : [],
            seenSurpriseIds: Array.isArray(value.seenSurpriseIds) ? value.seenSurpriseIds : [],
            acceptedContractIds: Array.isArray(value.acceptedContractIds) ? value.acceptedContractIds : [],
            completedContractIds: Array.isArray(value.completedContractIds) ? value.completedContractIds : [],
            contractAttempts: value.contractAttempts && typeof value.contractAttempts === 'object' && !Array.isArray(value.contractAttempts)
                ? value.contractAttempts
                : {},
            seenMissionTrainingIds: Array.isArray(value.seenMissionTrainingIds)
                ? [...new Set(value.seenMissionTrainingIds.filter((item) => typeof item === 'string'))]
                : [],
            expeditionVersion: Number.isFinite(value.expeditionVersion) ? value.expeditionVersion : 1,
            acceptedExpeditionChapterIds: Array.isArray(value.acceptedExpeditionChapterIds)
                ? [...new Set(value.acceptedExpeditionChapterIds.filter((item) => typeof item === 'string'))]
                : [],
            completedExpeditionChapterIds: Array.isArray(value.completedExpeditionChapterIds)
                ? [...new Set(value.completedExpeditionChapterIds.filter((item) => typeof item === 'string'))]
                : [],
            expeditionEvidenceIds: Array.isArray(value.expeditionEvidenceIds)
                ? [...new Set(value.expeditionEvidenceIds.filter((item) => typeof item === 'string'))]
                : [],
            expeditionUpgradeIds: Array.isArray(value.expeditionUpgradeIds)
                ? [...new Set(value.expeditionUpgradeIds.filter((item) => typeof item === 'string'))]
                : [],
            expeditionAttempts: value.expeditionAttempts && typeof value.expeditionAttempts === 'object' && !Array.isArray(value.expeditionAttempts)
                ? value.expeditionAttempts
                : {},
            agencyActiveMissions: Array.isArray(value.agencyActiveMissions) ? value.agencyActiveMissions : [],
            agencyReports: Array.isArray(value.agencyReports) ? value.agencyReports : []
        };
    } catch {
        return {
            discoveredKeys: [], completedQuizIds: [], xp: 0, awardedEventIds: [], seenSurpriseIds: [],
            acceptedContractIds: [], completedContractIds: [], agencyActiveMissions: [], agencyReports: []
            , contractAttempts: {}, seenMissionTrainingIds: []
            , expeditionVersion: 1, acceptedExpeditionChapterIds: [], completedExpeditionChapterIds: []
            , expeditionEvidenceIds: [], expeditionUpgradeIds: [], expeditionAttempts: {}
        };
    }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
    try {
        storage?.setItem(STORAGE_KEY, JSON.stringify({
            discoveredKeys: [...new Set(progress.discoveredKeys ?? [])],
            completedQuizIds: [...new Set(progress.completedQuizIds ?? [])],
            xp: Number.isFinite(progress.xp) ? progress.xp : 0,
            awardedEventIds: [...new Set(progress.awardedEventIds ?? [])],
            seenSurpriseIds: [...new Set(progress.seenSurpriseIds ?? [])],
            acceptedContractIds: [...new Set(progress.acceptedContractIds ?? [])],
            completedContractIds: [...new Set(progress.completedContractIds ?? [])],
            contractAttempts: progress.contractAttempts && typeof progress.contractAttempts === 'object' && !Array.isArray(progress.contractAttempts)
                ? progress.contractAttempts
                : {},
            seenMissionTrainingIds: [...new Set(progress.seenMissionTrainingIds ?? [])],
            expeditionVersion: Number.isFinite(progress.expeditionVersion) ? progress.expeditionVersion : 1,
            acceptedExpeditionChapterIds: [...new Set(progress.acceptedExpeditionChapterIds ?? [])],
            completedExpeditionChapterIds: [...new Set(progress.completedExpeditionChapterIds ?? [])],
            expeditionEvidenceIds: [...new Set(progress.expeditionEvidenceIds ?? [])],
            expeditionUpgradeIds: [...new Set(progress.expeditionUpgradeIds ?? [])],
            expeditionAttempts: progress.expeditionAttempts && typeof progress.expeditionAttempts === 'object' && !Array.isArray(progress.expeditionAttempts)
                ? progress.expeditionAttempts
                : {},
            agencyActiveMissions: Array.isArray(progress.agencyActiveMissions)
                ? progress.agencyActiveMissions.filter((value) => value && typeof value === 'object')
                : [],
            agencyReports: Array.isArray(progress.agencyReports)
                ? progress.agencyReports.filter((value) => value && typeof value === 'object')
                : []
        }));
        return true;
    } catch {
        return false;
    }
}
