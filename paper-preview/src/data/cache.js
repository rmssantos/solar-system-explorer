const CACHE_PREFIX = 'paperSpaceData:';

export function readDataCache(storage, key) {
    try {
        const raw = storage?.getItem?.(`${CACHE_PREFIX}${key}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Number.isFinite(parsed.cachedAt) || typeof parsed.data !== 'object') return null;
        return parsed;
    } catch {
        return null;
    }
}

export function writeDataCache(storage, key, value) {
    try {
        storage?.setItem?.(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}
