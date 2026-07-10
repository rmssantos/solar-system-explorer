const CAMERA_LIMITS = Object.freeze({ yaw: 0.34, pitch: 0.18 });

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

export function createFlightInput({ stage, joystick, joystickKnob, onDepthLayer = (_direction) => {} }) {
    const pressedKeys = new Set();
    const joystickIntent = { x: 0, y: 0 };
    const cameraOrbit = { yaw: 0, pitch: 0 };
    let enabled = true;
    let joystickPointerId = null;
    let cameraPointerId = null;
    let cameraPrevious = { x: 0, y: 0 };

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

    function handleCameraDown(event) {
        if (!enabled || event.button !== 0 || event.target.closest('button, dialog, .flight-joystick')) return;
        cameraPointerId = event.pointerId;
        cameraPrevious = { x: event.clientX, y: event.clientY };
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-looking');
    }

    function handleCameraMove(event) {
        if (event.pointerId !== cameraPointerId) return;
        const deltaX = event.clientX - cameraPrevious.x;
        const deltaY = event.clientY - cameraPrevious.y;
        cameraPrevious = { x: event.clientX, y: event.clientY };
        cameraOrbit.yaw = clamp(cameraOrbit.yaw - deltaX * 0.0032, -CAMERA_LIMITS.yaw, CAMERA_LIMITS.yaw);
        cameraOrbit.pitch = clamp(cameraOrbit.pitch - deltaY * 0.0026, -CAMERA_LIMITS.pitch, CAMERA_LIMITS.pitch);
    }

    function handleCameraUp(event) {
        if (event.pointerId !== cameraPointerId) return;
        cameraPointerId = null;
        stage.classList.remove('is-looking');
    }

    function handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            pressedKeys.add(key);
            event.preventDefault();
        }
        if (!event.repeat && (key === 'q' || key === 'e')) {
            onDepthLayer(key === 'e' ? 1 : -1);
            event.preventDefault();
        }
    }

    function handleKeyUp(event) {
        pressedKeys.delete(event.key.toLowerCase());
    }

    function sample() {
        if (!enabled) return { moveX: 0, moveY: 0, cameraOrbit: { ...cameraOrbit } };
        const keyboardX = Number(pressedKeys.has('d') || pressedKeys.has('arrowright'))
            - Number(pressedKeys.has('a') || pressedKeys.has('arrowleft'));
        const keyboardY = Number(pressedKeys.has('w') || pressedKeys.has('arrowup'))
            - Number(pressedKeys.has('s') || pressedKeys.has('arrowdown'));
        const combinedX = keyboardX + joystickIntent.x;
        const combinedY = keyboardY + joystickIntent.y;
        const length = Math.hypot(combinedX, combinedY);
        const scale = length > 1 ? 1 / length : 1;
        return {
            moveX: combinedX * scale,
            moveY: combinedY * scale,
            cameraOrbit: { ...cameraOrbit }
        };
    }

    function reset() {
        pressedKeys.clear();
        resetJoystick();
    }

    function setEnabled(nextEnabled) {
        enabled = nextEnabled;
        if (!enabled) reset();
    }

    joystick.addEventListener('pointerdown', handleJoystickDown);
    joystick.addEventListener('pointermove', handleJoystickMove);
    joystick.addEventListener('pointerup', handleJoystickUp);
    joystick.addEventListener('pointercancel', handleJoystickUp);
    stage.addEventListener('pointerdown', handleCameraDown);
    stage.addEventListener('pointermove', handleCameraMove);
    stage.addEventListener('pointerup', handleCameraUp);
    stage.addEventListener('pointercancel', handleCameraUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', reset);

    function destroy() {
        joystick.removeEventListener('pointerdown', handleJoystickDown);
        joystick.removeEventListener('pointermove', handleJoystickMove);
        joystick.removeEventListener('pointerup', handleJoystickUp);
        joystick.removeEventListener('pointercancel', handleJoystickUp);
        stage.removeEventListener('pointerdown', handleCameraDown);
        stage.removeEventListener('pointermove', handleCameraMove);
        stage.removeEventListener('pointerup', handleCameraUp);
        stage.removeEventListener('pointercancel', handleCameraUp);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('blur', reset);
    }

    return { sample, reset, setEnabled, destroy };
}
