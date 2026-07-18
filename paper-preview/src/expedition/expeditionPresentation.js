import { EXPEDITION_CHAPTERS, PLAYABLE_EXPEDITION_CHAPTERS } from './expeditionCatalog.js';
import { getExpeditionChapterStatus } from './expeditionState.js';
import { createExpeditionJourney, getExpeditionJourneyAction } from './expeditionJourney.js';
import { isExpeditionDestinationNearby } from './expeditionDirector.js';

const BOARD_COPY = Object.freeze({
    pt: Object.freeze({
        title: 'O Sinal das Luas',
        progress: (count) => `${count} de 4 pistas encontradas`,
        intro: 'Capitão, encontrei um sinal estranho no arquivo da Lua. Vamos seguir as pistas juntos?',
        accepted: 'A investigação está pronta. Segue a rota até à Lua e eu levo os instrumentos.',
        ready: 'Chegámos à Lua. Quando estiveres pronto, vamos ouvir o que existe debaixo da poeira.',
        travelling: 'A caminho da Lua. Procura o marcador brilhante e deixa o piloto de papel trabalhar.',
        finale: 'Temos as quatro pistas! Junta-as no mapa e descobre o que estes mundos têm em comum.',
        ongoing: 'Uma pista de cada vez. A próxima experiência já está assinalada na nossa rota.',
        complete: 'Mapa concluído! Provámos que um mundo habitável ainda não é um mundo habitado.',
        actions: Object.freeze({
            locked: 'Descobre a pista anterior',
            accept: 'Aceitar investigação',
            travel: (destination) => `Viajar até ${destination}`,
            travelling: (destination) => `A viajar até ${destination}…`,
            complete: 'Pista guardada'
        })
    }),
    en: Object.freeze({
        title: 'The Signal of the Moons',
        progress: (count) => `${count} of 4 clues found`,
        intro: 'Captain, I found a strange signal in the Moon archive. Shall we follow the clues together?',
        accepted: 'The investigation is ready. Follow the route to the Moon and I will carry the instruments.',
        ready: 'We have reached the Moon. When you are ready, let’s listen beneath the dust.',
        travelling: 'Travelling to the Moon. Look for the glowing marker and let the paper pilot work.',
        finale: 'We have all four clues! Join them on the map and discover what these worlds share.',
        ongoing: 'One clue at a time. The next experiment is already marked on our route.',
        complete: 'Map complete! We proved that a habitable world is not necessarily inhabited.',
        actions: Object.freeze({
            locked: 'Discover the previous clue',
            accept: 'Accept investigation',
            travel: (destination) => `Travel to ${destination}`,
            travelling: (destination) => `Travelling to ${destination}…`,
            complete: 'Clue saved'
        })
    })
});

function lumiMessage(chapters, copy) {
    const finale = chapters.at(-1);
    if (finale.status === 'completed') return copy.complete;
    if (finale.status === 'available' || finale.status === 'accepted') return copy.finale;
    const first = chapters[0];
    if (first.status === 'available') return copy.intro;
    if (first.action === 'travelling') return copy.travelling;
    if (first.action === 'start') return copy.ready;
    if (first.status === 'accepted') return copy.accepted;
    return copy.ongoing;
}

export function presentExpeditionBoard(state = {}, {
    context = {}, proximity = {}, journey = createExpeditionJourney(), language = 'pt'
} = {}) {
    const locale = language === 'en' ? 'en' : 'pt';
    const boardCopy = BOARD_COPY[locale];
    const chapters = EXPEDITION_CHAPTERS.map((chapter, index) => {
        const status = getExpeditionChapterStatus(state, chapter.id, context);
        const journeyAction = getExpeditionJourneyAction({
            status,
            destinationNearby: isExpeditionDestinationNearby(chapter.id, proximity),
            journey,
            chapterId: chapter.id,
            finale: chapter.kind === 'finale'
        });
        const chapterCopy = chapter.copy[locale];
        const destinationNames = locale === 'en'
            ? { moon: 'the Moon', europa: 'Europa', enceladus: 'Enceladus', titan: 'Titan' }
            : { moon: 'à Lua', europa: 'Europa', enceladus: 'Encélado', titan: 'Titã' };
        const genericAction = boardCopy.actions[journeyAction.action];
        const actionLabel = ['start', 'finale'].includes(journeyAction.action)
            ? chapterCopy.action
            : (typeof genericAction === 'function'
                ? genericAction(destinationNames[chapter.destinationKey] ?? chapterCopy.title)
                : genericAction);
        return Object.freeze({
            ...chapter,
            ...chapterCopy,
            copy: chapterCopy,
            stepNumber: index + 1,
            status,
            action: journeyAction.action,
            actionLabel,
            disabled: journeyAction.disabled
        });
    });
    const playableEvidence = new Set(PLAYABLE_EXPEDITION_CHAPTERS.map((chapter) => chapter.evidenceId));
    const evidenceCount = (state.evidenceIds ?? state.expeditionEvidenceIds ?? [])
        .filter((id) => playableEvidence.has(id)).length;

    return Object.freeze({
        title: boardCopy.title,
        evidenceCount,
        evidenceTotal: PLAYABLE_EXPEDITION_CHAPTERS.length,
        progressLabel: boardCopy.progress(evidenceCount),
        lumiMessage: lumiMessage(chapters, boardCopy),
        chapters: Object.freeze(chapters)
    });
}
