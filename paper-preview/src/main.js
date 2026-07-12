import { closeNotebook, createPreviewState, explorePlanet } from './state.js';
import { createFlightState, findNearbyPlanet, stepFlight } from './flightSimulation.js';
import { createFlightInput } from './flightInput.js';
import { createStageSelectionGesture } from './input/stageSelection.js';
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
import { calculateWaypoint } from './navigation/waypoint.js';
import { createAutopilot, stepAutopilot } from './navigation/autopilot.js';
import { createCockpitTelemetry } from './scene/cockpitTelemetry.js';
import { evaluateMissions } from './missions/missionSystem.js';
import { loadProgress, saveProgress } from './missions/progressStore.js';
import {
    createExpeditionProgress,
    reconcileExpeditionProgress
} from './progression/expeditionProgress.js';
import { compareProgress, presentProgress } from './progression/progressPresentation.js';
import {
    createSurpriseState,
    dismissSurprise,
    getLocalizedSurprise,
    getSurprise,
    stepSurpriseDirector
} from './surprises/surpriseDirector.js';
import { paperI18n } from './i18n/paperI18n.js';
import { translateWorldObject } from './i18n/paperObjectTranslations.js';
import { siteAnalytics } from './analytics/siteAnalytics.js';
import { createEphemerisPresentation } from './learning/ephemerisPresentation.js';
import { createAudioDirector } from './audio/audioDirector.js';

/** DOM selectors are runtime-validated by the page structure tests. @type {any} */
const document = globalThis.document;

