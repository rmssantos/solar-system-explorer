function movementThreshold(pointerType) {
    return pointerType === 'touch' ? 16 : 7;
}

export function createStageSelectionGesture() {
    const activePointerIds = new Set();
    let candidate = null;
    let suppressSelection = false;

    function resetSuppressionWhenIdle() {
        if (activePointerIds.size === 0) suppressSelection = false;
    }

    function pointerDown(event) {
        activePointerIds.add(event.pointerId);
        if (activePointerIds.size > 1) {
            candidate = null;
            suppressSelection = true;
            return;
        }
        if (suppressSelection) return;
        candidate = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            moved: false,
            threshold: movementThreshold(event.pointerType)
        };
    }

    function pointerMove(event) {
        if (candidate?.id !== event.pointerId) return false;
        candidate.moved ||= Math.hypot(
            event.clientX - candidate.x,
            event.clientY - candidate.y
        ) > candidate.threshold;
        return candidate.moved;
    }

    function pointerUp(event) {
        const shouldSelect = !suppressSelection
            && candidate?.id === event.pointerId
            && !candidate.moved;
        activePointerIds.delete(event.pointerId);
        if (candidate?.id === event.pointerId) candidate = null;
        resetSuppressionWhenIdle();
        return shouldSelect;
    }

    function pointerCancel(event) {
        suppressSelection = true;
        activePointerIds.delete(event.pointerId);
        if (candidate?.id === event.pointerId) candidate = null;
        resetSuppressionWhenIdle();
    }

    function reset() {
        activePointerIds.clear();
        candidate = null;
        suppressSelection = false;
    }

    return Object.freeze({ pointerDown, pointerMove, pointerUp, pointerCancel, reset });
}
