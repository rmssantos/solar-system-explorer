import { describe, expect, it } from 'vitest';
import {
    PLANETS,
    closeNotebook,
    createPreviewState,
    exploreActive,
    navigate
} from '../paper-preview/src/state.js';

describe('Paper diorama preview state', () => {
    it('starts at the Sun with Saturn as the mission target', () => {
        const state = createPreviewState();

        expect(PLANETS.map((planet) => planet.key)).toEqual(['sun', 'earth', 'saturn']);
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
        const atSaturn = navigate(navigate(initial, 1), 1);
        const afterLast = navigate(atSaturn, 1);

        expect(beforeFirst.activeIndex).toBe(0);
        expect(atSaturn.activeIndex).toBe(2);
        expect(afterLast.activeIndex).toBe(2);
        expect(beforeFirst).not.toBe(initial);
    });

    it('opens the Earth field note without completing the mission', () => {
        const earthState = navigate(createPreviewState(), 1);
        const explored = exploreActive(earthState);

        expect(explored.notebook).toEqual({ open: true, planetKey: 'earth' });
        expect(explored.missionComplete).toBe(false);
    });

    it('completes the mission when Saturn is explored', () => {
        const saturnState = navigate(navigate(createPreviewState(), 1), 1);
        const explored = exploreActive(saturnState);

        expect(explored.notebook).toEqual({ open: true, planetKey: 'saturn' });
        expect(explored.missionComplete).toBe(true);
    });

    it('keeps mission completion after the notebook closes', () => {
        const saturnState = navigate(navigate(createPreviewState(), 1), 1);
        const closed = closeNotebook(exploreActive(saturnState));

        expect(closed.notebook).toEqual({ open: false, planetKey: null });
        expect(closed.missionComplete).toBe(true);
    });
});
