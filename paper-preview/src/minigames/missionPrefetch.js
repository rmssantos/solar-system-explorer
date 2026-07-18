import { MISSION_ADAPTER_LOADERS } from './missionAdapterLoaders.js';

function defaultIdle(task) {
    return globalThis.setTimeout(task, 0);
}

function defaultCancel(handle) {
    globalThis.clearTimeout(handle);
}

function defaultConnection() {
    return /** @type {any} */ (globalThis.navigator)?.connection;
}

export function createMissionPrefetch({
    loaders = MISSION_ADAPTER_LOADERS,
    loadRuntime = () => import('phaser'),
    connection = defaultConnection(),
    requestIdleCallback = globalThis.requestIdleCallback?.bind(globalThis) ?? defaultIdle,
    cancelIdleCallback = globalThis.cancelIdleCallback?.bind(globalThis) ?? defaultCancel
} = {}) {
    const queued = new Set();
    const warmed = new Set();
    const handles = new Map();
    let destroyed = false;

    function prefetch(gameplay) {
        if (destroyed || connection?.saveData || typeof loaders[gameplay] !== 'function') return false;
        if (queued.has(gameplay) || warmed.has(gameplay)) return true;
        queued.add(gameplay);
        const handle = requestIdleCallback(async () => {
            handles.delete(gameplay);
            if (destroyed) return;
            try {
                await Promise.all([loaders[gameplay](), loadRuntime()]);
                warmed.add(gameplay);
            } catch {
                // The regular mission loading surface remains the retry path.
            } finally {
                queued.delete(gameplay);
            }
        }, { timeout: 1_800 });
        handles.set(gameplay, handle);
        return true;
    }

    function getState() {
        return Object.freeze({
            saveData: Boolean(connection?.saveData),
            queued: Object.freeze([...queued]),
            warmed: Object.freeze([...warmed])
        });
    }

    function destroy() {
        destroyed = true;
        for (const handle of handles.values()) cancelIdleCallback(handle);
        handles.clear();
        queued.clear();
    }

    return Object.freeze({ prefetch, getState, destroy });
}
