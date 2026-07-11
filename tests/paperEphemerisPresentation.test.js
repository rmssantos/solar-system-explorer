import { describe, expect, it } from 'vitest';
import { createEphemerisPresentation } from '../paper-preview/src/learning/ephemerisPresentation.js';
import { createLearningState, setLearningDataEnvelope } from '../paper-preview/src/learning/learningState.js';

describe('scientific ephemeris presentation', () => {
    it('presents the Sun as the reference of the map instead of measuring it from itself', () => {
        const pt = createEphemerisPresentation({ key: 'sun', name: 'Sol', distanceKm: 0, language: 'pt' });
        const en = createEphemerisPresentation({ key: 'sun', name: 'Sun', distanceKm: 0, language: 'en' });

        expect(pt.kind).toBe('reference');
        expect(pt.summary).toContain('referência central');
        expect(pt.summary).not.toContain('0 milhões');
        expect(pt.summary).not.toContain('ao vivo');
        expect(en.summary).toContain('central reference');
    });

    it('retains a dated, honest ephemeris explanation for orbiting worlds', () => {
        const result = createEphemerisPresentation({ key: 'mars', name: 'Marte', distanceKm: 225_000_000, language: 'pt' });
        expect(result.kind).toBe('ephemeris');
        expect(result.summary).toContain('225');
        expect(result.summary).toContain('efeméride');
    });

    it('preserves the reference presentation marker in learning state', () => {
        const state = setLearningDataEnvelope(createLearningState(), 'sun', {
            status: 'live', presentationKind: 'reference',
            source: { name: 'NASA/JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' },
            updatedAt: '2026-07-11T22:00:00Z', data: { summary: 'reference' }
        });
        expect(state.dataByObject.sun.presentationKind).toBe('reference');
    });
});
