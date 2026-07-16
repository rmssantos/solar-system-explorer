import { describe, expect, it } from 'vitest';
import {
    HUBBLE_MAINTENANCE_CONTRACT_ID,
    ISS_DELIVERY_CONTRACT_ID,
    acceptContract,
    completeContract,
    createContractState,
    getContractStatus,
    isContractDestinationNearby
} from '../paper-preview/src/contracts/contractState.js';
import { CONTRACT_CATALOG } from '../paper-preview/src/contracts/contractCatalog.js';

describe('paper expedition contracts', () => {
    it('offers the ISS delivery only after Earth has been discovered', () => {
        const state = createContractState();

        expect(getContractStatus(state, ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: [] })).toBe('locked');
        expect(getContractStatus(state, ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: ['earth'] })).toBe('available');
    });

    it('accepts an available contract and refuses a locked one', () => {
        const state = createContractState();
        const locked = acceptContract(state, ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: [] });
        const accepted = acceptContract(state, ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: ['earth'] });

        expect(locked).toBe(state);
        expect(accepted.acceptedContractIds).toEqual([ISS_DELIVERY_CONTRACT_ID]);
        expect(getContractStatus(accepted, ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: ['earth'] })).toBe('accepted');
    });

    it('completes an accepted contract once and keeps the operation idempotent', () => {
        const accepted = acceptContract(createContractState(), ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: ['earth'] });
        const completed = completeContract(accepted, ISS_DELIVERY_CONTRACT_ID);
        const repeated = completeContract(completed, ISS_DELIVERY_CONTRACT_ID);

        expect(completed.completedContractIds).toEqual([ISS_DELIVERY_CONTRACT_ID]);
        expect(getContractStatus(completed, ISS_DELIVERY_CONTRACT_ID, { discoveredKeys: ['earth'] })).toBe('completed');
        expect(repeated).toBe(completed);
    });

    it('does not complete a contract that was never accepted', () => {
        const state = createContractState();
        expect(completeContract(state, ISS_DELIVERY_CONTRACT_ID)).toBe(state);
    });

    it('ships a bilingual ISS contract with a local-orbit destination', () => {
        const contract = CONTRACT_CATALOG.find((item) => item.id === ISS_DELIVERY_CONTRACT_ID);
        expect(contract).toMatchObject({
            destinationKey: 'earth',
            activity: 'iss-docking',
            unlockDiscoveries: ['earth']
        });
        expect(contract.copy.pt.title).toMatch(/ISS/);
        expect(contract.copy.en.title).toMatch(/ISS/);
    });

    it('unlocks Hubble maintenance only after the ISS delivery is complete', () => {
        const initial = createContractState();
        expect(getContractStatus(initial, HUBBLE_MAINTENANCE_CONTRACT_ID, {
            discoveredKeys: ['earth']
        })).toBe('locked');

        const afterIss = createContractState({ completedContractIds: [ISS_DELIVERY_CONTRACT_ID] });
        expect(getContractStatus(afterIss, HUBBLE_MAINTENANCE_CONTRACT_ID, {
            discoveredKeys: ['earth']
        })).toBe('available');

        const contract = CONTRACT_CATALOG.find((item) => item.id === HUBBLE_MAINTENANCE_CONTRACT_ID);
        expect(contract).toMatchObject({
            destinationKey: 'earth',
            activity: 'hubble-service',
            unlockContracts: [ISS_DELIVERY_CONTRACT_ID]
        });
        expect(contract.copy.pt.title).toMatch(/Hubble/);
        expect(contract.copy.en.title).toMatch(/Hubble/);
    });

    it('treats the Earth system as the contract destination even beside an orbiting satellite', () => {
        expect(isContractDestinationNearby(ISS_DELIVERY_CONTRACT_ID, {
            planetKey: 'earth', orbitingParentKey: 'earth'
        })).toBe(true);
        expect(isContractDestinationNearby(ISS_DELIVERY_CONTRACT_ID, {
            planetKey: null, orbitingParentKey: 'earth'
        })).toBe(true);
        expect(isContractDestinationNearby(ISS_DELIVERY_CONTRACT_ID, {
            planetKey: 'mars', orbitingParentKey: 'mars'
        })).toBe(false);
    });
});
