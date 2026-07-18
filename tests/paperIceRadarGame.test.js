import { describe, expect, it } from 'vitest';
import {
    createIceRadarInputState,
    createIceRadarLayout,
    mapIceRadarPosition,
    readIceRadarInput,
    readIceRadarKeyboardInput,
    setIceRadarAction
} from '../paper-preview/src/minigames/createIceRadarGame.js';

const key = (isDown = false) => ({ isDown });

describe('Europa ice radar game adapter', () => {
    it('maps the shared touch controls to strip, power and scan', () => {
        const actions = createIceRadarInputState();
        setIceRadarAction(actions, 'reverse', true);
        setIceRadarAction(actions, 'down', true);
        setIceRadarAction(actions, 'stabilize', true);
        expect(readIceRadarInput(actions)).toEqual({ horizontal: -1, vertical: -1, scan: true });
    });

    it('supports keyboard and touch with identical meaning', () => {
        expect(readIceRadarKeyboardInput({
            d: key(true), arrowRight: key(), a: key(), arrowLeft: key(),
            w: key(), arrowUp: key(true), s: key(), arrowDown: key(), scan: key(true)
        })).toEqual({ horizontal: 1, vertical: 1, scan: true });
    });

    it('keeps the paper cross-section safe in portrait and landscape', () => {
        const portrait = createIceRadarLayout(390, 844);
        const landscape = createIceRadarLayout(960, 540);
        expect(portrait.orientation).toBe('portrait');
        expect(landscape.orientation).toBe('landscape');
        const point = mapIceRadarPosition(1, portrait);
        expect(point.x).toBeLessThan(portrait.width);
        expect(point.y).toBeGreaterThan(0);
    });
});
