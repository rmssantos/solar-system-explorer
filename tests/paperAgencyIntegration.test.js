import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');

describe('space agency application integration', () => {
    it('hydrates the three scientific providers and creates daily operations', () => {
        expect(main).toContain("import { createAgencyUi } from './agency/agencyUi.js'");
        expect(main).toContain("import { createLivingOperations } from './agency/operationDirector.js'");
        expect(main).toContain('spaceData.getSpaceWeather');
        expect(main).toContain('spaceData.getNearEarthObjects');
        expect(main).toContain("spaceData.getPlanetVector('mars'");
        expect(main).toContain('createLivingOperations');
    });

    it('restores, reconciles and persists probes and reports across sessions', () => {
        expect(main).toContain('createAgencyState({');
        expect(main).toContain('agencyActiveMissions: savedProgress.agencyActiveMissions');
        expect(main).toContain('agencyReports: savedProgress.agencyReports');
        expect(main).toContain('reconcileAgencyState');
        expect(main).toContain('agencyActiveMissions: agencyState.activeMissions');
        expect(main).toContain('agencyReports: agencyState.reports');
    });

    it('wires launch, collection, XP and broad privacy-safe analytics', () => {
        expect(main).toContain('launchAgencyMission');
        expect(main).toContain('collectAgencyReport');
        expect(main).toContain('collectedAgencyReportIds');
        expect(main).toContain("siteAnalytics.track('agency_event'");
        expect(main).not.toMatch(/agency_event[^\n]+startedAt/);
        expect(main).not.toMatch(/agency_event[^\n]+operationId/);
        const collectHandler = main.slice(
            main.indexOf('function collectAgencyOperationReport'),
            main.indexOf('function handleSurprise')
        );
        expect(collectHandler).toContain('syncUI(true)');
        const completeHandler = main.slice(
            main.indexOf('function completeAgencyScienceOperation'),
            main.indexOf('function collectAgencyOperationReport')
        );
        expect(completeHandler).toContain('return result.report');
    });

    it('exposes concise agency state to deterministic browser QA', () => {
        expect(main).toContain('agency: {');
        expect(main).toContain('activeMissions: agencyState.activeMissions');
        expect(main).toContain('reports: agencyState.reports');
        expect(main).toContain('launchAgencyOperation');
        expect(main).toContain('collectAgencyOperationReport');
    });

    it('refreshes countdowns in place without rebuilding interactive controls', () => {
        expect(main).toContain('if (agencyUiElapsed >= 1)');
        expect(main).toContain('agencyUi?.tick(nowMs)');
        expect(main).toContain('const agencyChanged =');
    });
});
