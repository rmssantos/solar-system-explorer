import { describe, expect, it } from 'vitest';
import { createPlumeInputState, createPlumeLayout, mapPlumePosition, readPlumeInput, readPlumeKeyboardInput, setPlumeAction } from '../paper-preview/src/minigames/createPlumeGame.js';

const key = (isDown = false) => ({ isDown });

describe('Enceladus plume game adapter', () => {
    it('maps touch and keyboard controls consistently', () => {
        const actions = createPlumeInputState();
        setPlumeAction(actions, 'forward', true); setPlumeAction(actions, 'up', true); setPlumeAction(actions, 'stabilize', true);
        expect(readPlumeInput(actions)).toEqual({ horizontal: 1, vertical: 1, collector: true });
        expect(readPlumeKeyboardInput({ d: key(), arrowRight: key(), a: key(true), arrowLeft: key(), w: key(), arrowUp: key(), s: key(), arrowDown: key(true), collector: key(true) }))
            .toEqual({ horizontal: -1, vertical: -1, collector: true });
    });

    it('keeps the flight corridor usable on phone and desktop', () => {
        const portrait = createPlumeLayout(390, 844);
        const landscape = createPlumeLayout(960, 540);
        expect(portrait.orientation).toBe('portrait');
        expect(landscape.orientation).toBe('landscape');
        const point = mapPlumePosition({ x: 1, y: -1 }, portrait);
        expect(point.x).toBeLessThan(portrait.width);
        expect(point.y).toBeGreaterThan(0);
    });
});
