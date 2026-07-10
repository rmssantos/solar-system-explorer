import { PLANETS, closeNotebook, createPreviewState, explorePlanet } from './state.js';
import { createFlightState, stepFlight } from './flightSimulation.js';
import { createFlightInput } from './flightInput.js';
import { createPaperScene } from './scene/createPaperScene.js';
import { createPreviewUI } from './ui.js';

const stage = document.querySelector('#paper-stage');
let previewState = createPreviewState();
let flightState = createFlightState();
let deterministicMode = false;
let lastFrameTime = performance.now();
let lastUiSignature = '';
let lastInput = {
    forward: 0,
    strafe: 0,
    vertical: 0,
    yawDelta: 0,
    pitchDelta: 0,
    roll: 0,
    boost: false,
    brake: false
};

const paperScene = createPaperScene(stage);

function handleExplore() {
    if (previewState.notebook.open || !flightState.nearbyPlanetKey) return;
    previewState = explorePlanet(previewState, flightState.nearbyPlanetKey);
    flightInput.setEnabled(false);
    syncUI(true);
}

function handleCloseNotebook() {
    if (!previewState.notebook.open) return;
    previewState = closeNotebook(previewState);
    flightInput.setEnabled(true);
    syncUI(true);
}

const previewUI = createPreviewUI({
    onExplore: handleExplore,
    onCloseNotebook: handleCloseNotebook
});

const flightInput = createFlightInput({
    stage,
    joystick: previewUI.elements.joystick,
    joystickKnob: previewUI.elements.joystickKnob,
    upButton: previewUI.elements.upButton,
    downButton: previewUI.elements.downButton,
    boostButton: previewUI.elements.boostButton
});

function syncUI(force = false) {
    const signature = [
        flightState.nearbyPlanetKey ?? 'none',
        previewState.notebook.open,
        previewState.notebook.planetKey ?? 'none',
        previewState.missionComplete
    ].join(':');
    if (!force && signature === lastUiSignature) return;
    previewUI.update(previewState, { flightState });
    lastUiSignature = signature;
}

function step(seconds) {
    lastInput = {
        ...flightInput.sample(),
        movementBasis: paperScene.getNavigationBasis()
    };
    if (!previewState.notebook.open) flightState = stepFlight(flightState, lastInput, seconds);
    paperScene.update(seconds);
    paperScene.setFlightSnapshot(flightState, seconds);
    syncUI();
}

function frame(timestamp) {
    if (!deterministicMode) {
        const delta = Math.min(0.1, Math.max(0, (timestamp - lastFrameTime) / 1000));
        step(delta);
    }
    lastFrameTime = timestamp;
    paperScene.render();
    window.requestAnimationFrame(frame);
}

async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
}

function handleKeydown(event) {
    if (event.code === 'KeyG') {
        event.preventDefault();
        toggleFullscreen().catch(() => {});
        return;
    }
    if (event.key === 'Escape' && previewState.notebook.open) {
        event.preventDefault();
        handleCloseNotebook();
        return;
    }
    if (event.key === 'Enter' && !previewState.notebook.open) {
        event.preventDefault();
        handleExplore();
    }
}

function roundVector(vector) {
    return Object.fromEntries(
        Object.entries(vector).map(([key, value]) => [key, Number(value.toFixed(3))])
    );
}

window.render_game_to_text = () => {
    const nearbyPlanet = PLANETS.find((planet) => planet.key === flightState.nearbyPlanetKey) ?? null;
    return JSON.stringify({
        coordinateSystem: '3D paper flight: yaw 0 faces -Z; +X right, +Y up, +Z behind. Movement is camera-relative.',
        mode: previewState.notebook.open ? 'notebook' : 'free-flight-360',
        ship: {
            position: roundVector(flightState.position),
            velocity: roundVector(flightState.velocity),
            orientation: roundVector(flightState.orientation),
            speed: Number(Math.hypot(
                flightState.velocity.x,
                flightState.velocity.y,
                flightState.velocity.z
            ).toFixed(3)),
            nearbyPlanet: nearbyPlanet?.key ?? null
        },
        input: {
            forward: Number(lastInput.forward.toFixed(3)),
            strafe: Number(lastInput.strafe.toFixed(3)),
            vertical: Number(lastInput.vertical.toFixed(3)),
            roll: Number(lastInput.roll.toFixed(3)),
            boost: lastInput.boost,
            brake: lastInput.brake
        },
        interaction: nearbyPlanet ? `Explorar ${nearbyPlanet.name}` : null,
        objective: {
            target: previewState.objectiveTarget,
            complete: previewState.missionComplete,
            label: previewState.missionComplete ? 'Missão cumprida' : 'Chega a Saturno'
        },
        notebook: { ...previewState.notebook },
        scene: paperScene.getState()
    });
};

window.advanceTime = (milliseconds) => {
    deterministicMode = true;
    const steps = Math.max(1, Math.round(milliseconds / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) step(1 / 60);
    paperScene.render();
};

window.__paperPreview = {
    getState: () => ({ preview: { ...previewState }, flight: { ...flightState }, scene: paperScene.getState() }),
    explore: handleExplore,
    closeNotebook: handleCloseNotebook
};

window.addEventListener('keydown', handleKeydown);
document.addEventListener('fullscreenchange', paperScene.resize);
window.addEventListener('beforeunload', () => {
    flightInput.destroy();
    previewUI.destroy();
    paperScene.destroy();
}, { once: true });

paperScene.update(0);
paperScene.setFlightSnapshot(flightState, 0.1);
syncUI(true);
previewUI.markReady();
paperScene.render();
window.requestAnimationFrame(frame);
