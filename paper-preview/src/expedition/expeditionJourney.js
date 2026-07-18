import { getExpeditionChapter } from './expeditionCatalog.js';

export function createExpeditionJourney(value = {}) {
    const activeChapterId = typeof value.activeChapterId === 'string' ? value.activeChapterId : null;
    const targetKey = typeof value.targetKey === 'string' ? value.targetKey : null;
    const phase = activeChapterId && targetKey && ['travelling', 'arrived'].includes(value.phase)
        ? value.phase
        : 'idle';
    return Object.freeze({
        activeChapterId: phase === 'idle' ? null : activeChapterId,
        targetKey: phase === 'idle' ? null : targetKey,
        phase
    });
}

export function startExpeditionTravel(state, chapterId) {
    const chapter = getExpeditionChapter(chapterId);
    if (!chapter?.destinationKey) return state;
    return createExpeditionJourney({
        activeChapterId: chapter.id,
        targetKey: chapter.destinationKey,
        phase: 'travelling'
    });
}

export function arriveExpeditionTravel(state, targetKey) {
    const base = createExpeditionJourney(state);
    if (base.phase !== 'travelling' || base.targetKey !== targetKey) return state;
    return createExpeditionJourney({ ...base, phase: 'arrived' });
}

export function cancelExpeditionTravel(state) {
    const base = createExpeditionJourney(state);
    return base.phase === 'idle' ? state : createExpeditionJourney();
}

export function getExpeditionJourneyAction({
    status = 'locked', destinationNearby = false, journey = createExpeditionJourney(),
    chapterId = null, finale = false
} = {}) {
    if (status === 'locked') return Object.freeze({ action: 'locked', disabled: true });
    if (status === 'completed') return Object.freeze({ action: 'complete', disabled: true });
    if (finale && status === 'available') return Object.freeze({ action: 'finale', disabled: false });
    if (status === 'available') return Object.freeze({ action: 'accept', disabled: false });
    if (status !== 'accepted') return Object.freeze({ action: 'locked', disabled: true });
    if (finale) return Object.freeze({ action: 'finale', disabled: false });
    if (destinationNearby) return Object.freeze({ action: 'start', disabled: false });
    if (journey.activeChapterId === chapterId && journey.phase === 'travelling') {
        return Object.freeze({ action: 'travelling', disabled: true });
    }
    return Object.freeze({ action: 'travel', disabled: false });
}
