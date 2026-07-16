import { describe, expect, it } from 'vitest';
import {
    createSweepInputState,
    createSweepLayout,
    mapSweepPosition,
    readSweepInput,
    readSweepKeyboardInput,
    setSweepAction
} from '../paper-preview/src/minigames/createSweepGame.js';

function key(isDown = false) {
    return { isDown };
}

describe('lunar sweep game adapter', () => {
    it('keeps touch directions aligned with the screen in portrait and landscape', () => {
        const actions = createSweepInputState();
        setSweepAction(actions, 'reverse', true);
        setSweepAction(actions, 'up', true);

        expect(readSweepInput(actions, 'landscape')).toMatchObject({ horizontal: -1, vertical: -1 });
        expect(readSweepInput(actions, 'portrait')).toMatchObject({ horizontal: -1, vertical: -1 });
    });

    it('supports WASD, arrows and space with matching directions', () => {
        expect(readSweepKeyboardInput({
            d: key(true), arrowRight: key(false),
            a: key(false), arrowLeft: key(false),
            w: key(false), arrowUp: key(true),
            s: key(false), arrowDown: key(false),
            stabilize: key(true)
        })).toEqual({ horizontal: 1, vertical: -1, stabilize: true });
    });

    it('chooses a portrait canvas and maps normalized positions into safe margins', () => {
        const layout = createSweepLayout(400, 850);
        const center = mapSweepPosition({ x: 0, y: 0 }, layout);
        const corner = mapSweepPosition({ x: 0.9, y: -0.68 }, layout);

        expect(layout.orientation).toBe('portrait');
        expect(center).toEqual({ x: layout.width / 2, y: layout.height / 2 });
        expect(corner.x).toBeLessThan(layout.width);
        expect(corner.y).toBeGreaterThan(0);
    });
});
