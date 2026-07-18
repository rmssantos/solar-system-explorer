import { getContract } from './contractCatalog.js';

export function createContractJourney(value = {}) {
    const activeContractId = typeof value.activeContractId === 'string' ? value.activeContractId : null;
    const targetKey = typeof value.targetKey === 'string' ? value.targetKey : null;
    const phase = activeContractId && targetKey && ['travelling', 'arrived'].includes(value.phase)
        ? value.phase
        : 'idle';
    return Object.freeze({
        activeContractId: phase === 'idle' ? null : activeContractId,
        targetKey: phase === 'idle' ? null : targetKey,
        phase
    });
}

export function startContractTravel(state, contractId) {
    const contract = getContract(contractId);
    if (!contract) return state;
    return createContractJourney({
        activeContractId: contract.id,
        targetKey: contract.destinationKey,
        phase: 'travelling'
    });
}

export function arriveContractTravel(state, targetKey) {
    const base = createContractJourney(state);
    if (base.phase !== 'travelling' || base.targetKey !== targetKey) return state;
    return createContractJourney({ ...base, phase: 'arrived' });
}

export function cancelContractTravel(state) {
    const base = createContractJourney(state);
    return base.phase === 'idle' ? state : createContractJourney();
}

export function getContractJourneyAction({
    status = 'locked',
    destinationNearby = false,
    journey = createContractJourney(),
    contractId = null
} = {}) {
    if (status === 'locked') return Object.freeze({ action: 'locked', disabled: true });
    if (status === 'completed') return Object.freeze({ action: 'complete', disabled: true });
    if (status === 'available') return Object.freeze({ action: 'accept', disabled: false });
    if (status !== 'accepted') return Object.freeze({ action: 'locked', disabled: true });
    if (destinationNearby) return Object.freeze({ action: 'start', disabled: false });
    if (journey.activeContractId === contractId && journey.phase === 'travelling') {
        return Object.freeze({ action: 'travelling', disabled: true });
    }
    return Object.freeze({ action: 'travel', disabled: false });
}
