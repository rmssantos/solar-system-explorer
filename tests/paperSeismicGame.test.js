import { describe, expect, it } from 'vitest';
import {
    createSeismicInputState,
    createSeismicLayout,
    mapSeismicPosition,
    readSeismicInput,
    readSeismicKeyboardInput,
    setSeismicAction
} from '../paper-preview/src/minigames/createSeismicGame.js';

const key = (isDown = false) => ({ isDown });

describe('lunar seismology game adapter', () => {
    it('maps touch controls to cursor movement and one clear action', () => {
        const actions = createSeismicInputState();
        setSeismicAction(actions, 'forward', true);
        setSeismicAction(actions, 'up', true);
        setSeismicAction(actions, 'stabilize', true);
        expect(readSeismicInput(actions)).toEqual({ horizontal: 1, vertical: -1, activate: true });
    });

    it('supports arrows, WASD and Space without device-specific rules', () => {
        expect(readSeismicKeyboardInput({
            d: key(), arrowRight: key(true), a: key(), arrowLeft: key(),
            w: key(true), arrowUp: key(), s: key(), arrowDown: key(), activate: key(true)
        })).toEqual({ horizontal: 1, vertical: -1, activate: true });
    });

    it('uses paper-safe portrait and landscape layouts', () => {
        const portrait = createSeismicLayout(390, 844);
        const landscape = createSeismicLayout(960, 540);
        expect(portrait.orientation).toBe('portrait');
        expect(landscape.orientation).toBe('landscape');
        const mapped = mapSeismicPosition({ x: 0.75, y: -0.65 }, portrait);
        expect(mapped.x).toBeLessThan(portrait.width);
        expect(mapped.y).toBeGreaterThan(0);
    });

    it('ignores controls outside the shared mission vocabulary', () => {
        const actions = createSeismicInputState();
        expect(setSeismicAction(actions, 'teleport', true)).toBe(false);
    });
});
