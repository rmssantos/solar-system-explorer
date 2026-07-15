import { describe, expect, it } from 'vitest';
import { createLocalOrbitHost } from '../paper-preview/src/minigames/localOrbitHost.js';

function fakeElement(dataset = {}) {
    const listeners = new Map();
    const classes = new Set();
    return {
        dataset,
        hidden: false,
        textContent: '',
        open: false,
        addEventListener(type, listener) { listeners.set(type, listener); },
        removeEventListener(type) { listeners.delete(type); },
        emit(type, event = {}) { listeners.get(type)?.({ preventDefault() {}, pointerId: 1, ...event }); },
        showModal() { this.open = true; },
        close() { this.open = false; },
        classList: {
            toggle(name, force) { if (force) classes.add(name); else classes.delete(name); },
            contains(name) { return classes.has(name); }
        }
    };
}

function createElements() {
    return {
        dialog: fakeElement(), stage: fakeElement(), loading: fakeElement(), error: fakeElement(), result: fakeElement(),
        guidance: fakeElement(), distance: fakeElement(), speed: fakeElement(), alignment: fakeElement(),
        close: fakeElement(), finish: fakeElement(), retry: fakeElement(),
        controls: ['forward', 'reverse', 'up', 'down', 'rotate-left', 'rotate-right', 'stabilize']
            .map((action) => fakeElement({ dockingAction: action }))
    };
}

describe('local orbit host', () => {
    it('opens the dialog and starts an injected game factory', async () => {
        const elements = createElements();
        let options = null;
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (value) => { options = value; value.onReady(); return { destroy() {}, setAction() {} }; }
        });

        await host.open();

        expect(elements.dialog.open).toBe(true);
        expect(options.parent).toBe(elements.stage);
        expect(elements.loading.hidden).toBe(true);
        expect(elements.error.hidden).toBe(true);
    });

    it('renders telemetry and its safe or warning state', async () => {
        const elements = createElements();
        let gameOptions;
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (options) => { gameOptions = options; options.onReady(); return { destroy() {}, setAction() {} }; }
        });
        await host.open();

        gameOptions.onTelemetry({
            distance: 2.45,
            relativeSpeed: 0.31,
            alignmentDegrees: 3,
            corridorSafe: true,
            speedSafe: true,
            alignmentSafe: false
        });

        expect(elements.distance.textContent).toBe('2.5 m');
        expect(elements.speed.textContent).toBe('0.31 m/s');
        expect(elements.alignment.textContent).toBe('3.0°');
        expect(elements.distance.classList.contains('is-safe')).toBe(true);
        expect(elements.speed.classList.contains('is-safe')).toBe(true);
        expect(elements.alignment.classList.contains('is-warning')).toBe(true);
    });

    it('forwards held pointer actions to the game', async () => {
        const elements = createElements();
        const actions = [];
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (options) => {
                options.onReady();
                return { destroy() {}, setAction: (action, active) => actions.push([action, active]) };
            }
        });
        await host.open();

        elements.controls[0].emit('pointerdown');
        elements.controls[0].emit('pointerup');

        expect(actions).toEqual([['forward', true], ['forward', false]]);
    });

    it('shows assisted feedback and completes only once', async () => {
        const elements = createElements();
        let gameOptions;
        let completions = 0;
        const host = createLocalOrbitHost({
            elements,
            messages: { retry: 'A Lumi afastou a nave. Tenta outra vez.' },
            onComplete: () => { completions += 1; },
            gameFactory: async (options) => { gameOptions = options; options.onReady(); return { destroy() {}, setAction() {} }; }
        });
        await host.open();

        gameOptions.onEvent('unsafe-contact');
        expect(elements.guidance.textContent).toMatch(/Lumi/);
        gameOptions.onEvent('docked');
        gameOptions.onEvent('docked');

        expect(elements.result.hidden).toBe(false);
        expect(completions).toBe(1);
    });

    it('recovers from a load failure and destroys the game when closing', async () => {
        const elements = createElements();
        let attempts = 0;
        let destroyed = 0;
        let closed = 0;
        const host = createLocalOrbitHost({
            elements,
            onClose: () => { closed += 1; },
            gameFactory: async (options) => {
                attempts += 1;
                if (attempts === 1) throw new Error('offline chunk');
                options.onReady();
                return { destroy: () => { destroyed += 1; }, setAction() {} };
            }
        });

        await host.open();
        expect(elements.error.hidden).toBe(false);
        elements.retry.emit('click');
        await Promise.resolve();
        await Promise.resolve();
        expect(attempts).toBe(2);
        elements.close.emit('click');

        expect(destroyed).toBe(1);
        expect(elements.dialog.open).toBe(false);
        expect(closed).toBe(1);
    });
});

