import { describe, expect, it } from 'vitest';

import {
    INSTRUMENT_CATALOG,
    POWER_PROFILE_CATALOG,
    ROUTE_PROFILE_CATALOG
} from '../paper-preview/src/agency/agencyCatalog.js';
import {
    collectAgencyReport,
    completeAgencyMissionWithScience,
    createAgencyState,
    getAgencyCapacity,
    launchAgencyMission,
    reconcileAgencyState
} from '../paper-preview/src/agency/agencyState.js';

const operation = Object.freeze({
    id: 'solar-flare:2026-07-16',
    kind: 'solar-weather',
    targetKey: 'sun',
    durationMs: 120_000,
    recommendedInstrumentId: 'magnetometer',
    recommendedPowerProfileId: 'focused',
    source: Object.freeze({ status: 'live', name: 'NASA DONKI', url: 'https://api.nasa.gov/' }),
    facts: Object.freeze({ flareClass: 'M2.4' })
});

describe('paper agency catalog', () => {
    it('offers three scientific instruments and meaningful launch choices', () => {
        expect(INSTRUMENT_CATALOG.map((item) => item.id)).toEqual(['camera', 'magnetometer', 'radio']);
        expect(POWER_PROFILE_CATALOG.map((item) => item.id)).toEqual(['survey', 'balanced', 'focused']);
        expect(ROUTE_PROFILE_CATALOG.map((item) => item.id)).toEqual(['fast', 'stable']);
    });
});

