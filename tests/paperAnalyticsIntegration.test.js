import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('../paper-preview/src/landing.js');
const library = read('../paper-preview/src/library.js');
const game = read('../paper-preview/src/main.js');
const shared = read('../paper-preview/src/analytics/siteAnalytics.js');

describe('semantic product analytics integration', () => {
    it('tracks safe internal navigation centrally without pointer coordinates', () => {
        expect(shared).toContain("track('navigation_click'");
        expect(shared).not.toMatch(/client[XY]|offset[XY]|screen[XY]/);
    });

    it('reports only coarse client error categories without exception content', () => {
        expect(shared).toContain("track('error_event'");
        const errorCall = shared.match(/analytics\.track\('error_event',[\s\S]{0,180}?\);/)?.[0] ?? '';
        expect(errorCall).not.toMatch(/message|reason|stack|filename|url/i);
    });

    it('tracks library intent without sending the search text', () => {
        expect(library).toContain("siteAnalytics.track('library_search'");
        expect(library).toContain("siteAnalytics.track('library_filter'");
        expect(library).toContain("siteAnalytics.track('object_open'");
        expect(library).toContain("siteAnalytics.track('quiz_result'");
        const analyticsCalls = library.match(/siteAnalytics\.track\([\s\S]{0,240}?\);/g)?.join('\n') ?? '';
        expect(analyticsCalls).not.toContain('elements.search.value');
        expect(analyticsCalls).not.toMatch(/query\s*:/);
    });

    it('tracks game learning, missions and autopilot state transitions', () => {
        expect(game).toContain("siteAnalytics.track('object_open'");
        expect(game).toContain("siteAnalytics.track('quiz_result'");
        expect(game).toContain("siteAnalytics.track('mission_event'");
        expect(game.match(/siteAnalytics\.track\('autopilot_event'/g)).toHaveLength(3);
        expect(game).not.toMatch(/siteAnalytics\.track\([\s\S]{0,160}?(position|velocity|coordinates)\s*:/);
    });

    it('tracks language changes on every surface', () => {
        expect(landing).toContain("siteAnalytics.track('language_change'");
        expect(library).toContain("siteAnalytics.track('language_change'");
        expect(game).toContain("siteAnalytics.track('language_change'");
    });
});
