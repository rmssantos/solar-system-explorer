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
    upButton,
    downButton,
    boostButton
}) {
    const pressedKeys = new Set();
    const joystickIntent = { x: 0, y: 0 };
    const lookDelta = { yaw: 0, pitch: 0 };
    const mobileIntent = { up: false, down: false, boost: false };
    const holdCleanup = [];
    let enabled = true;
    let joystickPointerId = null;
    let lookPointerId = null;
    let lookPrevious = { x: 0, y: 0 };

    function resetJoystick() {
        joystickPointerId = null;
        joystickIntent.x = 0;
        joystickIntent.y = 0;
        joystickKnob.style.transform = 'translate(0px, 0px)';
        joystick.classList.remove('is-active');
    }

    function updateJoystick(event) {
        const bounds = joystick.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const radius = bounds.width * 0.34;
        const intent = normalizeJoystick(event.clientX - centerX, event.clientY - centerY, radius);
        joystickIntent.x = intent.x;
        joystickIntent.y = -intent.y;
        joystickKnob.style.transform = `translate(${intent.x * radius}px, ${intent.y * radius}px)`;
    }

    function handleJoystickDown(event) {
        if (!enabled || joystickPointerId !== null) return;
        event.preventDefault();
        joystickPointerId = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        joystick.classList.add('is-active');
        updateJoystick(event);
    }

    function handleJoystickMove(event) {
        if (event.pointerId !== joystickPointerId) return;
        event.preventDefault();
        updateJoystick(event);
    }

    function handleJoystickUp(event) {
        if (event.pointerId !== joystickPointerId) return;
        event.preventDefault();
        resetJoystick();
    }

    function handleLookDown(event) {
        if (!enabled || event.button !== 0 || event.target.closest('button, dialog, .flight-joystick, .flight-actions')) return;
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

    function bindHold(button, key) {
        const begin = (event) => {
            if (!enabled) return;
            event.preventDefault();
            mobileIntent[key] = true;
            button.setPointerCapture(event.pointerId);
            button.classList.add('is-active');
        };
        const end = (event) => {
            event.preventDefault();
            mobileIntent[key] = false;
            button.classList.remove('is-active');
        };
        button.addEventListener('pointerdown', begin);
        button.addEventListener('pointerup', end);
        button.addEventListener('pointercancel', end);
        holdCleanup.push(() => {
            button.removeEventListener('pointerdown', begin);
            button.removeEventListener('pointerup', end);
            button.removeEventListener('pointercancel', end);
        });
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
        const vertical = Number(pressedKeys.has('Space') || mobileIntent.up)
            - Number(pressedKeys.has('ControlLeft') || pressedKeys.has('ControlRight') || mobileIntent.down);
        const roll = Number(pressedKeys.has('KeyR')) - Number(pressedKeys.has('KeyF'));
        const combinedStrafe = strafe + joystickIntent.x;
        const combinedForward = forward + joystickIntent.y;
        const planarLength = Math.hypot(combinedStrafe, combinedForward);
        const planarScale = planarLength > 1 ? 1 / planarLength : 1;
        const sample = {
            forward: combinedForward * planarScale,
            strafe: combinedStrafe * planarScale,
            vertical,
            yawDelta: lookDelta.yaw,
            pitchDelta: lookDelta.pitch,
            roll,
            boost: pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight') || mobileIntent.boost,
            brake: pressedKeys.has('KeyX')
        };
        lookDelta.yaw = 0;
        lookDelta.pitch = 0;
        return sample;
    }

    function reset() {
        pressedKeys.clear();
        mobileIntent.up = false;
        mobileIntent.down = false;
        mobileIntent.boost = false;
        upButton.classList.remove('is-active');
        downButton.classList.remove('is-active');
        boostButton.classList.remove('is-active');
        resetJoystick();
    }

    function setEnabled(nextEnabled) {
        enabled = nextEnabled;
        if (!enabled) reset();
    }

    bindHold(upButton, 'up');
    bindHold(downButton, 'down');
    bindHold(boostButton, 'boost');
    joystick.addEventListener('pointerdown', handleJoystickDown);
    joystick.addEventListener('pointermove', handleJoystickMove);
    joystick.addEventListener('pointerup', handleJoystickUp);
    joystick.addEventListener('pointercancel', handleJoystickUp);
    stage.addEventListener('pointerdown', handleLookDown);
    stage.addEventListener('pointermove', handleLookMove);
    stage.addEventListener('pointerup', handleLookUp);
    stage.addEventListener('pointercancel', handleLookUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', reset);

    function destroy() {
        holdCleanup.forEach((cleanup) => cleanup());
        joystick.removeEventListener('pointerdown', handleJoystickDown);
        joystick.removeEventListener('pointermove', handleJoystickMove);
        joystick.removeEventListener('pointerup', handleJoystickUp);
        joystick.removeEventListener('pointercancel', handleJoystickUp);
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
