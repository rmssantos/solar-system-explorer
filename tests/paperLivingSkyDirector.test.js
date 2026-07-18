import { describe, expect, it } from 'vitest';
import {
    assessLivingSkyObservation,
    getLivingSkyEventWindow,
    getNextLivingSkyObservationDate,
    presentLivingSky
} from '../paper-preview/src/living-sky/livingSkyDirector.js';

const START = Date.parse('2026-07-18T12:00:00Z');
const DAY_MS = 86_400_000;

describe('Living Sky director', () => {
    it('marks the opening aurora window active and advances recurring windows in UTC', () => {
        const active = getLivingSkyEventWindow('earth-aurora', START);
        expect(active).toMatchObject({ active: true, eventId: 'earth-aurora' });
        expect(active.startMs).toBe(Date.parse('2026-07-18T00:00:00Z'));
        expect(active.endMs).toBeGreaterThan(START);

        const later = START + 4 * DAY_MS;
        const inactive = getLivingSkyEventWindow('earth-aurora', later);
        expect(inactive.active).toBe(false);
        expect(getNextLivingSkyObservationDate('earth-aurora', later)).toBeGreaterThan(later);
    });

    it('presents active and upcoming localized observations in chronological order', () => {
        const view = presentLivingSky(START, 'en');
        expect(view.simulationDisclosure).toMatch(/diorama|simulation/i);
        expect(view.activeEvents.map((event) => event.id)).toContain('earth-aurora');
        expect(view.upcomingEvents).toHaveLength(3);
        expect(view.upcomingEvents.map((event) => event.window.startMs))
            .toEqual([...view.upcomingEvents.map((event) => event.window.startMs)].sort((a, b) => a - b));
        expect(view.activeEvents[0].title).toBe('Earth aurora');
    });

    it('qualifies a steady, well-framed observation with the scientific instrument', () => {
        const result = assessLivingSkyObservation('earth-aurora', {
            active: true,
            visible: true,
            screenDistance: 0.05,
            worldDistance: 8,
            stability: 0.92,
            filter: 'magnetic'
        });
        expect(result).toMatchObject({ ready: true, qualified: true, filterCorrect: true });
        expect(result.score).toBeGreaterThanOrEqual(0.72);
        expect(result.feedback).toBe('ready');
    });

    it('coaches wrong instruments and inactive windows without blocking the shutter', () => {
        const wrongFilter = assessLivingSkyObservation('mars-dust-front', {
            active: true, visible: true, screenDistance: 0.04, worldDistance: 8,
            stability: 1, filter: 'visible'
        });
        expect(wrongFilter.ready).toBe(true);
        expect(wrongFilter.qualified).toBe(false);
        expect(wrongFilter.feedback).toBe('try-instrument');

        const inactive = assessLivingSkyObservation('mars-dust-front', {
            active: false, visible: true, screenDistance: 0, worldDistance: 8,
            stability: 1, filter: 'infrared'
        });
        expect(inactive.ready).toBe(true);
        expect(inactive.qualified).toBe(false);
        expect(inactive.feedback).toBe('outside-window');
    });

    it('distinguishes being too close from being too far away', () => {
        const base = {
            active: true, visible: true, screenDistance: 0.04,
            stability: 1, filter: 'magnetic'
        };
        expect(assessLivingSkyObservation('earth-aurora', { ...base, worldDistance: 2.35 }).feedback)
            .toBe('move-back');
        expect(assessLivingSkyObservation('earth-aurora', { ...base, worldDistance: 24 }).feedback)
            .toBe('move-closer');
    });

    it('keeps the shutter available for free photography while explaining weak framing', () => {
        const result = assessLivingSkyObservation(null, {
            active: false, visible: true, screenDistance: 0.6, worldDistance: 30,
            stability: 0.4, filter: 'visible'
        });
        expect(result.ready).toBe(true);
        expect(result.qualified).toBe(false);
        expect(result.feedback).toBe('free-photo');
        expect(result.score).toBeGreaterThanOrEqual(0);
    });
});
