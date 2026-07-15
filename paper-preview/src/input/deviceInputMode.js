const POINTER_KEYS = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyF', 'KeyV', 'KeyX',
    'Space', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight',
    'Equal', 'Minus', 'NumpadAdd', 'NumpadSubtract'
]);

export function chooseInitialFlightInputMode({
    primaryCoarse = false,
    hoverCapable = false,
    maxTouchPoints = 0
} = {}) {
    return primaryCoarse || (!hoverCapable && maxTouchPoints > 0) ? 'touch' : 'pointer';
}

export function createFlightInputModeController({
    root = globalThis.document?.documentElement,
    windowRef = globalThis.window,
    navigatorRef = globalThis.navigator
} = {}) {
    const setMode = (mode) => {
        if (root?.dataset) root.dataset.flightInput = mode;
        return mode;
    };
    const initialMode = chooseInitialFlightInputMode({
        primaryCoarse: windowRef?.matchMedia?.('(pointer: coarse)')?.matches ?? false,
        hoverCapable: windowRef?.matchMedia?.('(hover: hover)')?.matches ?? false,
        maxTouchPoints: Number(navigatorRef?.maxTouchPoints) || 0
    });
    setMode(initialMode);

    const handlePointerDown = (event) => {
        if (event.pointerType === 'touch' || event.pointerType === 'pen') setMode('touch');
        else if (event.pointerType === 'mouse') setMode('pointer');
    };
    const handleKeyDown = (event) => {
        if (POINTER_KEYS.has(event.code)) setMode('pointer');
    };
    windowRef?.addEventListener?.('pointerdown', handlePointerDown, true);
    windowRef?.addEventListener?.('keydown', handleKeyDown, true);

    return Object.freeze({
        get mode() { return root?.dataset?.flightInput ?? initialMode; },
        destroy() {
            windowRef?.removeEventListener?.('pointerdown', handlePointerDown, true);
            windowRef?.removeEventListener?.('keydown', handleKeyDown, true);
        }
    });
}
