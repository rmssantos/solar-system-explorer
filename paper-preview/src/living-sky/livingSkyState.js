import { OBSERVATION_FILTERS, getLivingSkyEvent } from './livingSkyCatalog.js';

const MAX_PHOTOS = 12;
const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const unique = (values = []) => [...new Set(values)];

function sanitizePhotoRecord(value) {
    if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !value.id) return null;
    if (typeof value.targetKey !== 'string' || !value.targetKey || !Number.isFinite(value.capturedAt)) return null;
    const eventId = getLivingSkyEvent(value.eventId)?.id ?? null;
    const orbitDate = typeof value.orbitDate === 'string' && Number.isFinite(Date.parse(value.orbitDate))
        ? new Date(value.orbitDate).toISOString()
        : new Date(value.capturedAt).toISOString();
    return Object.freeze({
        id: value.id,
        storageId: typeof value.storageId === 'string' && value.storageId ? value.storageId : null,
        eventId,
        targetKey: value.targetKey,
        filter: OBSERVATION_FILTERS.includes(value.filter) ? value.filter : 'visible',
        capturedAt: Math.max(0, value.capturedAt),
        orbitDate,
        score: Number(clamp(Number.isFinite(value.score) ? value.score : 0).toFixed(3)),
        qualified: Boolean(value.qualified && eventId)
    });
}

export function createLivingSkyState(value = {}) {
    const completedEventIds = unique((Array.isArray(value.completedEventIds) ? value.completedEventIds : [])
        .filter((id) => Boolean(getLivingSkyEvent(id))));
    const seenPhotoIds = new Set();
    const safeRecords = (Array.isArray(value.photoRecords) ? value.photoRecords : [])
        .map(sanitizePhotoRecord)
        .filter((record) => record && !seenPhotoIds.has(record.id) && seenPhotoIds.add(record.id));
    const bestByEvent = new Map();
    const freePhotos = [];
    for (const record of safeRecords) {
        if (!record.eventId) freePhotos.push(record);
        else if (!bestByEvent.has(record.eventId) || bestByEvent.get(record.eventId).score < record.score) {
            bestByEvent.set(record.eventId, record);
        }
    }
    const photoRecords = [...freePhotos, ...bestByEvent.values()]
        .sort((left, right) => left.capturedAt - right.capturedAt)
        .slice(-MAX_PHOTOS);
    return Object.freeze({
        version: 1,
        completedEventIds: Object.freeze(completedEventIds),
        photoRecords: Object.freeze(photoRecords),
        introSeen: Boolean(value.introSeen)
    });
}

export function recordLivingSkyPhoto(state, photo) {
    const base = createLivingSkyState(state);
    const record = sanitizePhotoRecord(photo);
    if (!record) return state;
    const existing = record.eventId
        ? base.photoRecords.find((candidate) => candidate.eventId === record.eventId)
        : null;
    if (existing && existing.score >= record.score) return state;
    const photoRecords = existing
        ? base.photoRecords.filter((candidate) => candidate.id !== existing.id)
        : [...base.photoRecords];
    photoRecords.push(record);
    return createLivingSkyState({
        ...base,
        completedEventIds: record.qualified
            ? [...base.completedEventIds, record.eventId]
            : base.completedEventIds,
        photoRecords
    });
}

export function deleteLivingSkyPhoto(state, photoId) {
    const base = createLivingSkyState(state);
    if (!base.photoRecords.some((record) => record.id === photoId)) return state;
    return createLivingSkyState({
        ...base,
        photoRecords: base.photoRecords.filter((record) => record.id !== photoId)
    });
}
