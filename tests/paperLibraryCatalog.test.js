import { describe, expect, it } from 'vitest';

let libraryCatalog = null;
try {
    libraryCatalog = await import('../paper-preview/src/library/libraryCatalog.js');
} catch {}

describe('paper expedition library catalog', () => {
    it('provides catalog, filtering and summary functions', () => {
        expect(libraryCatalog?.createLibraryCatalog).toBeTypeOf('function');
        expect(libraryCatalog?.filterLibraryCatalog).toBeTypeOf('function');
        expect(libraryCatalog?.summarizeLibrary).toBeTypeOf('function');
    });

    it('derives one bilingual library card per world object with discovery state', () => {
        const catalog = libraryCatalog.createLibraryCatalog({
            language: 'en',
            progress: { discoveredKeys: ['earth'], completedQuizIds: [] }
        });

        expect(catalog).toHaveLength(37);
        expect(catalog.find((card) => card.key === 'earth')).toMatchObject({
            name: 'Earth',
            category: 'worlds',
            discovered: true,
            quizCompleted: false
        });
        expect(catalog.find((card) => card.key === 'earth').type).toContain('Planet');
        expect(catalog.find((card) => card.key === 'europa').category).toBe('moons');
        expect(catalog.find((card) => card.key === 'hubble').category).toBe('human');
        expect(catalog.find((card) => card.key === 'bennu').category).toBe('small-bodies');
        expect(catalog.every((card) => card.fact && card.photo && card.source?.url && card.quizzes.length)).toBe(true);
    });

    it('searches without accents and combines category with discovery filters', () => {
        const catalog = libraryCatalog.createLibraryCatalog({
            progress: { discoveredKeys: ['venus', 'hubble'], completedQuizIds: ['venus-0'] }
        });

        expect(libraryCatalog.filterLibraryCatalog(catalog, { query: 'venus' }).map((card) => card.key)).toEqual(['venus']);
        expect(libraryCatalog.filterLibraryCatalog(catalog, { category: 'human', discovery: 'discovered' }).map((card) => card.key)).toEqual(['hubble']);
        expect(libraryCatalog.filterLibraryCatalog(catalog, { category: 'moons', discovery: 'undiscovered' })).toHaveLength(14);
        expect(libraryCatalog.summarizeLibrary(catalog)).toEqual({
            total: 37,
            discovered: 2,
            quizzesCompleted: 1,
            discoveryPercent: 5
        });
    });
});
