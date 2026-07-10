import { PLANETS, closeNotebook, createPreviewState, exploreActive, navigate } from './state.js';
import { createPaperScene } from './scene/createPaperScene.js';
import { createPreviewUI } from './ui.js';

const stage = document.querySelector('#paper-stage');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let state = createPreviewState();
let deterministicMode = false;
let lastFrameTime = performance.now();
let lastTransitionState = false;

const paperScene = createPaperScene(stage);

function transitionIsActive() {
    return paperScene.getState().transitionActive;
}

function handleNavigate(direction) {
    if (state.notebook.open || transitionIsActive()) return;
    const nextState = navigate(state, direction);
    if (nextState.activeIndex === state.activeIndex) return;
    state = nextState;
    paperScene.setActivePlanet(state.activeIndex, { reducedMotion });
    previewUI.update(state, { traveling: transitionIsActive() });
    lastTransitionState = transitionIsActive();
}

function handleExplore() {
    if (transitionIsActive() || state.notebook.open) return;
    state = exploreActive(state);
    previewUI.update(state);
}

function handleCloseNotebook() {
    if (!state.notebook.open) return;
    state = closeNotebook(state);
    previewUI.update(state);
}

const previewUI = createPreviewUI({
    onNavigate: handleNavigate,
    onExplore: handleExplore,
    onCloseNotebook: handleCloseNotebook
});

function syncTransitionUI() {
    const traveling = transitionIsActive();
    if (traveling !== lastTransitionState) {
        previewUI.update(state, { traveling });
        lastTransitionState = traveling;
    }
}

function step(seconds) {
    paperScene.update(seconds);
    syncTransitionUI();
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
    if (document.fullscreenElement) {
        await document.exitFullscreen();
    } else {
        await document.documentElement.requestFullscreen();
    }
}

function handleKeydown(event) {
    if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFullscreen().catch(() => {});
        return;
    }

    if (state.notebook.open) {
        if (event.key === 'Escape') {
            event.preventDefault();
            handleCloseNotebook();
        }
        return;
    }

    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleNavigate(-1);
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNavigate(1);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        handleExplore();
    }
}

window.render_game_to_text = () => {
    const activePlanet = PLANETS[state.activeIndex];
    const sceneState = paperScene.getState();
    return JSON.stringify({
        coordinateSystem: 'Diorama coordinates: +x travels Sun → Earth → Saturn; +y is up; camera faces -z.',
        mode: state.notebook.open ? 'notebook' : (sceneState.transitionActive ? 'traveling' : 'exploring'),
        activePlanet: { index: state.activeIndex, key: activePlanet.key, name: activePlanet.name },
        navigation: {
            previousAvailable: state.activeIndex > 0 && !sceneState.transitionActive,
            nextAvailable: state.activeIndex < PLANETS.length - 1 && !sceneState.transitionActive
        },
        objective: {
            target: state.objectiveTarget,
            complete: state.missionComplete,
            label: state.missionComplete ? 'Missão cumprida' : 'Chega a Saturno'
        },
        notebook: { ...state.notebook },
        scene: sceneState
    });
};

window.advanceTime = (milliseconds) => {
    deterministicMode = true;
    const steps = Math.max(1, Math.round(milliseconds / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) step(1 / 60);
    paperScene.render();
};

window.__paperPreview = {
    getState: () => ({ ...state, scene: paperScene.getState() }),
    navigate: handleNavigate,
    explore: handleExplore,
    closeNotebook: handleCloseNotebook
};

window.addEventListener('keydown', handleKeydown);
document.addEventListener('fullscreenchange', paperScene.resize);
window.addEventListener('beforeunload', () => {
    previewUI.destroy();
    paperScene.destroy();
}, { once: true });

paperScene.setActivePlanet(state.activeIndex, { immediate: true });
previewUI.update(state);
previewUI.markReady();
paperScene.render();
window.requestAnimationFrame(frame);
