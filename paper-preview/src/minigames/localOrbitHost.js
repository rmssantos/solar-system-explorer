import { getOrbitalMissionProfile } from './orbitalMissionProfiles.js';
import { getMissionEventCue } from '../audio/missionAudio.js';

function queryElements(root) {
    return {
        dialog: root.querySelector('#local-orbit-mission'),
        stage: root.querySelector('#local-orbit-stage'),
        loading: root.querySelector('#local-orbit-loading'),
        error: root.querySelector('#local-orbit-error'),
        result: root.querySelector('#local-orbit-result'),
        guidance: root.querySelector('#docking-guidance'),
        distance: root.querySelector('#docking-distance'),
        speed: root.querySelector('#docking-speed'),
        alignment: root.querySelector('#docking-alignment'),
        metricLabels: [...root.querySelectorAll('.docking-instruments small')],
        keyboardHint: root.querySelector('.docking-keyboard-hint'),
        kicker: root.querySelector('.local-orbit-kicker'),
        title: root.querySelector('#local-orbit-title'),
        playfield: root.querySelector('.local-orbit-playfield'),
        resultTitle: root.querySelector('#local-orbit-result strong'),
        resultScience: root.querySelector('#local-orbit-result p'),
        close: root.querySelector('#local-orbit-close'),
        finish: root.querySelector('#local-orbit-finish'),
        retry: root.querySelector('#local-orbit-load-retry'),
        leaveConfirm: root.querySelector('#local-orbit-leave-confirm'),
        leaveContinue: root.querySelector('#local-orbit-leave-continue'),
        leaveSave: root.querySelector('#local-orbit-leave-save'),
        leaveRestart: root.querySelector('#local-orbit-leave-restart'),
        training: root.querySelector('#local-orbit-training'),
        trainingTitle: root.querySelector('#local-orbit-training-title'),
        trainingStep: root.querySelector('#local-orbit-training-step'),
        trainingNext: root.querySelector('#local-orbit-training-next'),
        trainingSkip: root.querySelector('#local-orbit-training-skip'),
        controls: [...root.querySelectorAll('[data-docking-action]')]
    };
}

async function defaultGameFactory(options) {
    const { createOrbitalMissionGame } = await import('./createOrbitalMissionGame.js');
    return createOrbitalMissionGame(options);
}

function setSafetyClass(element, safe) {
    element.classList.toggle('is-safe', safe);
    element.classList.toggle('is-warning', !safe);
}

function formatMetric(metric, telemetry) {
    const value = Number(telemetry[metric.field] ?? 0);
    if (metric.format === 'distance') return `${value.toFixed(1)} m`;
    if (metric.format === 'speed') return `${value.toFixed(2)} m/s`;
    if (metric.format === 'degrees') return `${value.toFixed(1)}°`;
    if (metric.format === 'collection') return `${Math.round(value)}/${Math.round(telemetry.total ?? 0)}`;
    if (metric.format === 'shield') return `${Math.round(value)}/3`;
    if (metric.format === 'percent') return `${Math.round(value * 100)}%`;
    return String(value);
}

/**
 * @param {{
 *   root?: Document,
 *   elements?: ReturnType<typeof queryElements>,
 *   gameFactory?: (options: {
 *     parent: HTMLElement,
 *     language: string,
 *     profile: ReturnType<typeof getOrbitalMissionProfile>,
 *     onReady: () => void,
 *     onTelemetry: (telemetry: { distance: number, relativeSpeed: number, alignmentDegrees: number, corridorSafe: boolean, speedSafe: boolean, alignmentSafe: boolean }) => void,
 *     onEvent: (event: string) => void
 *   }) => Promise<{
 *     destroy?: () => void,
 *     setAction?: (action: string, active: boolean) => unknown,
 *     getState?: () => object | null,
 *     advanceTime?: (milliseconds: number) => void
 *   }>,
 *   messages?: { retry?: string, guidance?: string },
 *   onComplete?: (context: object) => void,
 *   onClose?: () => void,
 *   onAttemptSave?: (attempt: { contractId: string, missionId: string, simulation: object }) => void,
 *   onAttemptClear?: (contractId: string) => void
 *   onTrainingComplete?: (gameplay: string) => void
 *   onAudioCue?: (cue: string) => void
 * }} options
 */
