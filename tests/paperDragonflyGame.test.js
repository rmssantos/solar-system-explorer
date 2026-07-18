import { describe, expect, it } from 'vitest';
import { createDragonflyInputState, createDragonflyLayout, mapDragonflyPosition, readDragonflyInput, setDragonflyAction } from '../paper-preview/src/minigames/createDragonflyGame.js';

describe('Titan paper dragonfly adapter', () => {
    it('maps shared controls to flight and analysis', () => {
        const state = createDragonflyInputState(); setDragonflyAction(state, 'forward', true); setDragonflyAction(state, 'down', true); setDragonflyAction(state, 'stabilize', true);
        expect(readDragonflyInput(state)).toEqual({ horizontal: 1, vertical: -1, action: true });
    });
    it('fits the route on portrait and landscape screens', () => {
        const portrait = createDragonflyLayout(390, 844), landscape = createDragonflyLayout(960, 540);
        expect(portrait.orientation).toBe('portrait'); expect(landscape.orientation).toBe('landscape');
        const point = mapDragonflyPosition({ routeProgress: 1, altitude: 1 }, portrait);
        expect(point.x).toBeLessThan(portrait.width); expect(point.y).toBeGreaterThan(0);
    });
});
