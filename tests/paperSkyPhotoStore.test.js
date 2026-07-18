import { describe, expect, it, vi } from 'vitest';
import { createSkyPhotoStore } from '../paper-preview/src/living-sky/photoStore.js';

function asyncRequest(result) {
    const request = {};
    queueMicrotask(() => {
        request.result = result;
        request.onsuccess?.({ target: request });
    });
    return request;
}

function createFakeIndexedDb() {
    const values = new Map();
    const objectStore = {
        put: (value, key) => { values.set(key, value); return asyncRequest(key); },
        get: (key) => asyncRequest(values.get(key)),
        delete: (key) => { values.delete(key); return asyncRequest(undefined); }
    };
    const database = {
        objectStoreNames: { contains: () => true },
        createObjectStore() {},
        transaction: () => {
            const transaction = { objectStore: () => objectStore };
            queueMicrotask(() => transaction.oncomplete?.({ target: transaction }));
            return transaction;
        },
        close: vi.fn()
    };
    return {
        values,
        open() {
            const request = {};
            queueMicrotask(() => {
                request.result = database;
                request.onupgradeneeded?.({ target: request });
                request.onsuccess?.({ target: request });
            });
            return request;
        },
        database
    };
}

describe('Living Sky IndexedDB photo store', () => {
    it('writes, reads and deletes blobs in the persistent store', async () => {
        const indexedDBRef = createFakeIndexedDb();
        const store = createSkyPhotoStore({ indexedDBRef });
        const blob = new Blob(['paper-photo'], { type: 'image/webp' });
        expect(await store.put('photo-1', blob)).toBe(true);
        expect(await store.get('photo-1')).toBe(blob);
        expect(indexedDBRef.values.get('photo-1')).toBe(blob);
        expect(await store.delete('photo-1')).toBe(true);
        expect(await store.get('photo-1')).toBeNull();
        store.destroy();
        expect(indexedDBRef.database.close).toHaveBeenCalledOnce();
    });

    it('falls back to memory when IndexedDB is unavailable or blocked', async () => {
        const store = createSkyPhotoStore({ indexedDBRef: { open() { throw new Error('blocked'); } } });
        const blob = new Blob(['fallback'], { type: 'image/webp' });
        expect(await store.put('photo-2', blob)).toBe(false);
        expect(await store.get('photo-2')).toBe(blob);
        expect(await store.delete('photo-2')).toBe(false);
        expect(await store.get('photo-2')).toBeNull();
    });

    it('creates and revokes safe object URLs for album previews', async () => {
        const urlApi = { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() };
        const store = createSkyPhotoStore({ indexedDBRef: null, urlApi });
        await store.put('photo-3', new Blob(['preview'], { type: 'image/webp' }));
        expect(await store.getObjectUrl('photo-3')).toBe('blob:preview');
        expect(await store.getObjectUrl('photo-3')).toBe('blob:preview');
        expect(urlApi.createObjectURL).toHaveBeenCalledOnce();
        expect(store.revokeObjectUrl('photo-3')).toBe(true);
        expect(urlApi.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
        store.destroy();
        expect(urlApi.revokeObjectURL).toHaveBeenCalledOnce();
    });

    it('reports a failed write when the transaction aborts after request success', async () => {
        const indexedDBRef = createFakeIndexedDb();
        indexedDBRef.database.transaction = () => {
            const transaction = { objectStore: () => ({ put: (_value, key) => asyncRequest(key) }) };
            queueMicrotask(() => {
                transaction.error = new Error('commit failed');
                transaction.onabort?.({ target: transaction });
            });
            return transaction;
        };
        const store = createSkyPhotoStore({ indexedDBRef });
        expect(await store.put('photo-abort', new Blob(['lost']))).toBe(false);
    });
});
