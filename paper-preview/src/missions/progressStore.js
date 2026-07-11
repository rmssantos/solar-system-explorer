const STORAGE_KEY = 'paperSolarExplorer:progress:v1';

export function loadProgress(storage = globalThis.localStorage) {
    try {
        const value = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
        return {
            discoveredKeys: Array.isArray(value.discoveredKeys) ? value.discoveredKeys : [],
            completedQuizIds: Array.isArray(value.completedQuizIds) ? value.completedQuizIds : []
        };
    } catch {
        return { discoveredKeys: [], completedQuizIds: [] };
    }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
    try {
        storage?.setItem(STORAGE_KEY, JSON.stringify({
            discoveredKeys: [...new Set(progress.discoveredKeys ?? [])],
            completedQuizIds: [...new Set(progress.completedQuizIds ?? [])]
        }));
        return true;
    } catch {
        return false;
    }
}
