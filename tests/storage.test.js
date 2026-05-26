import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Mock localStorage using a Map-based implementation.
 * Installed on globalThis before each test so the storage module
 * can use it transparently.
 */
function createLocalStorageMock() {
    const store = new Map();
    return {
        getItem: vi.fn((key) => {
            return store.has(key) ? store.get(key) : null;
        }),
        setItem: vi.fn((key, value) => {
            store.set(key, String(value));
        }),
        removeItem: vi.fn((key) => {
            store.delete(key);
        }),
        key: vi.fn((index) => {
            return [...store.keys()][index] ?? null;
        }),
        get length() {
            return store.size;
        },
        clear: vi.fn(() => {
            store.clear();
        }),
        _store: store, // expose for test inspection
    };
}

describe('storage utility', () => {
    let storage;
    let mockLS;

    beforeEach(async () => {
        mockLS = createLocalStorageMock();
        // Install mock before importing (or re-importing) the module
        globalThis.localStorage = mockLS;

        // Dynamically import so each test gets a fresh module evaluation
        // with our mock already in place.
        // Note: vitest caches modules, so we use import with a cache-busting query.
        // Instead, we just re-import since the module uses localStorage at call time,
        // not at import time.
        storage = await import('../src/utils/storage.js');
    });

    it('prefix is applied correctly on setItem / getItem', () => {
        storage.setItem('test_key', { value: 42 });

        // The raw localStorage call should have the prefixed key
        expect(mockLS.setItem).toHaveBeenCalledWith(
            'spaceExplorer_test_key',
            JSON.stringify({ value: 42 })
        );

        // getItem should return the parsed value
        const result = storage.getItem('test_key');
        expect(result).toEqual({ value: 42 });
    });

    it('getItem returns defaultValue on missing key', () => {
        const result = storage.getItem('nonexistent', 'fallback');
        expect(result).toBe('fallback');
    });

    it('getItem returns null as default when no defaultValue specified', () => {
        const result = storage.getItem('nonexistent');
        expect(result).toBeNull();
    });

    it('removeItem removes the prefixed key', () => {
        storage.setItem('to_remove', 'data');
        expect(storage.getItem('to_remove')).toBe('data');

        storage.removeItem('to_remove');
        expect(storage.getItem('to_remove')).toBeNull();
        expect(mockLS.removeItem).toHaveBeenCalledWith('spaceExplorer_to_remove');
    });

    it('clearAll only removes prefixed keys', () => {
        // Add some prefixed keys
        storage.setItem('key1', 'value1');
        storage.setItem('key2', 'value2');

        // Add a non-prefixed key directly
        mockLS._store.set('other_app_key', '"should_survive"');

        // Verify all three exist
        expect(mockLS._store.size).toBe(3);

        // Clear only our app's data
        storage.clearAll();

        // The non-prefixed key should still be there
        expect(mockLS._store.has('other_app_key')).toBe(true);
        expect(mockLS._store.size).toBe(1);

        // Our keys should be gone
        expect(storage.getItem('key1')).toBeNull();
        expect(storage.getItem('key2')).toBeNull();
    });

    it('error handling for JSON parse failures', () => {
        // Store an invalid JSON string directly in localStorage
        mockLS._store.set('spaceExplorer_bad_json', '{invalid json!!!');

        // getItem should not throw, should return default
        const result = storage.getItem('bad_json', 'safe_default');
        expect(result).toBe('safe_default');
    });

    it('setItem returns true on success and false on error', () => {
        const result = storage.setItem('good_key', 'value');
        expect(result).toBe(true);

        // Make setItem throw
        mockLS.setItem.mockImplementation(() => {
            throw new Error('QuotaExceeded');
        });

        const result2 = storage.setItem('fail_key', 'value');
        expect(result2).toBe(false);
    });

    it('removeItem returns true on success and false on error', () => {
        const result = storage.removeItem('any_key');
        expect(result).toBe(true);

        mockLS.removeItem.mockImplementation(() => {
            throw new Error('SecurityError');
        });

        const result2 = storage.removeItem('any_key');
        expect(result2).toBe(false);
    });
});
