import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    createSlingshotInputState,
    createSlingshotLayout,
    readSlingshotInput,
    readSlingshotKeyboardInput,
    setSlingshotAction
} from '../paper-preview/src/minigames/createSlingshotGame.js';

const source = readFileSync(new URL('../paper-preview/src/minigames/createSlingshotGame.js', import.meta.url), 'utf8');

function key(isDown = false) { return { isDown }; }

describe('Jupiter slingshot Phaser adapter', () => {
    it('maps shared touch controls to route, distance and boost', () => {
        const actions = createSlingshotInputState();
        setSlingshotAction(actions, 'forward', true);
        setSlingshotAction(actions, 'up', true);
        setSlingshotAction(actions, 'stabilize', true);
        expect(readSlingshotInput(actions)).toEqual({ horizontal: 1, vertical: 1, commit: true });
        expect(setSlingshotAction(actions, 'fire', true)).toBe(false);
    });

    it('supports WASD, arrows and space with matching meaning', () => {
        expect(readSlingshotKeyboardInput({
            d: key(false), arrowRight: key(false), a: key(true), arrowLeft: key(false),
            w: key(false), arrowUp: key(true), s: key(false), arrowDown: key(false),
            commit: key(true)
        })).toEqual({ horizontal: -1, vertical: 1, commit: true });
    });

    it('uses a portrait composition on tall mobile screens', () => {
        const portrait = createSlingshotLayout(390, 844);
        expect(portrait).toMatchObject({ orientation: 'portrait', width: 540, height: 960 });
        expect(portrait.shipY).toBeLessThan(600);
        expect(createSlingshotLayout(1200, 720)).toMatchObject({ orientation: 'landscape', width: 960, height: 540 });
    });

    it('lazy-loads Phaser Canvas and owns resize/cleanup', () => {
        expect(source).toMatch(/await import\(['"]phaser['"]\)/);
        expect(source).toMatch(/type:\s*Phaser\.CANVAS/);
        expect(source).toContain('stepSlingshot(');
        expect(source).toContain('ResizeObserver');
        expect(source).toContain('resizeObserver.disconnect()');
        expect(source).toContain('game.destroy(true)');
    });
});
