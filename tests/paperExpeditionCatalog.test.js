import { describe, expect, it } from 'vitest';
import {
    EXPEDITION_CHAPTERS,
    OCEAN_FINALE_ID,
    PLAYABLE_EXPEDITION_CHAPTERS,
    getExpeditionChapter
} from '../paper-preview/src/expedition/expeditionCatalog.js';

describe('Signal of the Moons catalog', () => {
    it('defines four investigations followed by one finale', () => {
        expect(EXPEDITION_CHAPTERS.map((chapter) => chapter.id)).toEqual([
            'moon-seismology',
            'europa-radar',
            'enceladus-plume',
            'titan-dragonfly',
            'ocean-worlds-finale'
        ]);
        expect(PLAYABLE_EXPEDITION_CHAPTERS).toHaveLength(4);
        expect(EXPEDITION_CHAPTERS.at(-1).id).toBe(OCEAN_FINALE_ID);
    });

    it('gives every investigation stable journey, evidence and upgrade data', () => {
        for (const chapter of PLAYABLE_EXPEDITION_CHAPTERS) {
            expect(chapter.destinationKey).toMatch(/^(moon|europa|enceladus|titan)$/);
            expect(chapter.activity).toMatch(/^(moon-seismology|europa-radar|enceladus-plume|titan-dragonfly)$/);
            expect(chapter.evidenceId).toMatch(/-evidence$/);
            expect(chapter.upgradeId).toMatch(/^(paper-seismometer|ice-radar|plume-collector|atmosphere-lab)$/);
            expect(chapter.art).toMatch(/^\/art\/expedition\/.+\.webp$/);
        }
    });

    it('ships complete Portuguese and English child-facing copy', () => {
        for (const chapter of EXPEDITION_CHAPTERS) {
            for (const language of ['pt', 'en']) {
                expect(chapter.copy[language]).toMatchObject({
                    title: expect.any(String),
                    summary: expect.any(String),
                    briefing: expect.any(String),
                    action: expect.any(String),
                    reward: expect.any(String)
                });
            }
        }
    });

    it('freezes nested catalog data and returns null for unknown chapters', () => {
        const chapter = getExpeditionChapter('europa-radar');
        expect(Object.isFrozen(chapter)).toBe(true);
        expect(Object.isFrozen(chapter.copy)).toBe(true);
        expect(Object.isFrozen(chapter.copy.pt)).toBe(true);
        expect(getExpeditionChapter('unknown')).toBeNull();
    });
});
