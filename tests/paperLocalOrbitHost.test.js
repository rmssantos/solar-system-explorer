import { describe, expect, it } from 'vitest';
import { createLocalOrbitHost } from '../paper-preview/src/minigames/localOrbitHost.js';

function fakeElement(dataset = {}) {
    const listeners = new Map();
    const classes = new Set();
    const attributes = new Map();
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
        setAttribute(name, value) { attributes.set(name, String(value)); },
        getAttribute(name) { return attributes.get(name) ?? null; },
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
        metricLabels: [fakeElement(), fakeElement(), fakeElement()],
        kicker: fakeElement(), title: fakeElement(), playfield: fakeElement(), resultTitle: fakeElement(), resultScience: fakeElement(),
        close: fakeElement(), finish: fakeElement(), retry: fakeElement(),
        leaveConfirm: fakeElement(), leaveContinue: fakeElement(), leaveSave: fakeElement(), leaveRestart: fakeElement(),
        training: fakeElement(), trainingTitle: fakeElement(), trainingStep: fakeElement(), trainingNext: fakeElement(), trainingSkip: fakeElement(),
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

    it('applies the selected mission profile to copy and game creation', async () => {
        const elements = createElements();
        let options = null;
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (value) => { options = value; value.onReady(); return { destroy() {}, setAction() {} }; }
        });

        await host.open({ missionId: 'hubble-service', language: 'en' });

        expect(options.profile).toMatchObject({ id: 'hubble-service', target: 'hubble' });
        expect(elements.title.textContent).toBe('Hubble maintenance');
        expect(elements.resultTitle.textContent).toMatch(/Hubble/);
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

    it('adapts controls and telemetry to the lunar sweep', async () => {
        const elements = createElements();
        let gameOptions;
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (options) => { gameOptions = options; options.onReady(); return { destroy() {}, setAction() {} }; }
        });

        await host.open({ missionId: 'lunar-sweep', language: 'pt' });
        gameOptions.onTelemetry({
            collected: 2, total: 4, shield: 2, signalStrength: 0.75,
            primarySafe: true, secondarySafe: true, tertiarySafe: true
        });

        expect(gameOptions.profile.gameplay).toBe('sweep');
        expect(elements.controls.find((item) => item.dataset.dockingAction === 'rotate-left').hidden).toBe(true);
        expect(elements.controls.find((item) => item.dataset.dockingAction === 'stabilize').textContent).toBe('Travar');
        expect(elements.metricLabels.map((item) => item.textContent)).toEqual(['Transmissores', 'Escudo', 'Sinal']);
        expect([elements.distance.textContent, elements.speed.textContent, elements.alignment.textContent])
            .toEqual(['2/4', '2/3', '75%']);
        expect(elements.controls.find((item) => item.dataset.dockingAction === 'forward').getAttribute('aria-label'))
            .toBe('Mover para a direita');
    });

    it('uses mission-specific feedback and completion events', async () => {
        const elements = createElements();
        let gameOptions;
        let completions = 0;
        const host = createLocalOrbitHost({
            elements,
            onComplete: () => { completions += 1; },
            gameFactory: async (options) => { gameOptions = options; options.onReady(); return { destroy() {}, setAction() {} }; }
        });

        await host.open({ missionId: 'lunar-sweep', language: 'en' });
        gameOptions.onEvent('debris-hit');
        expect(elements.guidance.textContent).toMatch(/shield/i);
        gameOptions.onEvent('docked');
        expect(completions).toBe(0);
        gameOptions.onEvent('sweep-complete');
        expect(completions).toBe(1);
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

    it('exposes concise mission state and deterministic stepping for browser QA', async () => {
        const elements = createElements();
        let advanced = 0;
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (options) => {
                options.onReady();
                options.onTelemetry({ distance: 3, relativeSpeed: 0.2, alignmentDegrees: 2, corridorSafe: true, speedSafe: true, alignmentSafe: true });
                return {
                    destroy() {}, setAction() {},
                    getState: () => ({ phase: 'approach', position: { x: -3, y: 0 } }),
                    advanceTime: (milliseconds) => { advanced += milliseconds; }
                };
            }
        });
        await host.open({ missionId: 'hubble-service', language: 'pt' });

        host.advanceTime(250);

        expect(advanced).toBe(250);
        expect(host.getState()).toMatchObject({
            missionId: 'hubble-service', completed: false,
            telemetry: { distance: 3 },
            simulation: { phase: 'approach' }
        });
    });

    it('uses semantic Mars controls instead of generic flight labels', async () => {
        const elements = createElements();
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (options) => { options.onReady(); return { destroy() {}, setAction() {} }; }
        });

        await host.open({ missionId: 'mars-relay', language: 'pt' });

        const labels = Object.fromEntries(elements.controls.map((control) => [
            control.dataset.dockingAction, control.getAttribute('aria-label')
        ]));
        expect(labels).toMatchObject({
            forward: 'Aumentar ângulo', reverse: 'Diminuir ângulo',
            up: 'Diminuir frequência', down: 'Aumentar frequência', stabilize: 'Transmitir'
        });
    });

    it('shows a first-play tutorial and reports completion or an explicit replay mode', async () => {
        const elements = createElements();
        const completed = [];
        let gameStarts = 0;
        const host = createLocalOrbitHost({
            elements,
            onTrainingComplete: (gameplay) => completed.push(gameplay),
            gameFactory: async (options) => {
                gameStarts += 1;
                options.onReady();
                return { destroy() {}, setAction() {} };
            }
        });

        await host.open({ missionId: 'iss-docking', language: 'en', showTraining: true });
        expect(gameStarts).toBe(0);
        expect(elements.training.hidden).toBe(false);
        expect(elements.trainingTitle.textContent).toMatch(/practice/i);
        expect(elements.trainingStep.textContent).toMatch(/yellow corridor/i);
        elements.trainingNext.emit('click');
        expect(gameStarts).toBe(0);
        elements.trainingNext.emit('click');
        await Promise.resolve();
        expect(completed).toEqual(['docking']);
        expect(elements.training.hidden).toBe(true);
        expect(gameStarts).toBe(1);
    });

    it('formats Jupiter telemetry with the selected language', async () => {
        const elements = createElements();
        let gameOptions;
        const host = createLocalOrbitHost({
            elements,
            gameFactory: async (options) => {
                gameOptions = options;
                options.onReady();
                return { destroy() {}, setAction() {} };
            }
        });
        await host.open({ missionId: 'jupiter-slingshot', language: 'pt' });

        gameOptions.onTelemetry({
            routePercent: 0.82, altitudeKm: 480000, speedGain: 12.5,
            primarySafe: true, secondarySafe: true, tertiarySafe: true
        });

        expect(elements.speed.textContent).toBe(`${new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(480000)} km`);
        expect(elements.alignment.textContent).toBe(`+${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(12.5)} km/s`);
    });

    it('asks before leaving an incomplete attempt and can save its simulation', async () => {
        const elements = createElements();
        const saved = [];
        const host = createLocalOrbitHost({
            elements,
            onAttemptSave: (attempt) => saved.push(attempt),
            gameFactory: async (options) => {
                options.onReady();
                return {
                    destroy() {}, setAction() {},
                    getState: () => ({ phase: 'approach', elapsedSeconds: 4, position: { x: -4, y: 0 } })
                };
            }
        });
        await host.open({ contract: { id: 'iss-delivery' }, missionId: 'iss-docking' });

        elements.close.emit('click');
        expect(elements.dialog.open).toBe(true);
        expect(elements.leaveConfirm.hidden).toBe(false);
        elements.leaveContinue.emit('click');
        expect(elements.leaveConfirm.hidden).toBe(true);
        elements.close.emit('click');
        elements.leaveSave.emit('click');

        expect(saved).toEqual([{
            contractId: 'iss-delivery', missionId: 'iss-docking',
            simulation: { phase: 'approach', elapsedSeconds: 4, position: { x: -4, y: 0 } }
        }]);
        expect(elements.dialog.open).toBe(false);
    });

    it('never overwrites a real attempt with replayable training state', async () => {
        const elements = createElements();
        const saved = [];
        const host = createLocalOrbitHost({
            elements,
            onAttemptSave: (attempt) => saved.push(attempt),
            gameFactory: async (options) => {
                options.onReady();
                return {
                    destroy() {}, setAction() {},
                    getState: () => ({ phase: 'approach', elapsedSeconds: 9 })
                };
            }
        });
        await host.open({
            contract: { id: 'iss-delivery' }, missionId: 'iss-docking', trainingMode: true
        });

        elements.close.emit('click');
        expect(elements.leaveConfirm.hidden).toBe(true);
        elements.leaveSave.emit('click');

        expect(saved).toEqual([]);
        expect(elements.dialog.open).toBe(false);
    });

    it('restores a saved simulation and can clear it before restarting', async () => {
        const elements = createElements();
        const profiles = [];
        const cleared = [];
        const host = createLocalOrbitHost({
            elements,
            onAttemptClear: (contractId) => cleared.push(contractId),
            gameFactory: async (options) => {
                profiles.push(options.profile);
                options.onReady();
                return { destroy() {}, setAction() {}, getState: () => ({ phase: 'approach', elapsedSeconds: 2 }) };
            }
        });

        await host.open({
            contract: { id: 'iss-delivery' }, missionId: 'iss-docking',
            initialSimulation: { phase: 'approach', elapsedSeconds: 12, position: { x: -2, y: 0 } }
        });
        expect(profiles[0].initialState.elapsedSeconds).toBe(12);
        elements.close.emit('click');
        elements.leaveRestart.emit('click');
        await Promise.resolve();

        expect(cleared).toEqual(['iss-delivery']);
        expect(profiles.at(-1).initialState).not.toHaveProperty('elapsedSeconds', 12);
        expect(elements.dialog.open).toBe(true);
    });
});
