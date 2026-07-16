import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { createDeferredAnalytics } from '../paper-preview/src/analytics/siteAnalytics.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

function memoryStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key)
    };
}

describe('analytics blocker resilience', () => {
    it('keeps analytics as a safe no-op when its optional module is blocked', async () => {
        const loadAdapter = vi.fn(async () => {
            throw new TypeError('error loading dynamically imported module');
        });
        const analytics = createDeferredAnalytics({
            connectionString: 'InstrumentationKey=test',
            storage: memoryStorage(),
            loadAdapter
        });

        await expect(analytics.start()).resolves.toBe('pending');
        await expect(analytics.grant()).resolves.toBe('granted');
        expect(analytics.track('object_open', { objectKey: 'earth' })).toBe(false);
        expect(loadAdapter).toHaveBeenCalledOnce();
    });

    it('keeps optional telemetry modules out of the critical static import graph', () => {
        const siteAnalytics = read('../paper-preview/src/analytics/siteAnalytics.js');
        const game = read('../paper-preview/src/main.js');
        const gameUi = read('../paper-preview/src/ui.js');
        const library = read('../paper-preview/src/library.js');

        expect(siteAnalytics).not.toMatch(/^import .*applicationInsights/m);
        expect(siteAnalytics).toContain("import('./applicationInsights.js')");
        expect(`${game}\n${gameUi}\n${library}`).not.toContain('eventCatalog.js');
    });
});
