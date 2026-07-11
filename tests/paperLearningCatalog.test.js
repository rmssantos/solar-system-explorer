import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import {
    PAPER_LEARNING_KEYS,
    createPaperLearningCatalog
} from '../paper-preview/src/learning/learningCatalog.js';
import { WORLD_OBJECTS } from '../paper-preview/src/world/worldCatalog.js';

describe('Paper learning catalog', () => {
    it('adapts the Sun and eight planets from the original educational data', () => {
        const catalog = createPaperLearningCatalog('pt');

        expect(PAPER_LEARNING_KEYS).toEqual([
            'sun', 'mercury', 'venus', 'earth', 'mars',
            'jupiter', 'saturn', 'uranus', 'neptune'
        ]);
        expect(Object.keys(catalog)).toEqual(expect.arrayContaining(PAPER_LEARNING_KEYS));
        expect(Object.keys(catalog).length).toBeGreaterThan(PAPER_LEARNING_KEYS.length);
        for (const key of PAPER_LEARNING_KEYS) {
            const record = catalog[key];
            expect(record.localPhoto).toBe(`/learning/${key}.jpg`);
            expect(record.fact.length).toBeGreaterThan(20);
            expect(record.wowFacts.length).toBeGreaterThan(0);
            expect(record.measurements.radiusKm).toBeGreaterThan(1000);
            expect(record.measurements.dayLength).toBeTruthy();
            expect(record.quizzes.length).toBeGreaterThan(0);
            expect(record.quizzes[0].options).toHaveLength(4);
            expect(record.quizzes[0].correctIndex).toBeGreaterThanOrEqual(0);
            expect(record.quizzes[0].correctIndex).toBeLessThan(4);
        }
    });

    it('reuses the original Sun, Earth and Saturn quiz questions', () => {
        const catalog = createPaperLearningCatalog('pt');

        expect(catalog.sun.quizzes[0].question).toContain('massa do Sistema Solar');
        expect(catalog.earth.quizzes[0].question).toContain('água');
        expect(catalog.saturn.quizzes[0].question).toContain('anéis');
    });

    it('returns frozen records that cannot mutate the original catalog', () => {
        const catalog = createPaperLearningCatalog('pt');

        expect(Object.isFrozen(catalog)).toBe(true);
        expect(Object.isFrozen(catalog.earth)).toBe(true);
        expect(Object.isFrozen(catalog.earth.quizzes)).toBe(true);
    });

    it('gives every moon, human object and small body its own real image and attribution', () => {
        const catalog = createPaperLearningCatalog('pt');
        const secondary = WORLD_OBJECTS.filter((object) => !PAPER_LEARNING_KEYS.includes(object.key));
        const photos = secondary.map((object) => catalog[object.key].localPhoto);

        expect(new Set(photos).size).toBe(secondary.length);
        for (const object of secondary) {
            const record = catalog[object.key];
            const expected = `/learning/objects/${object.key}.jpg`;
            const asset = new URL(`../paper-preview/public${expected}`, import.meta.url);
            expect(record.localPhoto, object.key).toBe(expected);
            expect(record.photoSource.url, object.key).toMatch(/^https:\/\//);
            expect(record.photoSource.name, object.key).not.toMatch(/incluída|included/i);
            expect(existsSync(asset), object.key).toBe(true);
            expect(statSync(asset).size, object.key).toBeGreaterThan(4_000);
            expect(statSync(asset).size, object.key).toBeLessThan(220_000);
        }
    });

    it('links primary-world fallback photos to human-readable NASA Science pages', () => {
        const catalog = createPaperLearningCatalog('en');
        for (const key of PAPER_LEARNING_KEYS) {
            expect(catalog[key].photoSource.url, key).toBe(`https://science.nasa.gov/${key}/`);
            expect(catalog[key].photoSource.url, key).not.toContain('/learning/');
        }
    });

    it('keeps the curated object photo authoritative instead of replacing it with the first search result', () => {
        const ui = readFileSync(new URL('../paper-preview/src/ui.js', import.meta.url), 'utf8');
        expect(ui).toContain('const photoUrl = record.localPhoto');
        expect(ui).not.toContain('const dynamicPhoto');
    });
});
