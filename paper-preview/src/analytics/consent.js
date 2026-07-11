export const ANALYTICS_CONSENT_KEY = 'paperSolarExplorer:analyticsConsent';
export const ANALYTICS_POLICY_VERSION = 1;
export const ANALYTICS_CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

function safeStorage(storage = globalThis.localStorage) {
    try {
        return storage ?? null;
    } catch {
        return null;
    }
}

/** @param {any} storage */
export function readAnalyticsConsent(storage = globalThis.localStorage, now = new Date()) {
    try {
        const raw = safeStorage(storage)?.getItem(ANALYTICS_CONSENT_KEY);
        if (!raw) return 'pending';
        const record = JSON.parse(raw);
        const updatedAt = new Date(record.updatedAt).getTime();
        const currentTime = new Date(now).getTime();
        if (record.version !== ANALYTICS_POLICY_VERSION) return 'pending';
        if (!['granted', 'denied'].includes(record.choice)) return 'pending';
        if (!Number.isFinite(updatedAt) || currentTime - updatedAt > ANALYTICS_CONSENT_MAX_AGE_MS) return 'pending';
        return record.choice;
    } catch {
        return 'pending';
    }
}

/** @param {any} storage */
export function writeAnalyticsConsent(storage = globalThis.localStorage, choice, now = new Date()) {
    if (!['granted', 'denied'].includes(choice)) throw new TypeError('Unsupported analytics consent choice');
    try {
        safeStorage(storage)?.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({
            version: ANALYTICS_POLICY_VERSION,
            choice,
            updatedAt: new Date(now).toISOString()
        }));
    } catch {}
    return choice;
}

/** @param {any} storage */
export function clearAnalyticsConsent(storage = globalThis.localStorage) {
    try {
        safeStorage(storage)?.removeItem(ANALYTICS_CONSENT_KEY);
    } catch {}
}
