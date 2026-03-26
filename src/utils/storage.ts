/**
 * Safe localStorage utility (TypeScript)
 * Handles errors from private browsing mode, quota exceeded, etc.
 */

const STORAGE_PREFIX = 'spaceExplorer_';

export function getItem<T>(key: string, defaultValue: T): T {
    try {
        const value = localStorage.getItem(STORAGE_PREFIX + key);
        if (value === null) return defaultValue;
        return JSON.parse(value) as T;
    } catch {
        return defaultValue;
    }
}

export function setItem(key: string, value: unknown): boolean {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

export function removeItem(key: string): boolean {
    try {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return true;
    } catch {
        return false;
    }
}

export function clearAll(): boolean {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return true;
    } catch {
        return false;
    }
}

export function getRaw<T>(fullKey: string, defaultValue: T): T {
    try {
        const value = localStorage.getItem(fullKey);
        if (value === null) return defaultValue;
        return JSON.parse(value) as T;
    } catch {
        return defaultValue;
    }
}

export function setRaw(fullKey: string, value: unknown): boolean {
    try {
        localStorage.setItem(fullKey, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

export function removeRaw(fullKey: string): boolean {
    try {
        localStorage.removeItem(fullKey);
        return true;
    } catch {
        return false;
    }
}
