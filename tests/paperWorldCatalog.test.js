import { describe, expect, it } from 'vitest';
import {
    PRIMARY_WORLDS,
    WORLD_OBJECTS,
    getWorldObject,
    listWorldObjects
} from '../paper-preview/src/world/worldCatalog.js';

describe('paper solar explorer world catalog', () => {
    it('contains the Sun and all eight planets in order', () => {
        expect(PRIMARY_WORLDS.map((world) => world.key)).toEqual([
            'sun', 'mercury', 'venus', 'earth', 'mars',
            'jupiter', 'saturn', 'uranus', 'neptune'
        ]);
    });

    it('includes a useful selection of natural satellites', () => {
        const moons = listWorldObjects('moon');
        expect(moons.length).toBeGreaterThanOrEqual(14);
        expect(moons.map((moon) => moon.key)).toEqual(expect.arrayContaining([
            'moon', 'phobos', 'deimos', 'io', 'europa', 'ganymede',
            'callisto', 'titan', 'enceladus', 'triton'
        ]));
        expect(Math.max(...moons.map((moon) => moon.orbitSpeed))).toBeLessThan(0.03);
    });

    it('keeps Mars moons visually separate from the planet silhouette', () => {
        expect(getWorldObject('phobos')).toMatchObject({ orbitRadius: 3.1, scale: 0.18 });
        expect(getWorldObject('deimos')).toMatchObject({ orbitRadius: 3.75, scale: 0.14 });
    });

    it('includes spacecraft, famous small bodies and the Roadster', () => {
        expect(getWorldObject('iss').source.command).toBe('25544');
        expect(getWorldObject('hubble').source.command).toBe('20580');
        expect(getWorldObject('tesla-roadster').source.command).toBe('-143205');
        expect(listWorldObjects('small-body').map((body) => body.key)).toEqual(
            expect.arrayContaining(['ceres', 'bennu', 'halley', 'apophis'])
        );
    });

    it('provides an educational record for every discoverable object', () => {
        for (const object of WORLD_OBJECTS.filter((entry) => entry.discoverable)) {
            expect(object.name).toBeTruthy();
            expect(object.fact.length).toBeGreaterThan(20);
            expect(object.source?.name).toBeTruthy();
        }
    });
});
