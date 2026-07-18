import { describe, expect, it } from 'vitest';
import {
    compressAu,
    createPrimarySnapshot,
    positionAtDate
} from '../paper-preview/src/world/orbitalSystem.js';
import { PRIMARY_WORLDS } from '../paper-preview/src/world/worldCatalog.js';

const byKey = (key) => PRIMARY_WORLDS.find((world) => world.key === key);

describe('heliocentric orbital system', () => {
    it('compresses real AU distances monotonically while keeping outer gaps legible', () => {
        const radii = [0.387, 0.723, 1, 1.524, 5.203, 9.537, 19.191, 30.07].map(compressAu);
        expect(radii).toEqual([...radii].sort((a, b) => a - b));
        expect(radii[2]).toBeGreaterThan(34);
        expect(radii[2]).toBeLessThan(45);
        expect(radii[7]).toBeGreaterThan(135);
        expect(radii[4] - radii[2]).toBeGreaterThan(radii[1] - radii[0]);
    });

    it('keeps the Sun at the origin and every planet on its own heliocentric orbit', () => {
        const snapshot = createPrimarySnapshot(new Date('2026-07-11T00:00:00Z'));
        expect(snapshot.sun.position).toEqual({ x: 0, y: 0, z: 0 });
        for (const world of PRIMARY_WORLDS.filter((entry) => entry.type === 'planet')) {
            const body = snapshot[world.key];
            const radius = Math.hypot(body.position.x, body.position.y, body.position.z);
            const compressedSemiMajor = compressAu(world.orbit.semiMajorAxisAu);
            const periapsis = compressedSemiMajor * (1 - world.orbit.eccentricity);
            const apoapsis = compressedSemiMajor * (1 + world.orbit.eccentricity);
            expect(radius).toBeGreaterThanOrEqual(periapsis - 0.001);
            expect(radius).toBeLessThanOrEqual(apoapsis + 0.001);
        }
    });

    it('is deterministic for a date and advances according to orbital period', () => {
        const earth = byKey('earth');
        const first = positionAtDate(earth.orbit, new Date('2026-01-01T00:00:00Z'));
        const repeated = positionAtDate(earth.orbit, new Date('2026-01-01T00:00:00Z'));
        const halfYear = positionAtDate(earth.orbit, new Date('2026-07-02T15:00:00Z'));
        expect(first).toEqual(repeated);
        const dot = first.x * halfYear.x + first.y * halfYear.y + first.z * halfYear.z;
        expect(dot).toBeLessThan(0);
    });

    it('represents orbital inclination instead of locking every planet to one plane', () => {
        const mercury = positionAtDate(byKey('mercury').orbit, new Date('2026-04-18T00:00:00Z'));
        const earth = positionAtDate(byKey('earth').orbit, new Date('2026-04-18T00:00:00Z'));
        expect(Math.abs(mercury.y)).toBeGreaterThan(0.05);
        expect(Math.abs(earth.y)).toBeLessThan(Math.abs(mercury.y));
    });

    it('keeps Mercury’s eccentric orbit smooth through perihelion', () => {
        const mercury = byKey('mercury');
        const epoch = Date.parse('2000-01-01T12:00:00Z');
        const radii = Array.from({ length: 360 }, (_, index) => {
            const date = new Date(epoch + (index / 360) * mercury.orbit.periodDays * 86_400_000);
            const position = positionAtDate(mercury.orbit, date);
            return Math.hypot(position.x, position.y, position.z);
        });
        const minimum = Math.min(...radii);
        const nearMinimumSamples = radii.filter((radius) => radius < minimum + 0.01);

        expect(minimum).toBeLessThan(10);
        expect(Math.max(...radii)).toBeGreaterThan(12.5);
        expect(nearMinimumSamples.length).toBeLessThan(10);
    });
});
