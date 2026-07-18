import { EXPEDITION_CHAPTERS, getExpeditionChapter } from './expeditionCatalog.js';

export const EXPEDITION_VERSION = 1;

const CHAPTER_IDS = new Set(EXPEDITION_CHAPTERS.map((chapter) => chapter.id));
const EVIDENCE_IDS = new Set(EXPEDITION_CHAPTERS.map((chapter) => chapter.evidenceId));
const UPGRADE_IDS = new Set(EXPEDITION_CHAPTERS.map((chapter) => chapter.upgradeId));

function knownUnique(values, known) {
    return [...new Set((Array.isArray(values) ? values : [])
        .filter((value) => typeof value === 'string' && known.has(value)))];
}

export function createExpeditionState(value = {}) {
    return Object.freeze({
        expeditionVersion: EXPEDITION_VERSION,
        acceptedChapterIds: Object.freeze(knownUnique(
            value.acceptedChapterIds ?? value.acceptedExpeditionChapterIds,
            CHAPTER_IDS
        )),
        completedChapterIds: Object.freeze(knownUnique(
            value.completedChapterIds ?? value.completedExpeditionChapterIds,
            CHAPTER_IDS
        )),
        evidenceIds: Object.freeze(knownUnique(
            value.evidenceIds ?? value.expeditionEvidenceIds,
            EVIDENCE_IDS
        )),
        upgradeIds: Object.freeze(knownUnique(
            value.upgradeIds ?? value.expeditionUpgradeIds,
            UPGRADE_IDS
        ))
    });
}

function prerequisitesMet(chapter, state, context) {
    const discoveries = new Set(context.discoveredKeys ?? []);
    const contracts = new Set(context.completedContractIds ?? []);
    const completed = new Set(state.completedChapterIds);
    return chapter.unlockDiscoveries.every((id) => discoveries.has(id))
        && chapter.unlockContracts.every((id) => contracts.has(id))
        && chapter.unlockChapters.every((id) => completed.has(id));
}

export function getExpeditionChapterStatus(state, chapterId, context = {}) {
    const base = createExpeditionState(state);
    const chapter = getExpeditionChapter(chapterId);
    if (!chapter) return 'locked';
    if (base.completedChapterIds.includes(chapterId)) return 'completed';
    if (base.acceptedChapterIds.includes(chapterId)) return 'accepted';
    return prerequisitesMet(chapter, base, context) ? 'available' : 'locked';
}

export function acceptExpeditionChapter(state, chapterId, context = {}) {
    const base = createExpeditionState(state);
    if (getExpeditionChapterStatus(base, chapterId, context) !== 'available') return state;
    return createExpeditionState({
        ...base,
        acceptedChapterIds: [...base.acceptedChapterIds, chapterId]
    });
}

export function completeExpeditionChapter(state, chapterId) {
    const base = createExpeditionState(state);
    const chapter = getExpeditionChapter(chapterId);
    if (!chapter || base.completedChapterIds.includes(chapterId)) return state;
    if (!base.acceptedChapterIds.includes(chapterId)) return state;
    return createExpeditionState({
        ...base,
        completedChapterIds: [...base.completedChapterIds, chapterId],
        evidenceIds: [...base.evidenceIds, chapter.evidenceId],
        upgradeIds: [...base.upgradeIds, chapter.upgradeId]
    });
}
