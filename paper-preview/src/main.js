import { closeNotebook, createPreviewState, explorePlanet } from './state.js';
import { createFlightState, stepFlight } from './flightSimulation.js';
import { createFlightInput } from './flightInput.js';
import { createPaperLearningCatalog } from './learning/learningCatalog.js';
import {
    answerLearningQuiz,
    retryLearningQuiz,
    selectLearningSection,
    setLearningDataEnvelope
} from './learning/learningState.js';
import { createPaperScene } from './scene/createPaperScene.js';
import { createPreviewUI } from './ui.js';
import { createSpaceDataService } from './data/spaceDataService.js';
import { projectEarthOrbit, propagateOmm } from './data/orbitPropagation.js';
import { SATELLITE_FALLBACKS } from './data/spaceFallbacks.js';
import { getWorldObject } from './world/worldCatalog.js';
import { chooseNearbyObject } from './world/proximity.js';
import { evaluateMissions } from './missions/missionSystem.js';
import { loadProgress, saveProgress } from './missions/progressStore.js';

const stage = document.querySelector('#paper-stage');
const learningCatalog = createPaperLearningCatalog('pt');
let previewState = createPreviewState(loadProgress());
let flightState = createFlightState();
let deterministicMode = false;
let lastFrameTime = performance.now();
let lastUiSignature = '';
let nearbyWorldObjectKey = null;
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
const spaceData = createSpaceDataService();
const NASA_SEARCH_TERMS = Object.freeze({
    sun: 'Sun solar observatory', mercury: 'Mercury planet', venus: 'Venus planet',
    earth: 'Earth full disk planet', mars: 'Mars planet', jupiter: 'Jupiter planet',
    saturn: 'Saturn planet', uranus: 'Uranus planet', neptune: 'Neptune planet',
    moon: 'Moon full disk', iss: 'International Space Station', hubble: 'Hubble Space Telescope',
    jwst: 'James Webb Space Telescope', 'voyager-1': 'Voyager spacecraft',
    'tesla-roadster': 'SpaceX Roadster Starman', halley: 'Halley comet', '67p': 'comet 67P'
});

function strongestStatus(envelopes) {
    if (envelopes.some((envelope) => envelope.status === 'live')) return 'live';
    if (envelopes.some((envelope) => envelope.status === 'cached')) return 'cached';
    return 'fallback';
}

async function hydrateLearningData(key) {
    if (previewState.learning.dataByObject[key]) return;
    const record = learningCatalog[key];
    const world = getWorldObject(key);
    if (!record || !world) return;
    const date = new Date().toISOString().slice(0, 10);
    const fallbackVector = {
        epoch: date,
        positionKm: { x: record.measurements.distanceMillionKm * 1_000_000, y: 0, z: 0 },
        distanceKm: record.measurements.distanceMillionKm * 1_000_000
    };
    const imagePromise = spaceData.getNasaImage(key, NASA_SEARCH_TERMS[key] ?? record.name, {
            title: `Fotografia incluída de ${record.name}`,
            imageUrl: record.localPhoto
        });
    const command = world.command ?? (world.key === 'tesla-roadster' ? world.source.command : null);
    if (!command) {
        const image = await imagePromise;
        previewState = {
            ...previewState,
            learning: setLearningDataEnvelope(previewState.learning, key, {
                status: image.status,
                source: world.source,
                updatedAt: image.updatedAt,
                data: {
                    summary: world.fact,
                    imageTitle: image.data.title,
                    imageUrl: image.data.imageUrl,
                    imageSourceName: image.source.name,
                    imageSourceUrl: image.source.url
                }
            })
        };
        syncUI(true);
        return;
    }
    const [vector, image] = await Promise.all([
        spaceData.getPlanetVector(key, command, date, fallbackVector),
        imagePromise
    ]);
    const distance = vector.data.distanceKm / 1_000_000;
    const envelope = {
        status: strongestStatus([vector, image]),
        source: vector.source,
        updatedAt: vector.updatedAt,
        data: {
            summary: `${record.name} está hoje a cerca de ${distance.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} milhões de quilómetros do Sol. A posição é uma efeméride calculada pelo JPL; “ao vivo” não significa um sinal GPS instantâneo.`,
            positionKm: vector.data.positionKm,
            imageTitle: image.data.title,
            imageUrl: image.data.imageUrl,
            imageSourceName: image.source.name,
            imageSourceUrl: image.source.url
        }
    };
    previewState = {
        ...previewState,
        learning: setLearningDataEnvelope(previewState.learning, key, envelope)
    };
    syncUI(true);
}

