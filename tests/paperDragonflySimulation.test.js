import { describe, expect, it } from 'vitest';
import { createDragonflyState, getDragonflyTelemetry, stepDragonfly } from '../paper-preview/src/minigames/dragonflySimulation.js';

describe('Titan dragonfly simulation', () => {
    it('starts before two science sites with a stable craft', () => {
        const state = createDragonflyState();
        expect(state).toMatchObject({ phase: 'flying', routeProgress: 0, stability: 1, analysedSites: [] });
    });
    it('flies along the route and lets vertical input counter the wind', () => {
        const next = stepDragonfly(createDragonflyState(), { horizontal: 1, vertical: 1 }, 0.25);
        expect(next.routeProgress).toBeGreaterThan(0);
        expect(next.altitude).toBeGreaterThan(0.5);
        expect(next.stability).toBeGreaterThanOrEqual(0.7);
    });
    it('analyses both sites with a fresh action press', () => {
        const first = stepDragonfly(createDragonflyState({ routeProgress: 0.45 }), { action: true }, 0.1);
        expect(first.analysedSites).toEqual(['dunes']);
        const released = stepDragonfly(first, { action: false }, 0.1);
        const second = stepDragonfly(createDragonflyState({ ...released, routeProgress: 0.84 }), { action: true }, 0.1);
        expect(second.analysedSites).toEqual(['dunes', 'lake-shore']);
        expect(second.phase).toBe('complete');
        expect(second.event).toBe('dragonfly-landed');
    });
    it('turns an unsafe landing into corrective feedback', () => {
        const state = createDragonflyState({ routeProgress: 0.84, stability: 0.3, analysedSites: ['dunes'] });
        const next = stepDragonfly(state, { action: true }, 0.1);
        expect(next.event).toBe('rough-landing');
        expect(next.phase).toBe('flying');
        expect(next.analysedSites).toEqual(['dunes']);
    });
    it('publishes route, stability and site confidence', () => {
        expect(getDragonflyTelemetry(createDragonflyState({ routeProgress: 0.5, analysedSites: ['dunes'] })))
            .toMatchObject({ routeProgress: 0.5, siteConfidence: 0.5 });
    });
});
