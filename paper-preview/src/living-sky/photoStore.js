const DATABASE_NAME = 'paperSolarExplorer:media:v1';
const STORE_NAME = 'living-sky-photos';

function requestPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
    });
}

export function createSkyPhotoStore(options = {}) {
    let indexedDBRef = options.indexedDBRef;
    let urlApi = options.urlApi;
    try {
        if (indexedDBRef === undefined) indexedDBRef = globalThis.indexedDB;
        if (urlApi === undefined) urlApi = globalThis.URL;
    } catch {
        indexedDBRef = null;
        urlApi = null;
    }
    const memory = new Map();
    const objectUrls = new Map();
    let database = null;
    let destroyed = false;
    const databasePromise = (async () => {
        if (!indexedDBRef?.open) return null;
        try {
            const request = indexedDBRef.open(DATABASE_NAME, 1);
            request.onupgradeneeded = () => {
                const nextDatabase = request.result;
                if (!nextDatabase.objectStoreNames.contains(STORE_NAME)) nextDatabase.createObjectStore(STORE_NAME);
            };
            database = await requestPromise(request);
            if (destroyed) {
                database.close?.();
                database = null;
            }
            return database;
        } catch {
            return null;
        }
    })();

    async function withStore(mode, operation) {
        const nextDatabase = await databasePromise;
        if (!nextDatabase || destroyed) throw new Error('Persistent photo storage unavailable');
        const transaction = nextDatabase.transaction(STORE_NAME, mode);
        const completion = new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
            transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
        });
        const request = requestPromise(operation(transaction.objectStore(STORE_NAME)));
        const [result] = await Promise.all([request, completion]);
        return result;
    }

    async function put(id, blob) {
        if (typeof id !== 'string' || !id || !(blob instanceof Blob)) return false;
        memory.set(id, blob);
        try {
            await withStore('readwrite', (store) => store.put(blob, id));
            return true;
        } catch {
            return false;
        }
    }

    async function get(id) {
        if (typeof id !== 'string' || !id) return null;
        try {
            const blob = await withStore('readonly', (store) => store.get(id));
            if (blob instanceof Blob) return blob;
        } catch { /* memory fallback */ }
        return memory.get(id) ?? null;
    }

    async function remove(id) {
        memory.delete(id);
        revokeObjectUrl(id);
        try {
            await withStore('readwrite', (store) => store.delete(id));
            return true;
        } catch {
            return false;
        }
    }

    async function getObjectUrl(id) {
        if (objectUrls.has(id)) return objectUrls.get(id);
        const blob = await get(id);
        if (!blob || !urlApi?.createObjectURL) return null;
        const objectUrl = urlApi.createObjectURL(blob);
        objectUrls.set(id, objectUrl);
        return objectUrl;
    }

    function revokeObjectUrl(id) {
        const objectUrl = objectUrls.get(id);
        if (!objectUrl) return false;
        urlApi?.revokeObjectURL?.(objectUrl);
        objectUrls.delete(id);
        return true;
    }

    function destroy() {
        destroyed = true;
        objectUrls.forEach((url) => urlApi?.revokeObjectURL?.(url));
        objectUrls.clear();
        database?.close?.();
        database = null;
        memory.clear();
    }

    return { put, get, delete: remove, getObjectUrl, revokeObjectUrl, destroy };
}
