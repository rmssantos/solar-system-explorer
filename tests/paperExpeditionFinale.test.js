import { describe, expect, it } from 'vitest';
import { OCEAN_EVIDENCE } from '../paper-preview/src/expedition/evidenceCatalog.js';
import { createFinaleState, reviewFinaleEvidence, selectFinaleConclusion, submitFinaleConclusion } from '../paper-preview/src/expedition/finaleState.js';

describe('ocean-world evidence finale', () => {
    it('requires the child to inspect all four clues before concluding', () => {
        let state = createFinaleState(); state = selectFinaleConclusion(state, 'potential-not-proof');
        expect(submitFinaleConclusion(state)).toBe(state);
        OCEAN_EVIDENCE.forEach((item) => { state = reviewFinaleEvidence(state, item.id); });
        state = submitFinaleConclusion(state);
        expect(state).toMatchObject({ status: 'complete', feedback: 'correct', attempts: 1 });
    });
    it('gives corrective feedback with no lost evidence and supports retry', () => {
        let state = createFinaleState({ reviewedIds: OCEAN_EVIDENCE.map((item) => item.id) });
        state = selectFinaleConclusion(state, 'aliens-everywhere'); state = submitFinaleConclusion(state);
        expect(state.status).toBe('retry'); expect(state.reviewedIds).toHaveLength(4);
        state = selectFinaleConclusion(state, 'potential-not-proof'); state = submitFinaleConclusion(state);
        expect(state.status).toBe('complete'); expect(state.attempts).toBe(2);
    });
    it('sanitizes unknown ids and freezes restored state', () => {
        const state = createFinaleState({ reviewedIds: ['bad', 'moon-seismic-evidence'], selectedConclusionId: 'bad', attempts: -4 });
        expect(state.reviewedIds).toEqual(['moon-seismic-evidence']); expect(state.selectedConclusionId).toBeNull(); expect(Object.isFrozen(state)).toBe(true);
    });
});
