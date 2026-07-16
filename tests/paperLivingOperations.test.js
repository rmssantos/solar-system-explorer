import { describe, expect, it, vi } from 'vitest';

import {
    parseDonkiSolarFlares,
    parseNeoFeed
} from '../paper-preview/src/data/parsers.js';
import { createSpaceDataService } from '../paper-preview/src/data/spaceDataService.js';
import {
    createLivingOperations,
    getLocalizedOperation
} from '../paper-preview/src/agency/operationDirector.js';

function memoryStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value)
    };
}

function jsonResponse(payload, ok = true) {
    return { ok, status: ok ? 200 : 500, json: async () => payload };
}

describe('living Solar System payloads', () => {
    it('normalizes public DONKI flare data without preserving free text', () => {
        const events = parseDonkiSolarFlares([{
            flrID: '2026-07-16T10:00:00-FLR-001',
            beginTime: '2026-07-16T10:00Z',
            peakTime: '2026-07-16T10:14Z',
            endTime: '2026-07-16T10:35Z',
            classType: 'M2.4', sourceLocation: 'N12W33', note: 'untrusted long note'
        }]);

        expect(events).toEqual([{
            id: '2026-07-16T10:00:00-FLR-001',
            beginTime: '2026-07-16T10:00Z',
            peakTime: '2026-07-16T10:14Z',
            endTime: '2026-07-16T10:35Z',
            classType: 'M2.4',
            sourceLocation: 'N12W33'
        }]);
        expect(events[0]).not.toHaveProperty('note');
    });

    it('selects and sorts the closest NASA NeoWs approaches', () => {
        const objects = parseNeoFeed({ near_earth_objects: {
            '2026-07-17': [{
                id: '2', name: '(2026 BB)', is_potentially_hazardous_asteroid: true,
                estimated_diameter: { meters: { estimated_diameter_min: 12, estimated_diameter_max: 24 } },
                close_approach_data: [{ close_approach_date: '2026-07-17', relative_velocity: { kilometers_per_second: '8.5' }, miss_distance: { kilometers: '900000' } }]
            }],
            '2026-07-16': [{
                id: '1', name: '(2026 AA)', is_potentially_hazardous_asteroid: false,
                estimated_diameter: { meters: { estimated_diameter_min: 4, estimated_diameter_max: 8 } },
                close_approach_data: [{ close_approach_date: '2026-07-16', relative_velocity: { kilometers_per_second: '11.2' }, miss_distance: { kilometers: '450000' } }]
            }]
        }});

        expect(objects.map((item) => item.id)).toEqual(['1', '2']);
        expect(objects[0]).toMatchObject({ approachDate: '2026-07-16', speedKps: 11.2, missDistanceKm: 450000, diameterMeters: 6, hazardous: false });
    });
});

