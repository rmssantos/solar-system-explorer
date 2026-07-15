import { getContract } from './contractCatalog.js';

export const ISS_DELIVERY_CONTRACT_ID = 'iss-delivery';

function unique(values = []) {
    return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))];
}

export function createContractState(value = {}) {
    return Object.freeze({
        acceptedContractIds: Object.freeze(unique(value.acceptedContractIds)),
        completedContractIds: Object.freeze(unique(value.completedContractIds))
    });
}

export function getContractStatus(state, contractId, snapshot = {}) {
    const contract = getContract(contractId);
    if (!contract) return 'locked';
    const base = createContractState(state);
    if (base.completedContractIds.includes(contractId)) return 'completed';
    if (base.acceptedContractIds.includes(contractId)) return 'accepted';
    const discoveries = new Set(snapshot.discoveredKeys ?? []);
    return contract.unlockDiscoveries.every((key) => discoveries.has(key)) ? 'available' : 'locked';
}

export function acceptContract(state, contractId, snapshot = {}) {
    if (getContractStatus(state, contractId, snapshot) !== 'available') return state;
    return createContractState({
        ...state,
        acceptedContractIds: [...(state.acceptedContractIds ?? []), contractId]
    });
}

export function completeContract(state, contractId) {
    const base = createContractState(state);
    if (base.completedContractIds.includes(contractId)) return state;
    if (!base.acceptedContractIds.includes(contractId)) return state;
    return createContractState({
        ...base,
        completedContractIds: [...base.completedContractIds, contractId]
    });
}

export function isContractDestinationNearby(contractId, { planetKey = null, orbitingParentKey = null } = {}) {
    const contract = getContract(contractId);
    if (!contract) return false;
    return planetKey === contract.destinationKey || orbitingParentKey === contract.destinationKey;
}
