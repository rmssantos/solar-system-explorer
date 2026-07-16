import { describe, expect, it } from 'vitest';

import {
    AGENCY_JOURNEY_STAGES,
    advanceAgencyJourney,
    createAgencyJourney,
    getAgencyMastery,
    getOperationHistory
} from '../paper-preview/src/agency/agencyJourney.js';

const reports = Object.freeze([
    Object.freeze({ id: 'one', operationId: 'solar', quality: 64, scienceScore: 52, completedAt: 10 }),
    Object.freeze({ id: 'two', operationId: 'solar', quality: 91, scienceScore: 88, completedAt: 20 }),
    Object.freeze({ id: 'mars', operationId: 'mars', quality: 76, scienceScore: 70, completedAt: 30 })
]);

describe('guided paper agency journey', () => {
    it('uses one understandable five-step route', () => {
        expect(AGENCY_JOURNEY_STAGES).toEqual(['mission', 'equip', 'travel', 'investigate', 'discovery']);
        let journey = createAgencyJourney({ operationId: 'solar', reports: [] });
        expect(journey).toMatchObject({ stage: 'mission', stageIndex: 0, tutorial: true, attempt: 1 });

        for (const stage of AGENCY_JOURNEY_STAGES.slice(1)) {
            journey = advanceAgencyJourney(journey);
            expect(journey.stage).toBe(stage);
        }
        expect(advanceAgencyJourney(journey)).toBe(journey);
    });

    it('makes only the first attempt a no-fail tutorial', () => {
        expect(createAgencyJourney({ operationId: 'solar', reports }).tutorial).toBe(false);
        expect(createAgencyJourney({ operationId: 'solar', reports }).attempt).toBe(3);
        expect(createAgencyJourney({ operationId: 'new-operation', reports })).toMatchObject({ tutorial: true, attempt: 1 });
    });

    it('summarizes attempts and keeps the best result for an operation', () => {
        expect(getOperationHistory(reports, 'solar')).toEqual({
            attempts: 2,
            bestQuality: 91,
            bestScienceScore: 88,
            bestReport: reports[1]
        });
        expect(getOperationHistory(reports, 'unknown')).toEqual({
            attempts: 0,
            bestQuality: 0,
            bestScienceScore: 0,
            bestReport: null
        });
    });

    it('turns repeated play into visible mastery', () => {
        expect(getAgencyMastery({ attempts: 0, bestQuality: 0 })).toEqual({ id: 'new', level: 0 });
        expect(getAgencyMastery({ attempts: 1, bestQuality: 50 })).toEqual({ id: 'discovered', level: 1 });
        expect(getAgencyMastery({ attempts: 2, bestQuality: 74 })).toEqual({ id: 'investigator', level: 2 });
        expect(getAgencyMastery({ attempts: 3, bestQuality: 90 })).toEqual({ id: 'specialist', level: 3 });
    });

    it('does not skip or rewind journey stages accidentally', () => {
        const journey = createAgencyJourney({ operationId: 'solar' });
        expect(advanceAgencyJourney(journey, 'discovery')).toBe(journey);
        expect(advanceAgencyJourney(journey, 'mission')).toBe(journey);
        expect(advanceAgencyJourney(journey, 'equip').stage).toBe('equip');
    });
});
