import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { existsSync, statSync } from 'node:fs';
import {
    PLANET_STYLES,
    createSeededDirections
} from '../paper-preview/src/scene/planetStyle.js';
import { createLowPolyPlanet } from '../paper-preview/src/scene/createLowPolyPlanet.js';

describe('Low-poly paper planet style', () => {
    it('defines a restrained, recognizable style for every preview planet', () => {
        expect(Object.keys(PLANET_STYLES)).toEqual([
            'sun', 'mercury', 'venus', 'earth', 'mars',
            'jupiter', 'saturn', 'uranus', 'neptune'
        ]);

        for (const style of Object.values(PLANET_STYLES)) {
            expect(style.radius).toBeGreaterThan(0.6);
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

describe('Low-poly paper planet mesh', () => {
    it.each(['sun', 'earth', 'saturn'])('builds %s as a closed, outlined volume', (key) => {
        const planet = createLowPolyPlanet(key);
        const body = planet.getObjectByName(`${key}-body`);
        const rim = planet.getObjectByName(`${key}-paper-rim`);
        const outline = planet.getObjectByName(`${key}-outline`);
        const meshes = [];
        planet.traverse((object) => {
            if (object.isMesh) meshes.push(object);
        });

        expect(body.userData.closedVolume).toBe(true);
        expect(body.geometry.type).toBe('IcosahedronGeometry');
        expect(body.geometry.parameters.detail).toBe(PLANET_STYLES[key].geometryDetail);
        expect(rim.material.side).toBe(1);
        expect(outline.material.side).toBe(1);
        expect(outline.scale.x).toBeGreaterThan(rim.scale.x);
        expect(meshes.length).toBeLessThanOrEqual(32);
        expect(planet.children.some((child) => /meridian|latitude/.test(child.name))).toBe(false);
    });

    it('uses only silhouette-defining feature groups', () => {
        expect(createLowPolyPlanet('sun').getObjectByName('sun-corona')).toBeTruthy();
        expect(createLowPolyPlanet('earth').getObjectByName('earth-land-plates')).toBeTruthy();
        expect(createLowPolyPlanet('earth').getObjectByName('earth-clouds')).toBeTruthy();
        expect(createLowPolyPlanet('saturn').getObjectByName('saturn-rings')).toBeTruthy();
    });

    it('accepts an optional paper surface texture while preserving faceted lighting', () => {
        const texture = new THREE.Texture();
        const cloudTexture = new THREE.Texture();
        const earth = createLowPolyPlanet('earth', { surfaceTexture: texture, cloudTexture });
        const body = earth.getObjectByName('earth-body');
        expect(body.material.map).toBe(texture);
        expect(body.material.vertexColors).toBe(false);
        expect(body.material.flatShading).toBe(true);
        expect(earth.getObjectByName('earth-land-plates')).toBeTruthy();
        expect(earth.getObjectByName('earth-clouds').children[0].material.map).toBe(cloudTexture);
    });

    it('does not stack raised crater buttons over a textured planetary surface', () => {
        const texturedMars = createLowPolyPlanet('mars', { surfaceTexture: new THREE.Texture() });
        const fallbackMars = createLowPolyPlanet('mars');
        expect(texturedMars.getObjectByName('mars-craters')).toBeFalsy();
        expect(fallbackMars.getObjectByName('mars-craters')).toBeTruthy();
    });

    it('ships a distinct optimized paper texture for every primary world', () => {
        for (const key of Object.keys(PLANET_STYLES)) {
            const asset = new URL(`../paper-preview/public/art/textures/paper-${key}-surface.webp`, import.meta.url);
            expect(existsSync(asset), key).toBe(true);
            expect(statSync(asset).size, key).toBeGreaterThan(50_000);
            expect(statSync(asset).size, key).toBeLessThan(180_000);
        }
    });
});
