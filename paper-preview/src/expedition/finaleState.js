import { OCEAN_CONCLUSIONS, OCEAN_EVIDENCE } from './evidenceCatalog.js';

const evidenceIds = new Set(OCEAN_EVIDENCE.map((item) => item.id));
const conclusionIds = new Set(OCEAN_CONCLUSIONS.map((item) => item.id));
export function createFinaleState(value = {}) {
    const reviewedIds = [...new Set((Array.isArray(value.reviewedIds) ? value.reviewedIds : []).filter((id) => evidenceIds.has(id)))];
    const selectedConclusionId = conclusionIds.has(value.selectedConclusionId) ? value.selectedConclusionId : null;
    const status = value.status === 'complete' ? 'complete' : (value.status === 'retry' ? 'retry' : 'investigating');
    return Object.freeze({ reviewedIds: Object.freeze(reviewedIds), selectedConclusionId, status, attempts: Math.max(0, Math.round(Number.isFinite(value.attempts) ? value.attempts : 0)), feedback: typeof value.feedback === 'string' ? value.feedback : null });
}
export function reviewFinaleEvidence(state, evidenceId) { const base = createFinaleState(state); if (!evidenceIds.has(evidenceId) || base.reviewedIds.includes(evidenceId)) return state; return createFinaleState({ ...base, reviewedIds: [...base.reviewedIds, evidenceId] }); }
export function selectFinaleConclusion(state, conclusionId) { const base = createFinaleState(state); if (!conclusionIds.has(conclusionId) || base.status === 'complete') return state; return createFinaleState({ ...base, selectedConclusionId: conclusionId, status: 'investigating', feedback: null }); }
export function submitFinaleConclusion(state) { const base = createFinaleState(state); if (base.status === 'complete' || base.reviewedIds.length < OCEAN_EVIDENCE.length || !base.selectedConclusionId) return state; const correct = OCEAN_CONCLUSIONS.find((item) => item.id === base.selectedConclusionId)?.correct; return createFinaleState({ ...base, status: correct ? 'complete' : 'retry', attempts: base.attempts + 1, feedback: correct ? 'correct' : 'try-again' }); }
