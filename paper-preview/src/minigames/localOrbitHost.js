import { getOrbitalMissionProfile } from './orbitalMissionProfiles.js';

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
 *   onComplete?: () => void,
 *   onClose?: () => void
 * }} options
 */
export function createLocalOrbitHost({
    root = globalThis.document,
    elements = queryElements(root),
    gameFactory = defaultGameFactory,
    messages = {},
    onComplete = () => {},
    onClose = () => {}
} = {}) {
    let game = null;
    let openOptions = {};
    let completed = false;
    let latestTelemetry = null;
    let loadGeneration = 0;
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
        if (openOptions.profile?.retryEvents.includes(event)) {
            elements.guidance.textContent = openOptions.profile?.retry ?? messages.retry ?? elements.guidance.textContent;
            return;
        }
        if (event !== openOptions.profile?.completionEvent || completed) return;
        completed = true;
        elements.result.hidden = false;
        onComplete();
    }

    async function startGame() {
        const generation = ++loadGeneration;
        game?.destroy?.();
        game = null;
        elements.loading.hidden = false;
        elements.error.hidden = true;
        try {
            const created = await gameFactory({
                parent: elements.stage,
                language: openOptions.language ?? 'pt',
                onReady: () => { if (generation === loadGeneration) elements.loading.hidden = true; },
                onTelemetry: updateTelemetry,
                onEvent: handleGameEvent,
                profile: openOptions.profile
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
            if (control.dataset.dockingAction === 'stabilize') {
                control.textContent = profile.centerControl;
                control.setAttribute?.('aria-label', profile.centerControl);
            }
        }
        if (!elements.dialog.open) elements.dialog.showModal();
        await startGame();
    }

    function close() {
        loadGeneration += 1;
        game?.destroy?.();
        game = null;
        if (elements.dialog.open) elements.dialog.close();
        onClose();
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
    listen(elements.close, 'click', close);
    listen(elements.finish, 'click', close);
    listen(elements.retry, 'click', () => { startGame(); });
    listen(elements.dialog, 'cancel', (event) => { event.preventDefault(); close(); });

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

    return Object.freeze({ open, close, destroy, updateTelemetry, getState, advanceTime });
}
