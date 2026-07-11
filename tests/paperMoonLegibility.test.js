import { describe, expect, it } from 'vitest';
import { separateMoonSilhouette } from '../paper-preview/src/scene/moonLegibility.js';

function screenSeparation(position, parent, camera) {
    const view = {
        x: camera.x - parent.x,
        y: camera.y - parent.y,
        z: camera.z - parent.z
    };
    const viewLength = Math.hypot(view.x, view.y, view.z);
    view.x /= viewLength; view.y /= viewLength; view.z /= viewLength;
    const offset = { x: position.x - parent.x, y: position.y - parent.y, z: position.z - parent.z };
    const depth = offset.x * view.x + offset.y * view.y + offset.z * view.z;
    return Math.hypot(
        offset.x - view.x * depth,
        offset.y - view.y * depth,
        offset.z - view.z * depth
    );
}

describe('paper moon silhouette legibility', () => {
    it('moves a transiting moon to the visible limb while preserving its orbit radius', () => {
        const parent = { x: 20, y: 0, z: -10 };
        const camera = { x: 20, y: 0, z: -3 };
        const moon = { x: 20.2, y: 0, z: -7 };
        const adjusted = separateMoonSilhouette({ moon, parent, camera, minimumSeparation: 2.3 });
        expect(screenSeparation(adjusted, parent, camera)).toBeGreaterThanOrEqual(2.299);
        expect(Math.hypot(adjusted.x - parent.x, adjusted.y - parent.y, adjusted.z - parent.z))
            .toBeCloseTo(Math.hypot(moon.x - parent.x, moon.y - parent.y, moon.z - parent.z), 6);
    });

    it('does not move a moon that is already readable', () => {
        const input = { moon: { x: 3, y: 0, z: 0 }, parent: { x: 0, y: 0, z: 0 }, camera: { x: 0, y: 0, z: 8 }, minimumSeparation: 2.3 };
        expect(separateMoonSilhouette(input)).toEqual(input.moon);
    });
});
