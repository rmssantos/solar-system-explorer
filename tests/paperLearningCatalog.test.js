import { describe, expect, it } from 'vitest';
import {
    PAPER_LEARNING_KEYS,
    createPaperLearningCatalog
} from '../paper-preview/src/learning/learningCatalog.js';

describe('Paper learning catalog', () => {
    it('adapts the Sun and eight planets from the original educational data', () => {
        const catalog = createPaperLearningCatalog('pt');

        expect(PAPER_LEARNING_KEYS).toEqual([
            'sun', 'mercury', 'venus', 'earth', 'mars',
            'jupiter', 'saturn', 'uranus', 'neptune'
        ]);
        expect(Object.keys(catalog)).toEqual(PAPER_LEARNING_KEYS);
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
});
