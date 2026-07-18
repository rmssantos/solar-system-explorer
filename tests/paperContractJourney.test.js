import { describe, expect, it } from 'vitest';
import {
    arriveContractTravel,
    cancelContractTravel,
    createContractJourney,
    getContractJourneyAction,
    startContractTravel
} from '../paper-preview/src/contracts/contractJourney.js';

describe('orbital contract journey', () => {
    it('starts travel using the destination declared by the contract', () => {
        const journey = startContractTravel(createContractJourney(), 'lunar-sweep');

        expect(journey).toEqual({
            activeContractId: 'lunar-sweep',
            targetKey: 'moon',
            phase: 'travelling'
        });
    });

    it('marks arrival only for the active destination and can be cancelled', () => {
        const travelling = startContractTravel(createContractJourney(), 'mars-relay');

        expect(arriveContractTravel(travelling, 'earth')).toBe(travelling);
        expect(arriveContractTravel(travelling, 'mars')).toEqual({
            activeContractId: 'mars-relay', targetKey: 'mars', phase: 'arrived'
        });
        expect(cancelContractTravel(travelling)).toEqual(createContractJourney());
    });

    it('derives enabled travel, travelling and start actions for an accepted contract', () => {
        expect(getContractJourneyAction({ status: 'accepted', destinationNearby: false }))
            .toEqual({ action: 'travel', disabled: false });
        expect(getContractJourneyAction({
            status: 'accepted', destinationNearby: false,
            journey: startContractTravel(createContractJourney(), 'iss-delivery'),
            contractId: 'iss-delivery'
        })).toEqual({ action: 'travelling', disabled: true });
        expect(getContractJourneyAction({ status: 'accepted', destinationNearby: true }))
            .toEqual({ action: 'start', disabled: false });
    });

    it('keeps locked and completed contracts inactive', () => {
        expect(getContractJourneyAction({ status: 'locked' })).toEqual({ action: 'locked', disabled: true });
        expect(getContractJourneyAction({ status: 'completed' })).toEqual({ action: 'complete', disabled: true });
    });
});
