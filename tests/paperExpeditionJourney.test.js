import { describe, expect, it } from 'vitest';
import {
    arriveExpeditionTravel,
    cancelExpeditionTravel,
    createExpeditionJourney,
    getExpeditionJourneyAction,
    startExpeditionTravel
} from '../paper-preview/src/expedition/expeditionJourney.js';

describe('Signal of the Moons journey', () => {
    it('starts travel using the destination declared by a chapter', () => {
        expect(startExpeditionTravel(createExpeditionJourney(), 'europa-radar')).toEqual({
            activeChapterId: 'europa-radar', targetKey: 'europa', phase: 'travelling'
        });
    });

    it('does not start travel for the finale without a physical destination', () => {
        const state = createExpeditionJourney();
        expect(startExpeditionTravel(state, 'ocean-worlds-finale')).toBe(state);
    });

    it('arrives only beside the active target and can be cancelled', () => {
        const travelling = startExpeditionTravel(createExpeditionJourney(), 'enceladus-plume');
        expect(arriveExpeditionTravel(travelling, 'saturn')).toBe(travelling);
        expect(arriveExpeditionTravel(travelling, 'enceladus')).toEqual({
            activeChapterId: 'enceladus-plume', targetKey: 'enceladus', phase: 'arrived'
        });
        expect(cancelExpeditionTravel(travelling)).toEqual(createExpeditionJourney());
    });

    it('derives accept, travel, travelling, start and finale actions', () => {
        expect(getExpeditionJourneyAction({ status: 'available' })).toEqual({ action: 'accept', disabled: false });
        expect(getExpeditionJourneyAction({ status: 'accepted' })).toEqual({ action: 'travel', disabled: false });
        expect(getExpeditionJourneyAction({
            status: 'accepted', chapterId: 'europa-radar',
            journey: startExpeditionTravel(createExpeditionJourney(), 'europa-radar')
        })).toEqual({ action: 'travelling', disabled: true });
        expect(getExpeditionJourneyAction({ status: 'accepted', destinationNearby: true }))
            .toEqual({ action: 'start', disabled: false });
        expect(getExpeditionJourneyAction({ status: 'available', finale: true }))
            .toEqual({ action: 'finale', disabled: false });
    });
});
