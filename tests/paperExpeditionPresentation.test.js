import { describe, expect, it } from 'vitest';
import { createExpeditionJourney } from '../paper-preview/src/expedition/expeditionJourney.js';
import { presentExpeditionBoard } from '../paper-preview/src/expedition/expeditionPresentation.js';

const openingContext = {
    discoveredKeys: ['moon'],
    completedContractIds: ['iss-delivery']
};

describe('Signal of the Moons presentation', () => {
    it('turns the chapter graph into one clear child-friendly route', () => {
        const board = presentExpeditionBoard({}, {
            context: openingContext,
            language: 'pt'
        });

        expect(board.title).toBe('O Sinal das Luas');
        expect(board.progressLabel).toBe('0 de 4 pistas encontradas');
        expect(board.lumiMessage).toMatch(/sinal|Lua/i);
        expect(board.chapters).toHaveLength(5);
        expect(board.chapters[0]).toMatchObject({
            id: 'moon-seismology',
            status: 'available',
            action: 'accept',
            actionLabel: 'Aceitar investigação',
            stepNumber: 1
        });
        expect(board.chapters[1]).toMatchObject({ status: 'locked', disabled: true });
        expect(board.chapters[4]).toMatchObject({ kind: 'finale', stepNumber: 5 });
    });

    it('gives an accepted nearby chapter a direct mission action', () => {
        const board = presentExpeditionBoard({ acceptedChapterIds: ['moon-seismology'] }, {
            context: openingContext,
            proximity: { objectKey: 'moon' },
            journey: createExpeditionJourney(),
            language: 'pt'
        });

        expect(board.chapters[0]).toMatchObject({
            status: 'accepted',
            action: 'start',
            actionLabel: 'Investigar a Lua',
            disabled: false
        });
        expect(board.lumiMessage).toMatch(/Lua|prontos/i);
    });

    it('localizes actions and progress in English', () => {
        const board = presentExpeditionBoard({ acceptedChapterIds: ['moon-seismology'] }, {
            context: openingContext,
            journey: createExpeditionJourney({
                activeChapterId: 'moon-seismology',
                targetKey: 'moon',
                phase: 'travelling'
            }),
            language: 'en'
        });

        expect(board.title).toBe('The Signal of the Moons');
        expect(board.progressLabel).toBe('0 of 4 clues found');
        expect(board.chapters[0].actionLabel).toBe('Travelling to the Moon…');
    });

    it('opens the final comparison only after all four clues are complete', () => {
        const completedChapterIds = [
            'moon-seismology', 'europa-radar', 'enceladus-plume', 'titan-dragonfly'
        ];
        const board = presentExpeditionBoard({
            acceptedChapterIds: completedChapterIds,
            completedChapterIds,
            evidenceIds: [
                'moon-seismic-evidence', 'europa-ocean-evidence',
                'enceladus-plume-evidence', 'titan-chemistry-evidence'
            ]
        }, { context: openingContext, language: 'pt' });

        expect(board.evidenceCount).toBe(4);
        expect(board.chapters[4]).toMatchObject({
            status: 'available', action: 'finale', actionLabel: 'Montar o mapa final'
        });
        expect(board.lumiMessage).toMatch(/quatro|mapa/i);
    });
});
