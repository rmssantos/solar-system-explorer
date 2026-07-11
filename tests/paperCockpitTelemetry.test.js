import { describe, expect, it } from 'vitest';
import { createCockpitTelemetry } from '../paper-preview/src/scene/cockpitTelemetry.js';

describe('responsive paper cockpit telemetry', () => {
    it('maps flight speed and orientation to moving instruments', () => {
        const telemetry = createCockpitTelemetry({
            position: { x: 12.46, y: -3.2, z: 98.1 },
            velocity: { x: 12, y: 0, z: 0 },
            orientation: { yaw: Math.PI / 2, pitch: 0.35, roll: -0.5 }
        }, { angleRadians: Math.PI / 2, distance: 80 }, 'cockpit');

        expect(telemetry.visible).toBe(true);
        expect(telemetry.speed).toBe(12);
        expect(telemetry.speedNeedleDeg).toBeCloseTo(0, 4);
        expect(telemetry.yawDeg).toBe(90);
        expect(telemetry.pitchDeg).toBe(20);
        expect(telemetry.rollDeg).toBe(-29);
        expect(telemetry.coordinates).toEqual({ x: '+012.5', y: '-003.2', z: '+098.1' });
        expect(telemetry.radar.xPercent).toBeGreaterThan(50);
    });

    it('hides outside cockpit and clamps instruments at extreme values', () => {
        const telemetry = createCockpitTelemetry({
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 100, y: 100, z: 100 },
            orientation: { yaw: 99, pitch: 4, roll: -20 }
        }, { angleRadians: -99, distance: 10000 }, 'chase');
        expect(telemetry.visible).toBe(false);
        expect(telemetry.speedNeedleDeg).toBe(120);
        expect(telemetry.horizonOffsetPercent).toBeLessThanOrEqual(28);
        expect(telemetry.radar.xPercent).toBeGreaterThanOrEqual(12);
        expect(telemetry.radar.xPercent).toBeLessThanOrEqual(88);
    });
});
