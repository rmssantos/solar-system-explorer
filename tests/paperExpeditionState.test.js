import { describe, expect, it } from 'vitest';
import {
    acceptExpeditionChapter,
    completeExpeditionChapter,
    createExpeditionState,
    getExpeditionChapterStatus
} from '../paper-preview/src/expedition/expeditionState.js';

const ENTRY_CONTEXT = Object.freeze({
    discoveredKeys: ['moon'],
    completedContractIds: ['iss-delivery']
});

describe('Signal of the Moons state', () => {
    it('sanitizes persisted state and ignores unknown identifiers', () => {
        const state = createExpeditionState({
            expeditionVersion: 99,
            acceptedExpeditionChapterIds: ['moon-seismology', 'moon-seismology', 'bad'],
            completedExpeditionChapterIds: ['europa-radar', 'bad'],
            expeditionEvidenceIds: ['europa-ocean-evidence', 'bad'],
            expeditionUpgradeIds: ['ice-radar', 'bad']
        });

        expect(state).toEqual({
            expeditionVersion: 1,
            acceptedChapterIds: ['moon-seismology'],
            completedChapterIds: ['europa-radar'],
            evidenceIds: ['europa-ocean-evidence'],
            upgradeIds: ['ice-radar']
        });
        expect(Object.isFrozen(state)).toBe(true);
    });

    it('unlocks the prologue only after Moon discovery and ISS delivery', () => {
        const state = createExpeditionState();
        expect(getExpeditionChapterStatus(state, 'moon-seismology', {})).toBe('locked');
        expect(getExpeditionChapterStatus(state, 'moon-seismology', {
            discoveredKeys: ['moon'], completedContractIds: []
        })).toBe('locked');
        expect(getExpeditionChapterStatus(state, 'moon-seismology', ENTRY_CONTEXT)).toBe('available');
    });

    it('accepts an available chapter and refuses a locked chapter', () => {
        const initial = createExpeditionState();
        expect(acceptExpeditionChapter(initial, 'europa-radar', ENTRY_CONTEXT)).toBe(initial);

        const accepted = acceptExpeditionChapter(initial, 'moon-seismology', ENTRY_CONTEXT);
        expect(accepted.acceptedChapterIds).toEqual(['moon-seismology']);
        expect(getExpeditionChapterStatus(accepted, 'moon-seismology', ENTRY_CONTEXT)).toBe('accepted');
    });

    it('completes an accepted chapter once and grants its evidence and upgrade', () => {
        const accepted = acceptExpeditionChapter(createExpeditionState(), 'moon-seismology', ENTRY_CONTEXT);
        const completed = completeExpeditionChapter(accepted, 'moon-seismology');

        expect(completed.completedChapterIds).toEqual(['moon-seismology']);
        expect(completed.evidenceIds).toEqual(['moon-seismic-evidence']);
        expect(completed.upgradeIds).toEqual(['paper-seismometer']);
        expect(completeExpeditionChapter(completed, 'moon-seismology')).toBe(completed);
    });

    it('unlocks chapters sequentially and the finale after four investigations', () => {
        const afterMoon = createExpeditionState({
            completedExpeditionChapterIds: ['moon-seismology']
        });
        const completed = createExpeditionState({
            completedExpeditionChapterIds: [
                'moon-seismology', 'europa-radar', 'enceladus-plume', 'titan-dragonfly'
            ]
        });
        expect(getExpeditionChapterStatus(afterMoon, 'europa-radar', ENTRY_CONTEXT)).toBe('available');
        expect(getExpeditionChapterStatus(completed, 'ocean-worlds-finale', ENTRY_CONTEXT)).toBe('available');
    });

    it('does not complete a chapter that was never accepted', () => {
        const state = createExpeditionState();
        expect(completeExpeditionChapter(state, 'moon-seismology')).toBe(state);
    });
});
