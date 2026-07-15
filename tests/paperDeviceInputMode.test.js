import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    chooseInitialFlightInputMode,
    createFlightInputModeController
} from '../paper-preview/src/input/deviceInputMode.js';

class FakeEvents {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, listener) {
        const listeners = this.listeners.get(type) ?? new Set();
        listeners.add(listener);
        this.listeners.set(type, listeners);
    }
    removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
    emit(type, event = {}) { this.listeners.get(type)?.forEach((listener) => listener(event)); }
}

function fakeWindow({ coarse = false, hover = true } = {}) {
    const events = new FakeEvents();
    events.matchMedia = (query) => ({ matches: query.includes('pointer: coarse') ? coarse : hover });
    return events;
}

describe('adaptive Paper flight input mode', () => {
    it('uses capabilities rather than viewport width for desktop, phone, tablet and hybrid defaults', () => {
        expect(chooseInitialFlightInputMode({ primaryCoarse: false, hoverCapable: true, maxTouchPoints: 0 })).toBe('pointer');
        expect(chooseInitialFlightInputMode({ primaryCoarse: true, hoverCapable: false, maxTouchPoints: 5 })).toBe('touch');
        expect(chooseInitialFlightInputMode({ primaryCoarse: true, hoverCapable: false, maxTouchPoints: 10 })).toBe('touch');
        expect(chooseInitialFlightInputMode({ primaryCoarse: false, hoverCapable: true, maxTouchPoints: 10 })).toBe('pointer');
        expect(chooseInitialFlightInputMode({ primaryCoarse: false, hoverCapable: false, maxTouchPoints: 2 })).toBe('touch');
    });

    it('lets hybrid devices switch according to the input actually used', () => {
        const windowRef = fakeWindow({ coarse: false, hover: true });
        const root = { dataset: {} };
        const controller = createFlightInputModeController({
            root,
            windowRef,
            navigatorRef: { maxTouchPoints: 10 }
        });

        expect(root.dataset.flightInput).toBe('pointer');
        windowRef.emit('pointerdown', { pointerType: 'touch' });
        expect(root.dataset.flightInput).toBe('touch');
        windowRef.emit('pointerdown', { pointerType: 'pen' });
        expect(root.dataset.flightInput).toBe('touch');
        windowRef.emit('pointerdown', { pointerType: 'mouse' });
        expect(root.dataset.flightInput).toBe('pointer');
        windowRef.emit('pointerdown', { pointerType: 'touch' });
        windowRef.emit('keydown', { code: 'KeyW' });
        expect(root.dataset.flightInput).toBe('pointer');

        controller.destroy();
        windowRef.emit('pointerdown', { pointerType: 'touch' });
        expect(root.dataset.flightInput).toBe('pointer');
    });

    it('gates the joystick in CSS and initializes the controller from the game entry', () => {
        const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');
        const main = readFileSync(new URL('../paper-preview/src/main.js', import.meta.url), 'utf8');

        expect(css).toContain('html[data-flight-input="touch"] .flight-joystick');
        expect(css).toContain('html[data-flight-input="pointer"] .flight-joystick');
        expect(main).toContain('createFlightInputModeController');
    });
});
