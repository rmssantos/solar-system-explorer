/**
 * Safe localStorage utility
 * Handles errors from private browsing mode, quota exceeded, etc.
 *
 * The spaceExplorer_* keys ARE the save file (there is no backend).
 * Do not rename keys without adding a migration in migrateSchema().
 */

const STORAGE_PREFIX = 'spaceExplorer_';

// Bump when the shape of any stored value changes, and handle the
// transition in migrateSchema().
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Safely get an item from localStorage
 * @param {string} key - The key (without prefix)
 * @param {*} defaultValue - Default value if not found or error
 * @returns {*} The stored value or defaultValue
 */
export function getItem(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(STORAGE_PREFIX + key);
        if (value === null) return defaultValue;
        return JSON.parse(value);
    } catch (e) {
        console.warn(`[Storage] Failed to get "${key}":`, e.message);
        return defaultValue;
    }
}

/**
 * Safely set an item in localStorage
 * @param {string} key - The key (without prefix)
 * @param {*} value - The value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn(`[Storage] Failed to set "${key}":`, e.message);
        return false;
    }
}

/**
 * Safely remove an item from localStorage
 * @param {string} key - The key (without prefix)
 * @returns {boolean} True if successful, false otherwise
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return true;
    } catch (e) {
        console.warn(`[Storage] Failed to remove "${key}":`, e.message);
        return false;
    }
}

/**
 * Safely clear all app data from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export function clearAll() {
    try {
        // Only clear our app's data, not everything
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return true;
    } catch (e) {
        console.warn('[Storage] Failed to clear:', e.message);
        return false;
    }
}

/**
 * Stamp/upgrade the save-data schema version. Called once at startup,
 * before any system loads its state. Pre-versioned saves (from before
 * this mechanism existed) are adopted as-is and stamped v1.
 */
export function migrateSchema() {
    const stored = getItem('schemaVersion', null);
    if (stored === CURRENT_SCHEMA_VERSION) return;

    // Future migrations go here, e.g.:
    // if (stored === 1) { ...reshape v1 keys into v2...; }

    setItem('schemaVersion', CURRENT_SCHEMA_VERSION);
}

/**
 * Get raw item without prefix (for legacy keys)
 * @param {string} fullKey - The full key including any prefix
 * @param {*} defaultValue - Default value if not found or error
 * @returns {*} The stored value or defaultValue
 */
export function getRaw(fullKey, defaultValue = null) {
    try {
        const value = localStorage.getItem(fullKey);
        if (value === null) return defaultValue;
        return JSON.parse(value);
    } catch (e) {
        console.warn(`[Storage] Failed to get raw "${fullKey}":`, e.message);
        return defaultValue;
    }
}

/**
 * Set raw item without prefix (for legacy keys)
 * @param {string} fullKey - The full key including any prefix
 * @param {*} value - The value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
export function setRaw(fullKey, value) {
    try {
        localStorage.setItem(fullKey, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn(`[Storage] Failed to set raw "${fullKey}":`, e.message);
        return false;
    }
}

/**
 * Remove raw item without prefix (for legacy keys)
 * @param {string} fullKey - The full key including any prefix
 * @returns {boolean} True if successful, false otherwise
 */
export function removeRaw(fullKey) {
    try {
        localStorage.removeItem(fullKey);
        return true;
    } catch (e) {
        console.warn(`[Storage] Failed to remove raw "${fullKey}":`, e.message);
        return false;
    }
}
