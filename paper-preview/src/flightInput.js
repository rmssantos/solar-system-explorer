function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function normalizeJoystick(deltaX, deltaY, radius, deadZone = 0.12) {
    const safeRadius = Math.max(1, radius);
    const distance = Math.hypot(deltaX, deltaY);
    const magnitude = Math.min(1, distance / safeRadius);
    if (magnitude < deadZone || distance === 0) return { x: 0, y: 0 };
    return {
        x: (deltaX / distance) * magnitude,
        y: (deltaY / distance) * magnitude
    };
}

export function createFlightInput({
    stage,
    joystick,
    joystickKnob,
    lookJoystick,
    lookJoystickKnob
}) {
    const pressedKeys = new Set();
    const joystickIntent = { x: 0, y: 0 };
    const lookJoystickIntent = { x: 0, y: 0 };
    const lookDelta = { yaw: 0, pitch: 0 };
    const cleanup = [];
    let enabled = true;
    let lookPointerId = null;
    let lookPrevious = { x: 0, y: 0 };

    function bindStick(element, knob, intent, { invertY = false } = {}) {
        let pointerId = null;

        function resetStick() {
            pointerId = null;
            intent.x = 0;
            intent.y = 0;
            knob.style.transform = 'translate(0px, 0px)';
            element.classList.remove('is-active');
        }

        function update(event) {
            const bounds = element.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height / 2;
            const radius = Math.min(bounds.width, bounds.height) * 0.34;
            const normalized = normalizeJoystick(event.clientX - centerX, event.clientY - centerY, radius);
            intent.x = normalized.x;
            intent.y = invertY ? -normalized.y : normalized.y;
            knob.style.transform = `translate(${normalized.x * radius}px, ${normalized.y * radius}px)`;
        }

        function begin(event) {
            if (!enabled || pointerId !== null) return;
            event.preventDefault();
            event.stopPropagation();
            pointerId = event.pointerId;
            element.setPointerCapture(event.pointerId);
            element.classList.add('is-active');
            update(event);
        }

        function move(event) {
            if (event.pointerId !== pointerId) return;
            event.preventDefault();
            event.stopPropagation();
            update(event);
        }

        function end(event) {
            if (event.pointerId !== pointerId) return;
            event.preventDefault();
            event.stopPropagation();
            resetStick();
        }

        element.addEventListener('pointerdown', begin);
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerup', end);
        element.addEventListener('pointercancel', end);
        cleanup.push(() => {
            element.removeEventListener('pointerdown', begin);
            element.removeEventListener('pointermove', move);
            element.removeEventListener('pointerup', end);
            element.removeEventListener('pointercancel', end);
        });
        return resetStick;
    }

    const resetMovementStick = bindStick(joystick, joystickKnob, joystickIntent, { invertY: true });
    const resetLookStick = bindStick(lookJoystick, lookJoystickKnob, lookJoystickIntent);

    function handleLookDown(event) {
        if (!enabled || event.button !== 0 || event.target.closest('button, dialog, [data-flight-control]')) return;
        lookPointerId = event.pointerId;
        lookPrevious = { x: event.clientX, y: event.clientY };
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-looking');
    }

    function handleLookMove(event) {
        if (event.pointerId !== lookPointerId) return;
        const deltaX = event.clientX - lookPrevious.x;
        const deltaY = event.clientY - lookPrevious.y;
        lookPrevious = { x: event.clientX, y: event.clientY };
        lookDelta.yaw -= deltaX * 0.0032;
        lookDelta.pitch = clamp(lookDelta.pitch - deltaY * 0.0026, -0.7, 0.7);
    }

    function handleLookUp(event) {
        if (event.pointerId !== lookPointerId) return;
        lookPointerId = null;
        stage.classList.remove('is-looking');
    }

    function handleKeyDown(event) {
        if (!enabled) return;
        const code = event.code;
        if ([
            'KeyW', 'KeyA', 'KeyS', 'KeyD',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Space', 'ControlLeft', 'ControlRight',
            'ShiftLeft', 'ShiftRight', 'KeyR', 'KeyF', 'KeyX'
        ].includes(code)) {
            pressedKeys.add(code);
            event.preventDefault();
        }
    }

    function handleKeyUp(event) {
        pressedKeys.delete(event.code);
    }

    function sample() {
        if (!enabled) {
            lookDelta.yaw = 0;
            lookDelta.pitch = 0;
            return {
                forward: 0, strafe: 0, vertical: 0,
                yawDelta: 0, pitchDelta: 0, roll: 0,
                boost: false, brake: false
            };
        }
        const strafe = Number(pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight'))
            - Number(pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft'));
        const forward = Number(pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp'))
            - Number(pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown'));
        const vertical = Number(pressedKeys.has('Space'))
            - Number(pressedKeys.has('ControlLeft') || pressedKeys.has('ControlRight'));
        const keyboardRoll = Number(pressedKeys.has('KeyR')) - Number(pressedKeys.has('KeyF'));
        const combinedStrafe = strafe + joystickIntent.x;
        const combinedForward = forward + joystickIntent.y;
        const planarLength = Math.hypot(combinedStrafe, combinedForward);
        const planarScale = planarLength > 1 ? 1 / planarLength : 1;
        const current = {
            forward: combinedForward * planarScale,
            strafe: combinedStrafe * planarScale,
            vertical: clamp(vertical, -1, 1),
            yawDelta: lookDelta.yaw - (lookJoystickIntent.x * 0.032),
            pitchDelta: lookDelta.pitch - (lookJoystickIntent.y * 0.026),
            roll: clamp(keyboardRoll, -1, 1),
            boost: pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight'),
            brake: pressedKeys.has('KeyX')
        };
        lookDelta.yaw = 0;
        lookDelta.pitch = 0;
        return current;
    }

    function reset() {
        pressedKeys.clear();
        resetMovementStick();
        resetLookStick();
        lookPointerId = null;
        stage.classList.remove('is-looking');
    }

    function setEnabled(nextEnabled) {
        enabled = nextEnabled;
        if (!enabled) reset();
    }

    stage.addEventListener('pointerdown', handleLookDown);
    stage.addEventListener('pointermove', handleLookMove);
    stage.addEventListener('pointerup', handleLookUp);
    stage.addEventListener('pointercancel', handleLookUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', reset);

    function destroy() {
        cleanup.forEach((removeListeners) => removeListeners());
        stage.removeEventListener('pointerdown', handleLookDown);
        stage.removeEventListener('pointermove', handleLookMove);
        stage.removeEventListener('pointerup', handleLookUp);
        stage.removeEventListener('pointercancel', handleLookUp);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('blur', reset);
    }

    return { sample, reset, setEnabled, destroy };
}