describe('paper agency state', () => {
    it('normalizes missing and malformed legacy progress', () => {
        expect(createAgencyState({
            activeMissions: [{ id: 'partial-mission' }, null],
            reports: [{ id: 'partial-report' }, null]
        })).toEqual({
            activeMissions: [],
            reports: []
        });
        expect(createAgencyState({ activeMissions: 'bad', reports: null })).toEqual({ activeMissions: [], reports: [] });
    });

    it('launches a configured mission with timestamps that survive closing the site', () => {
        const result = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'magnetometer',
            powerProfileId: 'focused',
            routeProfileId: 'stable',
            nowMs: 1_000
        });

        expect(result.error).toBeNull();
        expect(result.mission).toMatchObject({
            id: 'solar-flare:2026-07-16:1000',
            operationId: operation.id,
            status: 'active',
            startedAt: 1_000,
            endsAt: 145_000,
            instrumentId: 'magnetometer',
            powerProfileId: 'focused',
            routeProfileId: 'stable'
        });
        expect(result.state.activeMissions).toHaveLength(1);
    });

    it('rejects incomplete or unknown configurations without changing state', () => {
        const state = createAgencyState();
        const result = launchAgencyMission(state, {
            operation,
            instrumentId: 'unknown',
            powerProfileId: 'focused',
            routeProfileId: 'stable',
            nowMs: 1_000
        });

        expect(result).toMatchObject({ state, mission: null, error: 'invalid-configuration' });
    });

    it('enforces a capacity of three simultaneous probes', () => {
        let state = createAgencyState();
        for (let index = 0; index < 3; index += 1) {
            state = launchAgencyMission(state, {
                operation: { ...operation, id: `${operation.id}:${index}` },
                instrumentId: 'camera',
                powerProfileId: 'balanced',
                routeProfileId: 'fast',
                nowMs: 1_000 + index
            }).state;
        }

        expect(getAgencyCapacity(state)).toEqual({ used: 3, total: 3, available: 0 });
        expect(launchAgencyMission(state, {
            operation: { ...operation, id: 'fourth' },
            instrumentId: 'radio', powerProfileId: 'survey', routeProfileId: 'fast', nowMs: 2_000
        }).error).toBe('capacity-full');
    });

    it('turns elapsed missions into deterministic reports when the player returns', () => {
        const launched = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'magnetometer',
            powerProfileId: 'focused',
            routeProfileId: 'stable',
            nowMs: 1_000
        }).state;

        const before = reconcileAgencyState(launched, 144_999);
        expect(before.activeMissions).toHaveLength(1);
        expect(before.reports).toHaveLength(0);

        const after = reconcileAgencyState(launched, 145_000);
        expect(after.activeMissions).toHaveLength(0);
        expect(after.reports).toHaveLength(1);
        expect(after.reports[0]).toMatchObject({
            id: 'report:solar-flare:2026-07-16:1000',
            operationId: operation.id,
            targetKey: 'sun',
            quality: 100,
            collected: false,
            completedAt: 145_000,
            sourceStatus: 'live'
        });
        expect(reconcileAgencyState(after, 999_999)).toEqual(after);
    });

    it('still produces a useful report from an imperfect configuration', () => {
        const launched = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'camera',
            powerProfileId: 'survey',
            routeProfileId: 'fast',
            nowMs: 0
        }).state;
        const report = reconcileAgencyState(launched, 84_000).reports[0];

        expect(report.quality).toBeGreaterThanOrEqual(50);
        expect(report.quality).toBeLessThan(100);
        expect(report.facts).toEqual({ flareClass: 'M2.4' });
    });

    it('completes a probe immediately after scientific play and grades the report with its score', () => {
        const launched = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'magnetometer',
            powerProfileId: 'focused',
            routeProfileId: 'stable',
            nowMs: 1_000
        }).state;

        const result = completeAgencyMissionWithScience(launched, launched.activeMissions[0].id, 72, 9_000);

        expect(result.error).toBeNull();
        expect(result.state.activeMissions).toHaveLength(0);
        expect(result.report).toMatchObject({
            completedAt: 9_000,
            scienceScore: 72,
            quality: 90,
            collected: false
        });
        expect(completeAgencyMissionWithScience(result.state, launched.activeMissions[0].id, 100, 10_000).error).toBe('not-found');
    });

    it('allows an immediate replay after completion and keeps both attempts', () => {
        const firstLaunch = launchAgencyMission(createAgencyState(), {
            operation, instrumentId: 'magnetometer', powerProfileId: 'focused', routeProfileId: 'stable', nowMs: 1_000
        }).state;
        const first = completeAgencyMissionWithScience(firstLaunch, firstLaunch.activeMissions[0].id, 62, 2_000);
        const secondLaunch = launchAgencyMission(first.state, {
            operation, instrumentId: 'magnetometer', powerProfileId: 'focused', routeProfileId: 'stable', nowMs: 3_000
        });
        const second = completeAgencyMissionWithScience(secondLaunch.state, secondLaunch.mission.id, 94, 4_000);

        expect(second.error).toBeNull();
        expect(second.state.reports).toHaveLength(2);
        expect(second.state.reports.map((report) => report.scienceScore)).toEqual([62, 94]);
    });

    it('rejects invalid scientific scores without removing the active probe', () => {
        const launched = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'camera', powerProfileId: 'survey', routeProfileId: 'fast', nowMs: 0
        }).state;

        const result = completeAgencyMissionWithScience(launched, launched.activeMissions[0].id, Number.NaN, 100);
        expect(result).toMatchObject({ state: launched, report: null, error: 'invalid-score' });
    });

    it('keeps every played report scientifically useful even after a weak attempt', () => {
        const launched = launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'camera', powerProfileId: 'survey', routeProfileId: 'fast', nowMs: 0
        }).state;

        const result = completeAgencyMissionWithScience(launched, launched.activeMissions[0].id, 0, 100);
        expect(result.report.quality).toBe(50);
    });

    it('collects a report once and leaves repeated collection idempotent', () => {
        const ready = reconcileAgencyState(launchAgencyMission(createAgencyState(), {
            operation,
            instrumentId: 'magnetometer', powerProfileId: 'focused', routeProfileId: 'stable', nowMs: 0
        }).state, 144_000);

        const first = collectAgencyReport(ready, ready.reports[0].id, 150_000);
        expect(first.error).toBeNull();
        expect(first.report).toMatchObject({ collected: true, collectedAt: 150_000 });
        const second = collectAgencyReport(first.state, ready.reports[0].id, 160_000);
        expect(second.error).toBe('already-collected');
        expect(second.state).toBe(first.state);
    });
});