async function hydrateTrackedObjects() {
    const earth = getWorldObject('earth');
    await Promise.all(['iss', 'hubble'].map(async (key) => {
        const object = getWorldObject(key);
        const envelope = await spaceData.getSatelliteElements(
            object.source.command,
            SATELLITE_FALLBACKS[key]
        );
        const propagated = propagateOmm(envelope.data, new Date());
        if (!propagated) return;
        const offset = projectEarthOrbit(propagated.positionKm, object.orbitRadius);
        paperScene.setWorldObjectPosition(key, {
            x: earth.anchor[0] + offset.x,
            y: earth.anchor[1] + offset.y,
            z: earth.anchor[2] + offset.z
        });
    }));

    const date = new Date().toISOString().slice(0, 10);
    const roadster = getWorldObject('tesla-roadster');
    const vector = await spaceData.getPlanetVector(
        roadster.key,
        roadster.source.command,
        date,
        { positionKm: { x: 140_000_000, y: 80_000_000, z: 2_000_000 }, distanceKm: 161_000_000 }
    );
    const position = vector.data.positionKm;
    const length = Math.hypot(position.x, position.y, position.z) || 1;
    const compressedRadius = 30 + Math.min(45, (vector.data.distanceKm / 149_597_870.7) * 22);
    paperScene.setWorldObjectPosition('tesla-roadster', {
        x: (position.x / length) * compressedRadius,
        y: (position.z / length) * compressedRadius * 0.45,
        z: (position.y / length) * compressedRadius
    });
}

async function hydrateDailySky() {
    const envelope = await spaceData.getApod({
        title: 'O céu de hoje',
        explanation: 'Imagem astronómica incluída para o modo offline.',
        date: new Date().toISOString().slice(0, 10),
        imageUrl: '/learning/sun.jpg'
    });
    previewUI.setApod(envelope);
}

function handleExplore() {
    const nearbyKey = chooseNearbyObject(flightState.nearbyPlanetKey, nearbyWorldObjectKey);
    if (previewState.notebook.open || !nearbyKey) return;
    previewState = explorePlanet(previewState, nearbyKey);
    saveProgress(previewState.learning);
    flightInput.setEnabled(false);
    syncUI(true);
    hydrateLearningData(nearbyKey).catch(() => {});
}

function handleCloseNotebook() {
    if (!previewState.notebook.open) return;
    previewState = closeNotebook(previewState);
    flightInput.setEnabled(true);
    syncUI(true);
}

function handleSelectSection(section) {
    previewState = {
        ...previewState,
        learning: selectLearningSection(previewState.learning, section)
    };
    syncUI(true);
}

function currentLearningQuiz() {
    const record = learningCatalog[previewState.learning.objectKey];
    return record?.quizzes[0] ?? null;
}

function handleAnswerQuiz(selectedIndex) {
    const quiz = currentLearningQuiz();
    previewState = {
        ...previewState,
        learning: answerLearningQuiz(previewState.learning, quiz, selectedIndex)
    };
    saveProgress(previewState.learning);
    syncUI(true);
}

function handleRetryQuiz() {
    previewState = {
        ...previewState,
        learning: retryLearningQuiz(previewState.learning)
    };
    syncUI(true);
}