const stage = document.querySelector('#paper-stage');
siteAnalytics.start('game');
const objectHover = document.querySelector('#object-hover');
const objectHoverName = document.querySelector('#object-hover-name');
const autopilotStatus = document.querySelector('#autopilot-status');
const autopilotTarget = document.querySelector('#autopilot-target');
const autopilotProgress = document.querySelector('#autopilot-progress');
const autopilotCancel = document.querySelector('#autopilot-cancel');
let learningCatalog = createPaperLearningCatalog(paperI18n.language);
const learningCatalogView = new Proxy({}, {
    get: (_target, key) => learningCatalog[key],
    ownKeys: () => Reflect.ownKeys(learningCatalog),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
});
const savedProgress = loadProgress();
let previewState = createPreviewState(savedProgress);
let expeditionProgress = reconcileExpeditionProgress(createExpeditionProgress(savedProgress), {
    ...previewState.learning,
    completedMissionIds: evaluateMissions(previewState.learning, paperI18n.language).completedIds
});
let surpriseState = createSurpriseState({ seenIds: savedProgress.seenSurpriseIds });
let trackedMissionIds = new Set(evaluateMissions(previewState.learning, paperI18n.language).completedIds);
function currentProgressSnapshot() {
    return {
        ...previewState.learning,
        completedMissionIds: evaluateMissions(previewState.learning, paperI18n.language).completedIds,
        seenSurpriseIds: surpriseState.seenIds
    };
}
let progressPresentation = presentProgress(expeditionProgress, currentProgressSnapshot(), paperI18n.language);
let flightState = createFlightState();
let deterministicMode = false;
let lastFrameTime = performance.now();
let lastUiSignature = '';
let nearbyWorldObjectKey = null;
let currentNavigation = null;
let autoPilotState = null;
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
const audioDirector = createAudioDirector();
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
                    summary: paperI18n.language === 'en' ? translateWorldObject(world, 'en').fact : world.fact,
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
    const presentation = createEphemerisPresentation({
        key,
        name: record.name,
        distanceKm: vector.data.distanceKm,
        language: paperI18n.language
    });
    const envelope = {
        status: strongestStatus([vector, image]),
        presentationKind: presentation.kind,
        source: vector.source,
        updatedAt: vector.updatedAt,
        data: {
            summary: presentation.summary,
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
    await Promise.all(['iss', 'hubble'].map(async (key) => {
        const object = getWorldObject(key);
        const envelope = await spaceData.getSatelliteElements(
            object.source.command,
            SATELLITE_FALLBACKS[key]
        );
        const propagated = propagateOmm(envelope.data, new Date());
        if (!propagated) return;
        const offset = projectEarthOrbit(propagated.positionKm, object.orbitRadius);
        paperScene.setWorldObjectOffset(key, offset);
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
    const envelope = await spaceData.getDailySky({
        title: 'O céu de hoje',
        imageUrl: '/learning/sun.jpg'
    });
    previewUI.setApod(envelope);
}

function handleExplore() {
    const nearbyKey = chooseNearbyObject(flightState.nearbyPlanetKey, nearbyWorldObjectKey);
    if (previewState.notebook.open || !nearbyKey) return;
    previewState = explorePlanet(previewState, nearbyKey);
    audioDirector.play('paper-fold');
    const object = getWorldObject(nearbyKey);
    const category = object.type === 'moon' ? 'moons'
        : object.type === 'spacecraft' ? 'human'
            : (object.type === 'star' || object.type === 'planet') ? 'worlds' : 'small-bodies';
    siteAnalytics.track('object_open', { objectKey: nearbyKey, category, surface: 'game' });
    reconcileAndSaveProgress();
    flightInput.setEnabled(false);
    syncUI(true);
    hydrateLearningData(nearbyKey).catch(() => {});
}

function handleCloseNotebook() {
    if (!previewState.notebook.open) return;
    previewState = closeNotebook(previewState);
    audioDirector.play('paper-fold');
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
    audioDirector.play(selectedIndex === quiz.correctIndex ? 'quiz-correct' : 'quiz-wrong');
    const attempt = previewState.learning.quiz.attempts + 1;
    const attemptBucket = attempt >= 3 ? '3+' : String(attempt);
    siteAnalytics.track('quiz_result', {
        quizId: quiz.id,
        correct: selectedIndex === quiz.correctIndex,
        attemptBucket
    });
    previewState = {
        ...previewState,
        learning: answerLearningQuiz(previewState.learning, quiz, selectedIndex)
    };
    reconcileAndSaveProgress();
    syncUI(true);
}

function reconcileAndSaveProgress({ feedback = true } = {}) {
    const previousPresentation = progressPresentation;
    const missions = evaluateMissions(previewState.learning, paperI18n.language);
    missions.completedIds.forEach((missionId) => {
        if (!trackedMissionIds.has(missionId)) siteAnalytics.track('mission_event', { missionId, state: 'complete' });
    });
    trackedMissionIds = new Set(missions.completedIds);
    expeditionProgress = reconcileExpeditionProgress(expeditionProgress, {
        ...previewState.learning,
        completedMissionIds: missions.completedIds,
        seenSurpriseIds: surpriseState.seenIds
    });
    progressPresentation = presentProgress(expeditionProgress, currentProgressSnapshot(), paperI18n.language);
    saveProgress({ ...previewState.learning, ...expeditionProgress });
    if (feedback) {
        const delta = compareProgress(previousPresentation, progressPresentation);
        previewUI.showProgressFeedback(delta);
        if (delta.xpGained || delta.leveledUp || delta.newAwards?.length) audioDirector.play('reward-chime');
    }
}

function handleSurprise(event) {
    audioDirector.play('lumi-signal');
    previewUI.showSurprise(getLocalizedSurprise(event.id, paperI18n.language));
    paperScene.triggerSurprise(event.effect);
    reconcileAndSaveProgress({ feedback: false });
    syncUI(true);
}

function handleDismissSurprise() {
    surpriseState = dismissSurprise(surpriseState);
}

function handleRetryQuiz() {
    previewState = {
        ...previewState,
        learning: retryLearningQuiz(previewState.learning)
    };
    syncUI(true);
}

const previewUI = createPreviewUI({
    learningCatalog: learningCatalogView,
    onExplore: handleExplore,
    onCloseNotebook: handleCloseNotebook,
    onSelectSection: handleSelectSection,
    onAnswerQuiz: handleAnswerQuiz,
    onRetryQuiz: handleRetryQuiz,
    onMissionLogOpen: () => flightInput.setEnabled(false),
    onMissionLogClose: () => flightInput.setEnabled(true),
    onDismissSurprise: handleDismissSurprise,
    onZoom: (direction) => paperScene.adjustZoom(
        direction === 'cockpit' ? -100 : (direction === 'in' ? -0.9 : 0.9)
    ),
    onToggleOrbits: () => paperScene.toggleOrbits(),
    onSoundToggle: () => {
        audioDirector.toggle();
        return audioDirector.getState();
    }
});
previewUI.updateAudioState(audioDirector.getState());

function unlockAudio() {
    audioDirector.unlock();
    previewUI.updateAudioState(audioDirector.getState());
    window.removeEventListener('pointerdown', unlockAudio, true);
    window.removeEventListener('keydown', unlockAudio, true);
}
window.addEventListener('pointerdown', unlockAudio, { capture: true, once: true });
window.addEventListener('keydown', unlockAudio, { capture: true, once: true });

paperI18n.subscribe(() => {
    siteAnalytics.track('language_change', { language: paperI18n.language, surface: 'game' });
    learningCatalog = createPaperLearningCatalog(paperI18n.language);
    progressPresentation = presentProgress(expeditionProgress, currentProgressSnapshot(), paperI18n.language);
    lastUiSignature = '';
    syncUI(true);
    updateMissionNavigation();
    if (!objectHover.hidden && objectHover.dataset.worldKey) {
        objectHoverName.textContent = translateWorldObject(
            getWorldObject(objectHover.dataset.worldKey),
            paperI18n.language
        ).name;
    }
    updateAutopilotDisplay();
});
paperI18n.apply();

const flightInput = createFlightInput({
    stage,
    joystick: previewUI.elements.joystick,
    joystickKnob: previewUI.elements.joystickKnob
});

function interactionRadiusFor(object) {
    if (object.interactionRadius) return object.interactionRadius;
    if (object.type === 'moon') return Math.max(2.2, object.scale * 3.5);
    return Math.max(1.65, object.scale * 3.5);
}

function updateAutopilotDisplay() {
    autopilotStatus.hidden = !autoPilotState;
    paperScene.setAutopilotActive(Boolean(autoPilotState));
    if (!autoPilotState) return;
    const object = getWorldObject(autoPilotState.targetKey);
    autopilotTarget.textContent = translateWorldObject(object, paperI18n.language).name;
    autopilotProgress.value = Math.round(autoPilotState.progress * 100);
}

function cancelAutopilot() {
    if (autoPilotState) siteAnalytics.track('autopilot_event', { objectKey: autoPilotState.targetKey, state: 'cancel' });
    autoPilotState = null;
    updateAutopilotDisplay();
}

function flyToWorldObject(key) {
    const object = getWorldObject(key);
    const target = paperScene.getWorldObjectPosition(key);
    if (!object || !target || previewState.notebook.open || previewUI.elements.missionLog.open) return false;
    flightInput.reset();
    autoPilotState = createAutopilot(key, flightState.position, target, interactionRadiusFor(object));
    audioDirector.play('autopilot-start');
    siteAnalytics.track('autopilot_event', { objectKey: key, state: 'start' });
    objectHover.hidden = true;
    updateAutopilotDisplay();
    return true;
}

function showObjectHover(key, event) {
    if (!key || autoPilotState || previewState.notebook.open || previewUI.elements.missionLog.open) {
        objectHover.hidden = true;
        return;
    }
    const object = getWorldObject(key);
    objectHover.dataset.worldKey = key;
    objectHoverName.textContent = translateWorldObject(object, paperI18n.language).name;
    objectHover.style.left = `${Math.min(window.innerWidth - 210, Math.max(8, event.clientX))}px`;
    objectHover.style.top = `${Math.min(window.innerHeight - 80, Math.max(8, event.clientY))}px`;
    objectHover.hidden = false;
}

const selectionGesture = createStageSelectionGesture();
stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || previewState.notebook.open || event.target.closest?.('[data-flight-control]')) return;
    selectionGesture.pointerDown(event);
});
stage.addEventListener('pointermove', (event) => {
    if (selectionGesture.pointerMove(event)) objectHover.hidden = true;
    if (event.buttons === 0) showObjectHover(paperScene.pickWorldObject(event.clientX, event.clientY), event);
});
stage.addEventListener('pointerup', (event) => {
    if (!selectionGesture.pointerUp(event)) return;
    const key = paperScene.pickWorldObject(event.clientX, event.clientY);
    if (key) flyToWorldObject(key);
});
stage.addEventListener('pointercancel', (event) => { selectionGesture.pointerCancel(event); });
stage.addEventListener('pointerleave', (event) => { if (event.buttons === 0) objectHover.hidden = true; });
autopilotCancel.addEventListener('click', cancelAutopilot);

function syncUI(force = false) {
    const missions = evaluateMissions(previewState.learning, paperI18n.language);
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
        missions,
        expeditionProgress
    });
    lastUiSignature = signature;
}