export function createLocalOrbitHost({
    root = globalThis.document,
    elements = queryElements(root),
    gameFactory = defaultGameFactory,
    messages = {},
    onComplete = (_context) => {},
    onClose = () => {},
    onAttemptSave = () => {},
    onAttemptClear = () => {},
    onTrainingComplete = () => {},
    onAudioCue = () => {}
} = {}) {
    let game = null;
    let openOptions = {};
    let completed = false;
    let latestTelemetry = null;
    let loadGeneration = 0;
    let trainingStepIndex = 0;
    const listeners = [];

    function listen(element, type, handler) {
        element.addEventListener(type, handler);
        listeners.push([element, type, handler]);
    }

    function updateTelemetry(telemetry) {
        latestTelemetry = { ...telemetry };
        const values = [elements.distance, elements.speed, elements.alignment];
        const metrics = openOptions.profile?.metrics ?? [];
        metrics.forEach((metric, index) => {
            values[index].textContent = formatMetric(metric, telemetry);
            setSafetyClass(values[index], Boolean(telemetry[metric.safeField]));
        });
    }

    function handleGameEvent(event) {
        const cue = getMissionEventCue(event);
        if (cue) onAudioCue(cue);
        if (openOptions.profile?.retryEvents.includes(event)) {
            elements.guidance.textContent = openOptions.profile?.retry ?? messages.retry ?? elements.guidance.textContent;
            return;
        }
        if (event !== openOptions.profile?.completionEvent || completed) return;
        completed = true;
        elements.result.hidden = false;
        onComplete(openOptions);
    }

    function renderTrainingStep() {
        const steps = openOptions.profile?.tutorialSteps ?? [];
        if (!elements.training || steps.length === 0) return;
        elements.trainingTitle.textContent = openOptions.profile.tutorialTitle;
        elements.trainingStep.textContent = steps[trainingStepIndex];
        elements.trainingNext.textContent = trainingStepIndex === steps.length - 1
            ? (openOptions.language === 'en' ? 'Start practice' : 'Começar treino')
            : (openOptions.language === 'en' ? 'Next' : 'Seguinte');
    }

    function finishTraining() {
        if (!elements.training || elements.training.hidden) return;
        elements.training.hidden = true;
        onTrainingComplete(openOptions.profile?.gameplay);
    }

    async function startGame({ restore = true } = {}) {
        const generation = ++loadGeneration;
        game?.destroy?.();
        game = null;
        elements.loading.hidden = false;
        elements.error.hidden = true;
        try {
            const initialState = restore && openOptions.initialSimulation
                ? openOptions.initialSimulation
                : openOptions.profile.initialState;
            const created = await gameFactory({
                parent: elements.stage,
                language: openOptions.language ?? 'pt',
                onReady: () => { if (generation === loadGeneration) elements.loading.hidden = true; },
                onTelemetry: updateTelemetry,
                onEvent: handleGameEvent,
                profile: { ...openOptions.profile, initialState }
            });
            if (generation !== loadGeneration) {
                created?.destroy?.();
                return;
            }
            game = created;
            elements.loading.hidden = true;
        } catch {
            if (generation !== loadGeneration) return;
            elements.loading.hidden = true;
            elements.error.hidden = false;
        }
    }

    async function open(options = {}) {
        const profile = getOrbitalMissionProfile(options.missionId, options.language);
        openOptions = { ...options, profile };
        completed = false;
        latestTelemetry = null;
        elements.result.hidden = true;
        elements.error.hidden = true;
        elements.leaveConfirm && (elements.leaveConfirm.hidden = true);
        trainingStepIndex = 0;
        if (elements.training) {
            elements.training.hidden = !options.showTraining;
            if (options.showTraining) renderTrainingStep();
        }
        elements.kicker.textContent = profile.kicker;
        elements.title.textContent = profile.title;
        elements.resultTitle.textContent = profile.success;
        elements.resultScience.textContent = profile.science;
        elements.playfield.setAttribute?.('aria-label', profile.playfield);
        elements.guidance.textContent = profile.guidance ?? messages.guidance ?? elements.guidance.textContent;
        elements.keyboardHint && (elements.keyboardHint.textContent = profile.keyboardHint);
        profile.metrics.forEach((metric, index) => {
            if (elements.metricLabels?.[index]) elements.metricLabels[index].textContent = metric.label;
        });
        const visibleControls = new Set(profile.controls);
        for (const control of elements.controls) {
            control.hidden = !visibleControls.has(control.dataset.dockingAction);
            const controlLabel = profile.controlLabels?.[control.dataset.dockingAction];
            if (controlLabel) control.setAttribute?.('aria-label', controlLabel);
            if (control.dataset.dockingAction === 'stabilize') control.textContent = profile.centerControl;
        }
        if (!elements.dialog.open) elements.dialog.showModal();
        await startGame();
    }

    function closeImmediately() {
        loadGeneration += 1;
        game?.destroy?.();
        game = null;
        if (elements.dialog.open) elements.dialog.close();
        onClose();
    }

    function requestClose() {
        const simulation = game?.getState?.() ?? null;
        if (!completed && simulation && elements.leaveConfirm) {
            elements.leaveConfirm.hidden = false;
            return;
        }
        closeImmediately();
    }

    for (const control of elements.controls) {
        const action = control.dataset.dockingAction;
        const setActive = (active) => {
            control.classList.toggle('is-active', active);
            game?.setAction?.(action, active);
        };
        listen(control, 'pointerdown', (event) => { event.preventDefault(); setActive(true); });
        for (const type of ['pointerup', 'pointercancel', 'pointerleave']) {
            listen(control, type, () => setActive(false));
        }
    }
    listen(elements.close, 'click', requestClose);
    listen(elements.finish, 'click', closeImmediately);
    listen(elements.retry, 'click', () => { startGame(); });
    listen(elements.dialog, 'cancel', (event) => { event.preventDefault(); requestClose(); });
    if (elements.leaveContinue) listen(elements.leaveContinue, 'click', () => { elements.leaveConfirm.hidden = true; });
    if (elements.leaveSave) listen(elements.leaveSave, 'click', () => {
        const simulation = game?.getState?.() ?? null;
        if (simulation && openOptions.contract?.id) {
            onAttemptSave({
                contractId: openOptions.contract.id,
                missionId: openOptions.profile.id,
                simulation
            });
        }
        closeImmediately();
    });
    if (elements.leaveRestart) listen(elements.leaveRestart, 'click', () => {
        if (openOptions.contract?.id) onAttemptClear(openOptions.contract.id);
        openOptions = { ...openOptions, initialSimulation: null };
        elements.leaveConfirm.hidden = true;
        startGame({ restore: false });
    });
    if (elements.trainingNext) listen(elements.trainingNext, 'click', () => {
        const steps = openOptions.profile?.tutorialSteps ?? [];
        if (trainingStepIndex >= steps.length - 1) {
            finishTraining();
            return;
        }
        trainingStepIndex += 1;
        renderTrainingStep();
    });
    if (elements.trainingSkip) listen(elements.trainingSkip, 'click', finishTraining);

    function destroy() {
        loadGeneration += 1;
        game?.destroy?.();
        game = null;
        for (const [element, type, handler] of listeners) element.removeEventListener(type, handler);
        listeners.length = 0;
    }

    function getState() {
        return {
            missionId: openOptions.profile?.id ?? null,
            completed,
            telemetry: latestTelemetry ? { ...latestTelemetry } : null,
            simulation: game?.getState?.() ?? null
        };
    }

    function advanceTime(milliseconds) {
        game?.advanceTime?.(milliseconds);
    }

    return Object.freeze({ open, close: requestClose, destroy, updateTelemetry, getState, advanceTime });
}