const previewUI = createPreviewUI({
    learningCatalog,
    onExplore: handleExplore,
    onCloseNotebook: handleCloseNotebook,
    onSelectSection: handleSelectSection,
    onAnswerQuiz: handleAnswerQuiz,
    onRetryQuiz: handleRetryQuiz,
    onMissionLogOpen: () => flightInput.setEnabled(false),
    onMissionLogClose: () => flightInput.setEnabled(true),
    onZoom: (direction) => paperScene.adjustZoom(
        direction === 'cockpit' ? -100 : (direction === 'in' ? -0.9 : 0.9)
    )
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
    const missions = evaluateMissions(previewState.learning);
    const signature = [
        flightState.nearbyPlanetKey ?? 'none',
        nearbyWorldObjectKey ?? 'none',
        previewState.notebook.open,
        previewState.notebook.planetKey ?? 'none',
        previewState.missionComplete,
        previewState.learning.section,
        previewState.learning.quiz.status,
        previewState.learning.quiz.selectedIndex ?? 'none',
        previewState.learning.quiz.attempts
    ].join(':');
    if (!force && signature === lastUiSignature) return;
    previewUI.update(previewState, {
        flightState,
        nearbyObjectKey: nearbyWorldObjectKey,
        missions
    });
    lastUiSignature = signature;
}

function updateMissionNavigation() {
    const missions = evaluateMissions(previewState.learning);
    const targetKey = missions.active?.discover.find(
        (key) => !previewState.learning.discoveredKeys.includes(key)
    );
    if (!targetKey) {
        previewUI.updateNavigation(null);
        return;
    }
    const object = getWorldObject(targetKey);
    const target = ['star', 'planet'].includes(object.type)
        ? { x: object.anchor[0], y: object.anchor[1], z: object.anchor[2] }
        : paperScene.getWorldObjectPosition(targetKey);
    if (!target) return;
    const offset = {
        x: target.x - flightState.position.x,
        y: target.y - flightState.position.y,
        z: target.z - flightState.position.z
    };
    const distance = Math.hypot(offset.x, offset.y, offset.z) || 1;
    const basis = paperScene.getNavigationBasis();
    const rightAmount = (offset.x * basis.right.x + offset.y * basis.right.y + offset.z * basis.right.z) / distance;
    const forwardAmount = (offset.x * basis.forward.x + offset.y * basis.forward.y + offset.z * basis.forward.z) / distance;
    previewUI.updateNavigation({
        name: object.name,
        distance,
        angleRadians: Math.atan2(rightAmount, forwardAmount)
    });
}

function step(seconds) {
    lastInput = {
        ...flightInput.sample(),
        movementBasis: paperScene.getNavigationBasis()
    };
    if (!previewState.notebook.open) {
        flightState = stepFlight(flightState, lastInput, seconds, paperScene.getPrimaryBodies());
    }
    paperScene.update(seconds);
    nearbyWorldObjectKey = paperScene.findNearbyWorldObject(flightState.position);
    paperScene.setFlightSnapshot(flightState, seconds);
    updateMissionNavigation();
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
    const nearbyKey = chooseNearbyObject(flightState.nearbyPlanetKey, nearbyWorldObjectKey);
    const nearbyPlanet = nearbyKey ? (learningCatalog[nearbyKey] ?? null) : null;
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
            target: evaluateMissions(previewState.learning).active?.id ?? null,
            complete: evaluateMissions(previewState.learning).active === null,
            label: evaluateMissions(previewState.learning).active?.title ?? 'Todas as missões cumpridas'
        },
        notebook: {
            ...previewState.notebook,
            section: previewState.learning.section,
            quizStatus: previewState.learning.quiz.status,
            discoveredKeys: [...previewState.learning.discoveredKeys]
        },
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
    closeNotebook: handleCloseNotebook,
    selectSection: handleSelectSection,
    answerQuiz: handleAnswerQuiz,
    retryQuiz: handleRetryQuiz,
    worldPosition: (key) => paperScene.getWorldObjectPosition(key),
    nearbyAt: (position) => paperScene.findNearbyWorldObject(position),
    teleport: (key) => {
        const object = getWorldObject(key);
        const target = object && ['star', 'planet'].includes(object.type)
            ? { x: object.anchor[0], y: object.anchor[1], z: object.anchor[2] }
            : paperScene.getWorldObjectPosition(key);
        if (!object || !target) return false;
        flightState = {
            ...flightState,
            position: { x: target.x, y: target.y, z: target.z + (object.interactionRadius ? object.interactionRadius * 0.88 : 0.9) },
            velocity: { x: 0, y: 0, z: 0 },
            nearbyPlanetKey: null
        };
        step(0.1);
        paperScene.render();
        return true;
    }
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
updateMissionNavigation();
previewUI.markReady();
paperScene.render();
hydrateTrackedObjects().catch(() => {});
hydrateDailySky().catch(() => {});
window.requestAnimationFrame(frame);
