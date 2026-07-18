import { EXPEDITION_CHAPTERS, getExpeditionChapter } from './expeditionCatalog.js';
import { getExpeditionChapterStatus } from './expeditionState.js';

export function getNextExpeditionChapter(state, context = {}) {
    return EXPEDITION_CHAPTERS.find((chapter) => ['available', 'accepted'].includes(
        getExpeditionChapterStatus(state, chapter.id, context)
    )) ?? null;
}

export function isExpeditionDestinationNearby(chapterId, proximity = {}) {
    const destinationKey = getExpeditionChapter(chapterId)?.destinationKey;
    if (!destinationKey) return false;
    return proximity.objectKey === destinationKey || proximity.planetKey === destinationKey;
}
