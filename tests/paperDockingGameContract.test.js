import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
    DOCKING_LAYOUT,
    createDockingLayout,
    createDockingInputState,
    mapDockingPosition,
    readDockingKeyboardInput,
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

    it('maps every arrow and WASD key to the matching directional thruster', () => {
        const held = (...names) => Object.fromEntries(names.map((name) => [name, { isDown: true }]));
        expect(readDockingKeyboardInput(held('arrowRight'))).toMatchObject({ horizontal: 1 });
        expect(readDockingKeyboardInput(held('d'))).toMatchObject({ horizontal: 1 });
        expect(readDockingKeyboardInput(held('arrowLeft'))).toMatchObject({ horizontal: -1 });
        expect(readDockingKeyboardInput(held('a'))).toMatchObject({ horizontal: -1 });
        expect(readDockingKeyboardInput(held('arrowUp'))).toMatchObject({ vertical: 1 });
        expect(readDockingKeyboardInput(held('w'))).toMatchObject({ vertical: 1 });
        expect(readDockingKeyboardInput(held('arrowDown'))).toMatchObject({ vertical: -1 });
        expect(readDockingKeyboardInput(held('s'))).toMatchObject({ vertical: -1 });
    });

    it('keeps keyboard rotation and stabilization available', () => {
        expect(readDockingKeyboardInput({ rotateLeft: { isDown: true } })).toMatchObject({ rotation: -1 });
        expect(readDockingKeyboardInput({ rotateRight: { isDown: true } })).toMatchObject({ rotation: 1 });
        expect(readDockingKeyboardInput({ stabilize: { isDown: true } })).toMatchObject({ stabilize: true });
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
        expect(source).toContain('getState()');
        expect(source).toContain('advanceTime(milliseconds)');
    });

    it('keeps the full ISS on canvas while aligning the ship nose with its port', () => {
        expect(DOCKING_LAYOUT.issX + DOCKING_LAYOUT.issHalfWidth)
            .toBeLessThanOrEqual(DOCKING_LAYOUT.width - DOCKING_LAYOUT.edgeMargin);
        const contact = mapDockingPosition({ x: DOCKING_LAYOUT.simulationContactX, y: 0 });
        expect(contact.x + DOCKING_LAYOUT.shipNoseOffset)
            .toBeCloseTo(DOCKING_LAYOUT.issX + DOCKING_LAYOUT.portOffsetX, 5);
    });

    it('uses a vertical approach map in portrait instead of shrinking the landscape scene', () => {
        const portrait = createDockingLayout(390, 700);
        expect(portrait.orientation).toBe('portrait');
        const start = mapDockingPosition({ x: portrait.simulationMinX, y: 0 }, portrait);
        const contact = mapDockingPosition({ x: portrait.simulationContactX, y: 0 }, portrait);
        expect(start.y).toBeGreaterThan(contact.y);
        expect(contact.y - portrait.shipNoseOffset).toBeCloseTo(portrait.portY, 5);
    });
});