describe('living scientific data service', () => {
    it('loads DONKI and NeoWs through the existing cache and provenance contract', async () => {
        const fetchFn = vi.fn(async (url) => String(url).includes('/DONKI/FLR')
            ? jsonResponse([{ flrID: 'FLR1', beginTime: '2026-07-16T10:00Z', peakTime: '2026-07-16T10:10Z', classType: 'C4.0', sourceLocation: 'S10E20' }])
            : jsonResponse({ near_earth_objects: { '2026-07-16': [{
                id: 'NEO1', name: '(NEO 1)', is_potentially_hazardous_asteroid: false,
                estimated_diameter: { meters: { estimated_diameter_min: 10, estimated_diameter_max: 20 } },
                close_approach_data: [{ close_approach_date: '2026-07-16', relative_velocity: { kilometers_per_second: '5' }, miss_distance: { kilometers: '800000' } }]
            }] } }));
        const service = createSpaceDataService({ fetchFn, storage: memoryStorage(), now: () => new Date('2026-07-16T12:00:00Z') });

        const solar = await service.getSpaceWeather('2026-07-09', '2026-07-16', []);
        const neo = await service.getNearEarthObjects('2026-07-16', '2026-07-23', []);

        expect(solar).toMatchObject({ status: 'live', source: { name: 'NASA DONKI' } });
        expect(solar.data[0].classType).toBe('C4.0');
        expect(neo).toMatchObject({ status: 'live', source: { name: 'NASA/JPL NeoWs' } });
        expect(neo.data[0].id).toBe('NEO1');
        expect(fetchFn.mock.calls.map(([url]) => String(url))).toEqual(expect.arrayContaining([
            expect.stringContaining('/DONKI/FLR'),
            expect.stringContaining('/neo/rest/v1/feed')
        ]));
    });

    it('returns complete provided fallbacks when both live requests fail', async () => {
        const service = createSpaceDataService({ fetchFn: async () => { throw new Error('offline'); }, storage: memoryStorage() });
        const solarFallback = [{ id: 'quiet', classType: 'A0.0' }];
        const neoFallback = [{ id: 'paper-neo', missDistanceKm: 1_000_000 }];

        await expect(service.getSpaceWeather('2026-07-09', '2026-07-16', solarFallback)).resolves.toMatchObject({ status: 'fallback', data: solarFallback });
        await expect(service.getNearEarthObjects('2026-07-16', '2026-07-23', neoFallback)).resolves.toMatchObject({ status: 'fallback', data: neoFallback });
    });
});

describe('daily operation director', () => {
    const inputs = {
        date: '2026-07-16',
        solar: { status: 'live', source: { name: 'NASA DONKI', url: 'https://ccmc.gsfc.nasa.gov/' }, data: [{ id: 'FLR1', classType: 'M2.4', peakTime: '2026-07-16T10:14Z', sourceLocation: 'N12W33' }] },
        neo: { status: 'cached', source: { name: 'NASA/JPL NeoWs', url: 'https://cneos.jpl.nasa.gov/' }, data: [{ id: 'NEO1', name: '(2026 AA)', approachDate: '2026-07-17', missDistanceKm: 450000, speedKps: 11.2, diameterMeters: 6, hazardous: false }] },
        planet: { status: 'fallback', source: { name: 'NASA/JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' }, data: { distanceKm: 225_000_000 } }
    };

    it('creates three stable, distinct and launchable daily operations', () => {
        const first = createLivingOperations(inputs);
        const second = createLivingOperations(inputs);

        expect(first).toEqual(second);
        expect(first).toHaveLength(3);
        expect(first.map((item) => item.kind)).toEqual(['solar-weather', 'near-earth-object', 'planetary-map']);
        expect(new Set(first.map((item) => item.id)).size).toBe(3);
        expect(first[0]).toMatchObject({ targetKey: 'sun', recommendedInstrumentId: 'magnetometer', source: { status: 'live' }, facts: { flareClass: 'M2.4' } });
        expect(first[1]).toMatchObject({ targetKey: 'earth', recommendedInstrumentId: 'camera', source: { status: 'cached' } });
        expect(first[2]).toMatchObject({ targetKey: 'mars', recommendedInstrumentId: 'radio', source: { status: 'fallback' } });
    });

    it('provides purposeful Portuguese and English copy for dynamic operations', () => {
        const operation = createLivingOperations(inputs)[0];
        expect(getLocalizedOperation(operation, 'pt')).toMatchObject({ title: 'Vigília solar M2.4', action: 'Preparar sonda' });
        expect(getLocalizedOperation(operation, 'en')).toMatchObject({ title: 'M2.4 solar watch', action: 'Prepare probe' });
    });

    it('still creates all operation families from empty or unavailable feeds', () => {
        const operations = createLivingOperations({ date: '2026-07-16' });
        expect(operations).toHaveLength(3);
        expect(operations.every((item) => item.source.status === 'fallback')).toBe(true);
        expect(operations.every((item) => Object.keys(item.facts).length > 0)).toBe(true);
    });
});
