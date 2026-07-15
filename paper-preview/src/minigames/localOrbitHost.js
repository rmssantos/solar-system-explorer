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
        close: root.querySelector('#local-orbit-close'),
        finish: root.querySelector('#local-orbit-finish'),
        retry: root.querySelector('#local-orbit-load-retry'),
        controls: [...root.querySelectorAll('[data-docking-action]')]
    };
}

async function defaultGameFactory(options) {
    const { createDockingGame } = await import('./createDockingGame.js');
    return createDockingGame(options);
}

function setSafetyClass(element, safe) {
    element.classList.toggle('is-safe', safe);
    element.classList.toggle('is-warning', !safe);
}

/**
 * @param {{
 *   root?: Document,
 *   elements?: ReturnType<typeof queryElements>,
 *   gameFactory?: (options: {
 *     parent: HTMLElement,
 *     language: string,
 *     onReady: () => void,
 *     onTelemetry: (telemetry: { distance: number, relativeSpeed: number, alignmentDegrees: number, corridorSafe: boolean, speedSafe: boolean, alignmentSafe: boolean }) => void,
 *     onEvent: (event: string) => void
 *   }) => Promise<{ destroy?: () => void, setAction?: (action: string, active: boolean) => unknown }>,
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
    let loadGeneration = 0;
    const listeners = [];

    function listen(element, type, handler) {
        element.addEventListener(type, handler);
        listeners.push([element, type, handler]);
    }

    function updateTelemetry(telemetry) {
        elements.distance.textContent = `${telemetry.distance.toFixed(1)} m`;
        elements.speed.textContent = `${telemetry.relativeSpeed.toFixed(2)} m/s`;
        elements.alignment.textContent = `${telemetry.alignmentDegrees.toFixed(1)}°`;
        setSafetyClass(elements.distance, telemetry.corridorSafe);
        setSafetyClass(elements.speed, telemetry.speedSafe);
        setSafetyClass(elements.alignment, telemetry.alignmentSafe);
    }

    function handleGameEvent(event) {
        if (event === 'unsafe-contact') {
            elements.guidance.textContent = messages.retry ?? elements.guidance.textContent;
            return;
        }
        if (event !== 'docked' || completed) return;
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
                onEvent: handleGameEvent
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
        openOptions = options;
        completed = false;
        elements.result.hidden = true;
        elements.error.hidden = true;
        if (messages.guidance) elements.guidance.textContent = messages.guidance;
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

    return Object.freeze({ open, close, destroy, updateTelemetry });
}
