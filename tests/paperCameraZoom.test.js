import { describe, expect, it } from 'vitest';
import {
    CAMERA_DISTANCE_LIMITS,
    adjustCameraDistance,
    cameraModeForDistance
} from '../paper-preview/src/scene/cameraZoom.js';

describe('paper camera zoom', () => {
    it('clamps zoom between cockpit and long chase view', () => {
        expect(adjustCameraDistance(6.4, -100)).toBe(CAMERA_DISTANCE_LIMITS.min);
        expect(adjustCameraDistance(6.4, 100)).toBe(CAMERA_DISTANCE_LIMITS.max);
    });

    it('enters cockpit only at the closest zoom range', () => {
        expect(cameraModeForDistance(0.4)).toBe('cockpit');
        expect(cameraModeForDistance(1.2)).toBe('chase');
    });
});
