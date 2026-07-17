function unique(values = []) {
    return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))];
}

export function createMissionTrainingState(value = {}) {
    return Object.freeze({
        seenMissionTrainingIds: Object.freeze(unique(value.seenMissionTrainingIds))
    });
}

export function needsMissionTraining(state, gameplay, { force = false } = {}) {
    if (force) return true;
    return !createMissionTrainingState(state).seenMissionTrainingIds.includes(gameplay);
}

export function completeMissionTraining(state, gameplay) {
    const base = createMissionTrainingState(state);
    if (typeof gameplay !== 'string' || base.seenMissionTrainingIds.includes(gameplay)) return state;
    return createMissionTrainingState({
        seenMissionTrainingIds: [...base.seenMissionTrainingIds, gameplay]
    });
}
