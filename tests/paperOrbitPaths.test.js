import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createOrbitPathSamples } from '../paper-preview/src/scene/createOrbitPaths.js';
import { PRIMARY_WORLDS } from '../paper-preview/src/world/worldCatalog.js';
import { FLIGHT_BOUNDS } from '../paper-preview/src/flightSimulation.js';

describe('heliocentric orbit paths', () => {
    it('creates one closed solar orbit for every planet', () => {
        const paths = createOrbitPathSamples(PRIMARY_WORLDS, 72);
        expect(Object.keys(paths)).toEqual([
            'mercury', 'venus', 'earth', 'mars',
            'jupiter', 'saturn', 'uranus', 'neptune'
        ]);
        for (const points of Object.values(paths)) {
            expect(points).toHaveLength(73);
            expect(points[0]).toEqual(points.at(-1));
        }
    });

    it('wraps every independent path around the Sun instead of connecting planets', () => {
        const paths = createOrbitPathSamples(PRIMARY_WORLDS, 96);
        for (const points of Object.values(paths)) {
            expect(Math.min(...points.map((point) => point.x))).toBeLessThan(0);
            expect(Math.max(...points.map((point) => point.x))).toBeGreaterThan(0);
            expect(Math.min(...points.map((point) => point.z))).toBeLessThan(0);
            expect(Math.max(...points.map((point) => point.z))).toBeGreaterThan(0);
        }
    });

    it('removes the old stitched route from the rendered scene', () => {
        const source = readFileSync(new URL('../paper-preview/src/scene/createPaperScene.js', import.meta.url), 'utf8');
        expect(source).not.toContain('createStitchedRoute');
        expect(source).not.toContain('CatmullRomCurve3');
    });

    it('keeps every full orbit reachable inside symmetric flight bounds', () => {
        const points = Object.values(createOrbitPathSamples(PRIMARY_WORLDS, 96)).flat();
        expect(Math.min(...points.map((point) => point.x))).toBeGreaterThan(FLIGHT_BOUNDS.minX);
        expect(Math.max(...points.map((point) => point.x))).toBeLessThan(FLIGHT_BOUNDS.maxX);
        expect(Math.min(...points.map((point) => point.z))).toBeGreaterThan(FLIGHT_BOUNDS.minZ);
        expect(Math.max(...points.map((point) => point.z))).toBeLessThan(FLIGHT_BOUNDS.maxZ);
    });
});
