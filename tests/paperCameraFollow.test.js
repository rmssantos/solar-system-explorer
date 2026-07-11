import { describe, expect, it } from 'vitest';
import { cameraFollowAlpha } from '../paper-preview/src/scene/cameraFollow.js';

describe('frame-rate independent camera follow', () => {
    it('never overshoots and ignores invalid frame gaps', () => {
        expect(cameraFollowAlpha(-1)).toBe(0);
        expect(cameraFollowAlpha(0)).toBe(0);
        expect(cameraFollowAlpha(1 / 60)).toBeGreaterThan(0);
        expect(cameraFollowAlpha(1 / 60)).toBeLessThan(1);
        expect(cameraFollowAlpha(10)).toBeLessThanOrEqual(1);
    });

    it('produces the same convergence over one second at 60 and 120 fps', () => {
        const remaining = (frames, delta) => {
            let value = 1;
            for (let index = 0; index < frames; index += 1) value *= 1 - cameraFollowAlpha(delta);
            return value;
        };
        expect(remaining(60, 1 / 60)).toBeCloseTo(remaining(120, 1 / 120), 8);
    });
});
