import { describe, expect, it } from 'vitest';
import {
    PLANETS,
    closeNotebook,
    createPreviewState,
    exploreActive,
    navigate
} from '../paper-preview/src/state.js';
import { createPaperProfile } from '../paper-preview/src/scene/paperGeometry.js';

describe('Paper diorama preview state', () => {
    it('starts at the Sun with Saturn as the mission target', () => {
        const state = createPreviewState();

        expect(PLANETS.map((planet) => planet.key)).toEqual([
            'sun', 'mercury', 'venus', 'earth', 'mars',
            'jupiter', 'saturn', 'uranus', 'neptune'
        ]);
        expect(state).toMatchObject({
            activeIndex: 0,
            objectiveTarget: 'saturn',
            missionComplete: false,
            notebook: { open: false, planetKey: null }
        });
    });

    it('clamps navigation at the first and last planet', () => {
        const initial = createPreviewState();
        const beforeFirst = navigate(initial, -1);
        let afterLast = initial;
        for (let index = 0; index < PLANETS.length + 2; index += 1) afterLast = navigate(afterLast, 1);

        expect(beforeFirst.activeIndex).toBe(0);
        expect(afterLast.activeIndex).toBe(PLANETS.length - 1);
        expect(beforeFirst).not.toBe(initial);
    });

    it('opens the Earth field note without completing the mission', () => {
        const earthState = { ...createPreviewState(), activeIndex: 3 };
        const explored = exploreActive(earthState);

        expect(explored.notebook).toEqual({ open: true, planetKey: 'earth' });
        expect(explored.missionComplete).toBe(false);
    });

    it('completes the mission when Saturn is explored', () => {
        const saturnState = { ...createPreviewState(), activeIndex: 6 };
        const explored = exploreActive(saturnState);

        expect(explored.notebook).toEqual({ open: true, planetKey: 'saturn' });
        expect(explored.missionComplete).toBe(true);
    });

    it('keeps mission completion after the notebook closes', () => {
        const saturnState = { ...createPreviewState(), activeIndex: 6 };
        const closed = closeNotebook(exploreActive(saturnState));

        expect(closed.notebook).toEqual({ open: false, planetKey: null });
        expect(closed.missionComplete).toBe(true);
    });
});

describe('Paper silhouette geometry', () => {
    it('creates deterministic finite edges inside the requested jitter', () => {
        const options = { seed: 42, segments: 24, jitter: 0.08 };
        const first = createPaperProfile(options);
        const repeated = createPaperProfile(options);
        const different = createPaperProfile({ ...options, seed: 43 });

        expect(first).toEqual(repeated);
        expect(first).toHaveLength(24);
        expect(different).not.toEqual(first);

        for (const point of first) {
            const radius = Math.hypot(point.x, point.y);
            expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true);
            expect(radius).toBeGreaterThanOrEqual(0.92);
            expect(radius).toBeLessThanOrEqual(1.08);
        }
    });
});
