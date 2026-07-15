import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
    createDockingInputState,
    readDockingInput,
    setDockingAction
} from '../paper-preview/src/minigames/createDockingGame.js';

const source = readFileSync(new URL('../paper-preview/src/minigames/createDockingGame.js', import.meta.url), 'utf8');

describe('Phaser Canvas docking adapter', () => {
    it('maps held UI actions into normalized simulation input', () => {
        const state = createDockingInputState();
        setDockingAction(state, 'forward', true);
        setDockingAction(state, 'up', true);
        setDockingAction(state, 'rotate-left', true);
        setDockingAction(state, 'stabilize', true);

        expect(readDockingInput(state)).toEqual({
            horizontal: 1,
            vertical: 1,
            rotation: -1,
            stabilize: true
        });

        setDockingAction(state, 'forward', false);
        setDockingAction(state, 'reverse', true);
        expect(readDockingInput(state).horizontal).toBe(-1);
    });

    it('ignores unknown actions without changing the input map', () => {
        const state = createDockingInputState();
        expect(setDockingAction(state, 'fire-laser', true)).toBe(false);
        expect(readDockingInput(state)).toEqual({ horizontal: 0, vertical: 0, rotation: 0, stabilize: false });
    });

    it('lazy-loads Phaser and explicitly uses its Canvas renderer', () => {
        expect(source).toMatch(/await import\(['"]phaser['"]\)/);
        expect(source).toMatch(/type:\s*Phaser\.CANVAS/);
        expect(source).toContain('stepDocking(');
        expect(source).toContain('getDockingTelemetry(');
    });

    it('owns resize and destruction cleanup at the adapter boundary', () => {
        expect(source).toContain('ResizeObserver');
        expect(source).toMatch(/game\.destroy\(true\)/);
        expect(source).toContain('resizeObserver.disconnect()');
    });
});

