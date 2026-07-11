import { describe, expect, it } from 'vitest';
import { calculateWaypoint, formatSolarDistance } from '../paper-preview/src/navigation/waypoint.js';

const basis = Object.freeze({
    forward: { x: 0, y: 0, z: -1 },
    right: { x: 1, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 }
});

describe('mission waypoint', () => {
    it('points forward, right, and behind relative to the rendered camera', () => {
        const from = { x: 0, y: 0, z: 0 };
        expect(calculateWaypoint({ from, to: { x: 0, y: 0, z: -10 }, basis }).angleRadians).toBeCloseTo(0, 6);
        expect(calculateWaypoint({ from, to: { x: 10, y: 0, z: 0 }, basis }).angleRadians).toBeCloseTo(Math.PI / 2, 6);
        expect(Math.abs(calculateWaypoint({ from, to: { x: 0, y: 0, z: 10 }, basis }).angleRadians)).toBeCloseTo(Math.PI, 6);
    });

    it('reports exact diorama distance and reached state', () => {
        const result = calculateWaypoint({
            from: { x: 1, y: 2, z: 3 },
            to: { x: 4, y: 6, z: 3 },
            basis,
            interactionRadius: 5
        });
        expect(result.distanceUnits).toBe(5);
        expect(result.reached).toBe(true);
        expect(result.distanceLabel).toBe('Ao alcance');
    });

    it('describes scientific solar distance without claiming a linear game scale', () => {
        expect(formatSolarDistance(1)).toBe('1 UA ao Sol');
        expect(formatSolarDistance(9.5388)).toBe('9,54 UA ao Sol');
        expect(formatSolarDistance(0)).toBe('Centro do sistema');
        const result = calculateWaypoint({
            from: { x: 0, y: 0, z: 0 }, to: { x: 0, y: 0, z: -12.4 }, basis,
            solarDistanceAu: 9.5388
        });
        expect(result.distanceLabel).toBe('12 u no diorama');
        expect(result.scientificLabel).toBe('9,54 UA ao Sol');
    });
});
