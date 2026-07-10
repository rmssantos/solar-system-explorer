import { describe, expect, it, vi } from 'vitest';
import {
    parseHorizonsVector,
    parseNasaImageSearch,
    parseOmmElements
} from '../paper-preview/src/data/parsers.js';
import { createSpaceDataService } from '../paper-preview/src/data/spaceDataService.js';

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

describe('Scientific provider parsers', () => {
    it('normalizes a NASA Images search result with provenance', () => {
        const parsed = parseNasaImageSearch({
            collection: {
                items: [{
                    data: [{ nasa_id: 'PIA001', title: 'Earth', description: 'Blue planet', date_created: '2025-01-01T00:00:00Z', center: 'JSC' }],
                    links: [{ href: 'https://images-assets.nasa.gov/image/PIA001/PIA001~thumb.jpg', render: 'image' }]
                }]
            }
        });

        expect(parsed).toMatchObject({ nasaId: 'PIA001', title: 'Earth', center: 'JSC' });
        expect(parsed.imageUrl).toContain('images-assets.nasa.gov');
    });

    it('parses the first JPL Horizons CSV vector row', () => {
        const parsed = parseHorizonsVector({
            result: "header\n$$SOE\n2461234.500000000, A.D. 2026-Jul-11 00:00:00.0000, 1.100000E+08, -2.200000E+07, 3.300000E+06, 0, 0, 0,\n$$EOE\nfooter"
        });

        expect(parsed.positionKm).toEqual({ x: 110_000_000, y: -22_000_000, z: 3_300_000 });
        expect(parsed.distanceKm).toBeCloseTo(Math.hypot(110_000_000, -22_000_000, 3_300_000));
    });

    it('normalizes current OMM elements for orbital propagation', () => {
        const parsed = parseOmmElements([{
            OBJECT_NAME: 'ISS (ZARYA)', NORAD_CAT_ID: '25544', EPOCH: '2026-07-11T00:00:00.000Z',
            MEAN_MOTION: '15.5', ECCENTRICITY: '0.0006', INCLINATION: '51.64', RA_OF_ASC_NODE: '120.2',
            ARG_OF_PERICENTER: '80.1', MEAN_ANOMALY: '22.3', BSTAR: '0.0001'
        }]);

        expect(parsed).toMatchObject({ name: 'ISS (ZARYA)', catalogNumber: 25544, inclinationDeg: 51.64 });
        expect(parsed.meanMotion).toBe(15.5);
    });
});

describe('Cached scientific data service', () => {
    it('returns live NASA data then reuses fresh cache without another request', async () => {
        const storage = memoryStorage();
        const fetchFn = vi.fn(async () => jsonResponse({
            collection: { items: [{ data: [{ nasa_id: 'EARTH1', title: 'Earth', description: 'Home', date_created: '2025-01-01', center: 'JSC' }], links: [{ href: 'https://images-assets.nasa.gov/earth.jpg', render: 'image' }] }] }
        }));
        const service = createSpaceDataService({ fetchFn, storage, now: () => new Date('2026-07-11T12:00:00Z') });

        const live = await service.getNasaImage('earth', 'Earth from space', { imageUrl: '/learning/earth.jpg' });
        const cached = await service.getNasaImage('earth', 'Earth from space', { imageUrl: '/learning/earth.jpg' });

        expect(live.status).toBe('live');
        expect(cached.status).toBe('cached');
        expect(cached.data.nasaId).toBe('EARTH1');
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('uses stale cache when refresh fails and fallback when no cache exists', async () => {
        const storage = memoryStorage();
        const now = vi.fn(() => new Date('2026-07-11T12:00:00Z'));
        const successful = createSpaceDataService({
            fetchFn: async () => jsonResponse({ collection: { items: [{ data: [{ nasa_id: 'SAT1', title: 'Saturn' }], links: [{ href: 'https://images-assets.nasa.gov/saturn.jpg', render: 'image' }] }] } }),
            storage,
            now
        });
        await successful.getNasaImage('saturn', 'Saturn', { imageUrl: '/learning/saturn.jpg' });
        now.mockReturnValue(new Date('2026-08-11T12:00:00Z'));
        const offline = createSpaceDataService({ fetchFn: async () => { throw new Error('offline'); }, storage, now });

        const stale = await offline.getNasaImage('saturn', 'Saturn', { imageUrl: '/learning/saturn.jpg' });
        const fallback = await offline.getNasaImage('mars', 'Mars', { imageUrl: '/learning/mars.jpg' });

        expect(stale.status).toBe('cached');
        expect(stale.data.nasaId).toBe('SAT1');
        expect(fallback).toMatchObject({ status: 'fallback', data: { imageUrl: '/learning/mars.jpg' } });
    });

    it('caches an individual satellite OMM response for at least two hours', async () => {
        const storage = memoryStorage();
        const fetchFn = vi.fn(async () => jsonResponse([{
            OBJECT_NAME: 'HST', NORAD_CAT_ID: '20580', EPOCH: '2026-07-11T00:00:00Z',
            MEAN_MOTION: '15.1', ECCENTRICITY: '0.0003', INCLINATION: '28.47', RA_OF_ASC_NODE: '2',
            ARG_OF_PERICENTER: '3', MEAN_ANOMALY: '4', BSTAR: '0'
        }]));
        const service = createSpaceDataService({ fetchFn, storage, now: () => new Date('2026-07-11T01:00:00Z') });

        const live = await service.getSatelliteElements(20580, { name: 'Hubble fallback' });
        const cached = await service.getSatelliteElements(20580, { name: 'Hubble fallback' });

        expect(live.status).toBe('live');
        expect(cached.status).toBe('cached');
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });
});
