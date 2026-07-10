import { describe, expect, it } from 'vitest';
import {
    PLANET_STYLES,
    createSeededDirections
} from '../paper-preview/src/scene/planetStyle.js';

describe('Low-poly paper planet style', () => {
    it('defines a restrained, recognizable style for every preview planet', () => {
        expect(Object.keys(PLANET_STYLES)).toEqual(['sun', 'earth', 'saturn']);

        for (const style of Object.values(PLANET_STYLES)) {
            expect(style.radius).toBeGreaterThan(1);
            expect(style.geometryDetail).toBeGreaterThanOrEqual(1);
            expect(style.geometryDetail).toBeLessThanOrEqual(3);
            expect(style.surfaceColors.length).toBeGreaterThanOrEqual(2);
            expect(style.surfaceColors.length).toBeLessThanOrEqual(5);
            expect(style.surfaceColors.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
            expect(style.outlineScale).toBeGreaterThan(1);
            expect(style.outlineScale).toBeLessThanOrEqual(1.06);
            expect(style.paperRimScale).toBeGreaterThan(1);
            expect(style.paperRimScale).toBeLessThan(style.outlineScale);
        }
    });

    it('gives every planet a distinct silhouette feature', () => {
        expect(PLANET_STYLES.sun.features.corona.count).toBeGreaterThanOrEqual(10);
        expect(PLANET_STYLES.earth.features.landPlates.count).toBeGreaterThanOrEqual(6);
        expect(PLANET_STYLES.earth.features.clouds.count).toBeGreaterThanOrEqual(3);
        expect(PLANET_STYLES.saturn.features.rings.outerRadius)
            .toBeGreaterThan(PLANET_STYLES.saturn.features.rings.innerRadius);
    });

    it('places handcrafted details deterministically on a unit sphere', () => {
        const first = createSeededDirections(47, 12);
        const repeated = createSeededDirections(47, 12);
        const different = createSeededDirections(48, 12);

        expect(first).toEqual(repeated);
        expect(first).not.toEqual(different);
        expect(first).toHaveLength(12);
        for (const direction of first) {
            expect(Math.hypot(direction.x, direction.y, direction.z)).toBeCloseTo(1, 8);
            expect(Object.values(direction).every(Number.isFinite)).toBe(true);
        }
    });
});
