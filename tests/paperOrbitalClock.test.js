import { describe, expect, it } from 'vitest';
import {
    DEFAULT_ORBITAL_TIME_SCALE,
    ORBITAL_TIME_SCALES,
    createOrbitalClock,
    presentOrbitalClock,
    resetOrbitalClockToToday,
    setOrbitalTimeScale,
    stepOrbitalClock
} from '../paper-preview/src/world/orbitalClock.js';

const START = Date.parse('2026-07-18T12:00:00Z');
const DAY_MS = 86_400_000;

describe('live Solar System orbital clock', () => {
    it('starts at the child-friendly visible speed and only accepts supported scales', () => {
        const clock = createOrbitalClock({ dateMs: START });
        expect(DEFAULT_ORBITAL_TIME_SCALE).toBe(10);
        expect(ORBITAL_TIME_SCALES).toEqual([0, 1, 10, 100]);
        expect(clock).toEqual({ dateMs: START, timeScale: 10 });
        expect(Object.isFrozen(clock)).toBe(true);
        expect(setOrbitalTimeScale(clock, 100).timeScale).toBe(100);
        expect(setOrbitalTimeScale(clock, 7)).toBe(clock);
    });

    it('advances deterministically in simulated days per real second', () => {
        const clock = createOrbitalClock({ dateMs: START, timeScale: 10 });
        const advanced = stepOrbitalClock(clock, 2.5);
        expect(advanced.dateMs).toBe(START + 25 * DAY_MS);
        expect(advanced.timeScale).toBe(10);
        expect(stepOrbitalClock(clock, -4)).toBe(clock);
    });

    it('pauses the sky without losing the previously selected date', () => {
        const clock = setOrbitalTimeScale(createOrbitalClock({ dateMs: START }), 0);
        expect(stepOrbitalClock(clock, 30)).toBe(clock);
        expect(presentOrbitalClock(clock)).toMatchObject({ paused: true, daysPerSecond: 0 });
    });

    it('returns to today without changing the selected sky speed', () => {
        const future = createOrbitalClock({ dateMs: START + (400 * DAY_MS), timeScale: 100 });
        const today = resetOrbitalClockToToday(future, START + (2 * DAY_MS));

        expect(today).toEqual({ dateMs: START + (2 * DAY_MS), timeScale: 100 });
    });

    it('caps visual motion so 100x remains readable', () => {
        const slow = presentOrbitalClock(createOrbitalClock({ dateMs: START, timeScale: 1 }));
        const fast = presentOrbitalClock(createOrbitalClock({ dateMs: START, timeScale: 100 }));
        expect(slow).toMatchObject({ paused: false, daysPerSecond: 1, satelliteFactor: 1, rotationFactor: 1 });
        expect(fast).toMatchObject({ daysPerSecond: 100, satelliteFactor: 30, rotationFactor: 10 });
        expect(fast.isoDate).toBe('2026-07-18T12:00:00.000Z');
        expect(Object.isFrozen(fast)).toBe(true);
    });
});
