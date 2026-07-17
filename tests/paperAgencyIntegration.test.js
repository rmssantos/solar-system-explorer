import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { presentAgencyState } from '../paper-preview/src/agency/agencyPresentation.js';
import {
    collectAgencyReport,
    createAgencyState,
    launchAgencyMission,
    reconcileAgencyState
} from '../paper-preview/src/agency/agencyState.js';
import { createLivingOperations } from '../paper-preview/src/agency/operationDirector.js';
import { EVENT_XP, reconcileExpeditionProgress } from '../paper-preview/src/progression/expeditionProgress.js';

const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');

describe('space agency application integration', () => {
    it('runs provider operations through restoration, launch, report collection and XP', () => {
        const operations = createLivingOperations({
            date: '2026-07-16',
            solar: { status: 'live', data: [{ id: 'flare', classType: 'M2', peakTime: '2026-07-16T12:00:00Z' }] },
            neo: { status: 'cached', data: [{ id: 'neo', name: 'Scout', approachDate: '2026-07-16', missDistanceKm: 800_000 }] },
            planet: { status: 'live', data: { distanceKm: 220_000_000 } }
        });
        expect(operations.map((operation) => operation.source.status)).toEqual(['live', 'cached', 'live']);

        const launched = launchAgencyMission(createAgencyState(), {
            operation: operations[0],
            instrumentId: 'magnetometer',
            powerProfileId: 'focused',
            routeProfileId: 'stable',
            nowMs: 1_000
        });
        const restored = createAgencyState({
            activeMissions: JSON.parse(JSON.stringify(launched.state.activeMissions)),
            reports: []
        });
        const completed = reconcileAgencyState(restored, launched.mission.endsAt);
        const collected = collectAgencyReport(completed, completed.reports[0].id, launched.mission.endsAt + 1);
        const progress = reconcileExpeditionProgress(undefined, {
            collectedAgencyReportIds: collected.state.reports.filter((report) => report.collected).map((report) => report.id)
        });

        expect(restored.activeMissions[0].id).toBe(launched.mission.id);
        expect(completed).toMatchObject({ activeMissions: [], reports: [{ collected: false }] });
        expect(collected.report.collected).toBe(true);
        expect(progress.xp).toBe(EVENT_XP.operation);
    });

    it('keeps application wiring, QA exposure and analytics payloads privacy-safe', () => {
        expect(main).toContain("import { createAgencyUi } from './agency/agencyUi.js'");
        expect(main).toContain('spaceData.getSpaceWeather');
        expect(main).toContain('spaceData.getNearEarthObjects');
        expect(main).toContain("spaceData.getPlanetVector('mars'");
        expect(main).toContain('agencyActiveMissions: agencyState.activeMissions');
        expect(main).toContain('agencyReports: agencyState.reports');
        expect(main).toContain('agency: {');
        expect(main).toContain('science: agencyUi?.getScienceState()');
        expect(main).toContain("siteAnalytics.track('agency_event'");
        expect(main).not.toMatch(/agency_event[^\n]+startedAt/);
        expect(main).not.toMatch(/agency_event[^\n]+operationId/);
    });

    it('refreshes countdown presentation from restored mission state', () => {
        const operation = createLivingOperations({ date: '2026-07-16' })[0];
        const launched = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'magnetometer',
            powerProfileId: 'focused',
            routeProfileId: 'stable',
            nowMs: 1_000
        });
        const early = presentAgencyState(launched.state, [operation], 'pt', 1_000);
        const later = presentAgencyState(launched.state, [operation], 'pt', 61_000);

        expect(early.activeMissions[0].progressPercent).toBe(0);
        expect(later.activeMissions[0].progressPercent).toBeGreaterThan(early.activeMissions[0].progressPercent);
        expect(later.activeMissions[0].remainingMs).toBeLessThan(early.activeMissions[0].remainingMs);
    });
});
