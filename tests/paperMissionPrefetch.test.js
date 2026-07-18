import { describe, expect, it, vi } from 'vitest';
import { createMissionPrefetch } from '../paper-preview/src/minigames/missionPrefetch.js';

describe('orbital mission idle prefetch', () => {
    it('warms only the selected adapter and Phaser during idle time', async () => {
        const idleTasks = [];
        const loaders = {
            docking: vi.fn(async () => 'dock'),
            signal: vi.fn(async () => 'signal'),
            slingshot: vi.fn(async () => 'slingshot')
        };
        const loadRuntime = vi.fn(async () => 'phaser');
        const prefetch = createMissionPrefetch({
            loaders,
            loadRuntime,
            connection: { saveData: false },
            requestIdleCallback: (task) => { idleTasks.push(task); return idleTasks.length; },
            cancelIdleCallback: vi.fn()
        });

        expect(prefetch.prefetch('slingshot')).toBe(true);
        expect(Object.values(loaders).every((loader) => loader.mock.calls.length === 0)).toBe(true);
        await idleTasks[0]();
        expect(loaders.slingshot).toHaveBeenCalledOnce();
        expect(loaders.docking).not.toHaveBeenCalled();
        expect(loaders.signal).not.toHaveBeenCalled();
        expect(loadRuntime).toHaveBeenCalledOnce();
        expect(prefetch.getState().warmed).toEqual(['slingshot']);
    });

    it('opts out on save-data and ignores unknown mechanics', () => {
        const requestIdleCallback = vi.fn();
        const prefetch = createMissionPrefetch({
            loaders: { docking: vi.fn() },
            connection: { saveData: true },
            requestIdleCallback
        });
        expect(prefetch.prefetch('docking')).toBe(false);
        expect(prefetch.prefetch('unknown')).toBe(false);
        expect(requestIdleCallback).not.toHaveBeenCalled();
    });

    it('deduplicates queued work and cancels it on teardown', () => {
        const cancelIdleCallback = vi.fn();
        const prefetch = createMissionPrefetch({
            loaders: { sweep: vi.fn() },
            connection: { saveData: false },
            requestIdleCallback: vi.fn(() => 42),
            cancelIdleCallback
        });
        expect(prefetch.prefetch('sweep')).toBe(true);
        expect(prefetch.prefetch('sweep')).toBe(true);
        expect(prefetch.getState().queued).toEqual(['sweep']);
        prefetch.destroy();
        expect(cancelIdleCallback).toHaveBeenCalledWith(42);
    });

    it('does not mark in-flight work as warmed after teardown', async () => {
        let finishLoad;
        const loading = new Promise((resolve) => { finishLoad = resolve; });
        let idleTask;
        const prefetch = createMissionPrefetch({
            loaders: { docking: () => loading },
            loadRuntime: async () => 'phaser',
            connection: { saveData: false },
            requestIdleCallback: (task) => { idleTask = task; return 1; }
        });
        prefetch.prefetch('docking');
        const inFlight = idleTask();
        prefetch.destroy();
        finishLoad('dock');
        await inFlight;
        expect(prefetch.getState().warmed).toEqual([]);
    });
});
