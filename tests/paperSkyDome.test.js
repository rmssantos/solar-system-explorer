import { describe, expect, it, vi } from 'vitest';
import { syncSkyDome } from '../paper-preview/src/scene/skyDome.js';

describe('camera-centred sky dome', () => {
    it('keeps the inside-facing sky centred on the camera at every world boundary', () => {
        const camera = { position: { x: 175, y: 50, z: 175 } };
        const copy = vi.fn();
        const sky = { position: { copy } };

        syncSkyDome(sky, camera);

        expect(copy).toHaveBeenCalledExactlyOnceWith(camera.position);
    });
});
