const STORAGE_KEY = 'paperSolarExplorer:progress:v1';

export function loadProgress(storage = globalThis.localStorage) {
    try {
        const value = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
        return {
            discoveredKeys: Array.isArray(value.discoveredKeys) ? value.discoveredKeys : [],
            completedQuizIds: Array.isArray(value.completedQuizIds) ? value.completedQuizIds : [],
            xp: Number.isFinite(value.xp) ? value.xp : 0,
            awardedEventIds: Array.isArray(value.awardedEventIds) ? value.awardedEventIds : [],
            seenSurpriseIds: Array.isArray(value.seenSurpriseIds) ? value.seenSurpriseIds : []
        };
    } catch {
        return { discoveredKeys: [], completedQuizIds: [], xp: 0, awardedEventIds: [], seenSurpriseIds: [] };
    }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
    try {
        storage?.setItem(STORAGE_KEY, JSON.stringify({
            discoveredKeys: [...new Set(progress.discoveredKeys ?? [])],
            completedQuizIds: [...new Set(progress.completedQuizIds ?? [])],
            xp: Number.isFinite(progress.xp) ? progress.xp : 0,
            awardedEventIds: [...new Set(progress.awardedEventIds ?? [])],
            seenSurpriseIds: [...new Set(progress.seenSurpriseIds ?? [])]
        }));
        return true;
    } catch {
        return false;
    }
}
