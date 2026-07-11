import { describe, expect, it } from 'vitest';
import { CHASE_CAMERA_LAYOUT } from '../paper-preview/src/scene/createPaperScene.js';

describe('Paper chase camera composition', () => {
    it('places the ship near 35% above the bottom edge', () => {
        expect(CHASE_CAMERA_LAYOUT.distance).toBe(6.4);
        expect(CHASE_CAMERA_LAYOUT.verticalOffset).toBeGreaterThanOrEqual(0.8);
        expect(CHASE_CAMERA_LAYOUT.verticalOffset).toBeLessThanOrEqual(1.1);
    });
});