function updateMissionNavigation() {
    const missions = evaluateMissions(previewState.learning, paperI18n.language);
    const targetKey = missions.active?.discover.find(
        (key) => !previewState.learning.discoveredKeys.includes(key)
    );
    if (!targetKey) {
        currentNavigation = null;
        previewUI.updateNavigation(null);
        return;
    }
    const object = getWorldObject(targetKey);
    const localizedObject = translateWorldObject(object, paperI18n.language);
    const target = paperScene.getWorldObjectPosition(targetKey);
    if (!target) return;
    const parent = object.parentKey ? getWorldObject(object.parentKey) : null;
    const waypoint = calculateWaypoint({
        from: flightState.position,
        to: target,
        basis: paperScene.getNavigationBasis(),
        interactionRadius: object.interactionRadius ?? (object.type === 'moon' ? 2.2 : 1.65),
        solarDistanceAu: object.orbit?.semiMajorAxisAu ?? parent?.orbit?.semiMajorAxisAu ?? null,
        language: paperI18n.language
    });
    currentNavigation = {
        name: localizedObject.name,
        ...waypoint
    };
    previewUI.updateNavigation(currentNavigation);
}

function step(seconds) {
    lastInput = {
        ...flightInput.sample(),
        movementBasis: paperScene.getNavigationBasis()
    };
    const hasManualInput = Math.abs(lastInput.forward) + Math.abs(lastInput.strafe)
        + Math.abs(lastInput.vertical) + Math.abs(lastInput.yawDelta)
        + Math.abs(lastInput.pitchDelta) + Math.abs(lastInput.roll) > 0.01
        || lastInput.boost || lastInput.brake;
    if (autoPilotState && hasManualInput) cancelAutopilot();
    const dialogOpen = previewState.notebook.open || previewUI.elements.missionLog.open;
    if (!dialogOpen && autoPilotState) {
        const target = paperScene.getWorldObjectPosition(autoPilotState.targetKey);
        if (!target) cancelAutopilot();
        else {
            const autopilotTargetKey = autoPilotState.targetKey;
            const result = stepAutopilot(flightState, autoPilotState, target, seconds);
            autoPilotState = result.autopilot;
            flightState = {
                ...result.flightState,
                nearbyPlanetKey: findNearbyPlanet(result.flightState.position, paperScene.getPrimaryBodies())
            };
            updateAutopilotDisplay();
            if (result.arrived) {
                audioDirector.play('autopilot-arrive');
                siteAnalytics.track('autopilot_event', { objectKey: autopilotTargetKey, state: 'arrive' });
                paperScene.triggerSurprise('star');
            }
        }
    } else if (!dialogOpen) {
        flightState = stepFlight(flightState, lastInput, seconds, paperScene.getPrimaryBodies());
    }
    paperScene.update(seconds);
    nearbyWorldObjectKey = paperScene.findNearbyWorldObject(flightState.position);
    paperScene.setFlightSnapshot(flightState, seconds);
    const surpriseResult = stepSurpriseDirector(surpriseState, {
        deltaSeconds: seconds,
        speed: Math.hypot(flightState.velocity.x, flightState.velocity.y, flightState.velocity.z),
        distanceFromOrigin: Math.hypot(flightState.position.x, flightState.position.y, flightState.position.z),
        dialogOpen: previewState.notebook.open || previewUI.elements.missionLog.open
    });
    surpriseState = surpriseResult.state;
    if (surpriseResult.event) handleSurprise(surpriseResult.event);
    audioDirector.update({
        speed: Math.hypot(flightState.velocity.x, flightState.velocity.y, flightState.velocity.z),
        boost: lastInput.boost,
        autopilot: Boolean(autoPilotState),
        dialogOpen
    }, seconds);
    updateMissionNavigation();
    previewUI.updateCockpitTelemetry(
        createCockpitTelemetry(flightState, currentNavigation, paperScene.getState().cameraMode),
        currentNavigation
    );
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
            target: evaluateMissions(previewState.learning, paperI18n.language).active?.id ?? null,
            complete: evaluateMissions(previewState.learning, paperI18n.language).active === null,
            label: evaluateMissions(previewState.learning, paperI18n.language).active?.title ?? paperI18n.t('game.missions.all')
        },
        notebook: {
            ...previewState.notebook,
            section: previewState.learning.section,
            quizStatus: previewState.learning.quiz.status,
            discoveredKeys: [...previewState.learning.discoveredKeys]
        },
        progression: { ...expeditionProgress, presentation: progressPresentation },
        surprise: { activeId: surpriseState.activeId, seenIds: [...surpriseState.seenIds] },
        autopilot: autoPilotState ? { ...autoPilotState } : null,
        audio: audioDirector.getState(),
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
    getState: () => ({ preview: { ...previewState }, flight: { ...flightState }, progression: progressPresentation, scene: paperScene.getState() }),
    explore: handleExplore,
    closeNotebook: handleCloseNotebook,
    selectSection: handleSelectSection,
    answerQuiz: handleAnswerQuiz,
    retryQuiz: handleRetryQuiz,
    triggerSurprise: (id) => {
        const event = getSurprise(id);
        if (!event) return false;
        surpriseState = createSurpriseState({
            ...surpriseState,
            activeId: event.id,
            seenIds: [...surpriseState.seenIds, event.id]
        });
        handleSurprise(event);
        return true;
    },
    worldPosition: (key) => paperScene.getWorldObjectPosition(key),
    flyTo: flyToWorldObject,
    cancelAutopilot,
    nearbyAt: (position) => paperScene.findNearbyWorldObject(position),
    teleportPosition: (position) => {
        flightState = {
            ...flightState,
            position: { x: position.x, y: position.y, z: position.z },
            velocity: { x: 0, y: 0, z: 0 },
            nearbyPlanetKey: null
        };
        step(0.1);
        paperScene.render();
        return true;
    },
    teleport: (key) => {
        const object = getWorldObject(key);
        const target = object ? paperScene.getWorldObjectPosition(key) : null;
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
    window.removeEventListener('pointerdown', unlockAudio, true);
    window.removeEventListener('keydown', unlockAudio, true);
    flightInput.destroy();
    previewUI.destroy();
    audioDirector.destroy();
    paperScene.destroy();
}, { once: true });

paperScene.update(0);
paperScene.setFlightSnapshot(flightState, 0.1);
syncUI(true);
updateMissionNavigation();
previewUI.updateCockpitTelemetry(
    createCockpitTelemetry(flightState, currentNavigation, paperScene.getState().cameraMode),
    currentNavigation
);
previewUI.markReady();
paperScene.render();
hydrateTrackedObjects().catch(() => {});
hydrateDailySky().catch(() => {});
window.requestAnimationFrame(frame);
