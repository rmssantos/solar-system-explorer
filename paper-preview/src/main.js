import { closeNotebook, createPreviewState, explorePlanet } from './state.js';
import { createFlightState, findNearbyPlanet, stepFlight } from './flightSimulation.js';
import { createFlightInput } from './flightInput.js';
import { createFlightInputModeController } from './input/deviceInputMode.js';
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
import {
    ISS_DELIVERY_CONTRACT_ID,
    acceptContract,
    completeContract,
    createContractState,
    getContractStatus,
    isContractDestinationNearby
} from './contracts/contractState.js';
import { CONTRACT_CATALOG, getContract } from './contracts/contractCatalog.js';
import {
    arriveContractTravel,
    cancelContractTravel,
    createContractJourney,
    startContractTravel
} from './contracts/contractJourney.js';
import {
    clearContractAttempt,
    createContractAttemptState,
    getContractAttempt,
    saveContractAttempt
} from './contracts/contractAttemptState.js';
import {
    completeMissionTraining,
    createMissionTrainingState,
    needsMissionTraining
} from './contracts/missionTrainingState.js';
import { createLocalOrbitHost } from './minigames/localOrbitHost.js';
import { ORBITAL_MISSION_PROFILES } from './minigames/orbitalMissionProfiles.js';
import { createMissionPrefetch } from './minigames/missionPrefetch.js';
import { createAgencyUi } from './agency/agencyUi.js';
import { createLivingOperations } from './agency/operationDirector.js';
import {
    collectAgencyReport,
    completeAgencyMissionWithScience,
    createAgencyState,
    launchAgencyMission,
    reconcileAgencyState
} from './agency/agencyState.js';
import { getExpeditionChapter } from './expedition/expeditionCatalog.js';
import {
    acceptExpeditionChapter,
    completeExpeditionChapter,
    createExpeditionState,
    getExpeditionChapterStatus
} from './expedition/expeditionState.js';
import {
    arriveExpeditionTravel,
    cancelExpeditionTravel,
    createExpeditionJourney,
    startExpeditionTravel
} from './expedition/expeditionJourney.js';
import { isExpeditionDestinationNearby } from './expedition/expeditionDirector.js';
import { createFinaleState } from './expedition/finaleState.js';

/** DOM selectors are runtime-validated by the page structure tests. @type {any} */
const document = globalThis.document;
const flightInputMode = createFlightInputModeController();

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
let contractState = createContractState(savedProgress);
let contractAttemptState = createContractAttemptState(savedProgress);
let expeditionState = createExpeditionState(savedProgress);
let expeditionFinaleState = createFinaleState(savedProgress.expeditionFinaleState);
let expeditionAttemptState = createContractAttemptState({
    contractAttempts: savedProgress.expeditionAttempts
});
let missionTrainingState = createMissionTrainingState(savedProgress);
let agencyState = reconcileAgencyState(createAgencyState({
    agencyActiveMissions: savedProgress.agencyActiveMissions,
    activeMissions: savedProgress.agencyActiveMissions,
    agencyReports: savedProgress.agencyReports,
    reports: savedProgress.agencyReports
}), Date.now());
let livingOperations = createLivingOperations();
let agencyNowMs = Date.now();
let agencyUi = null;
let expeditionProgress = reconcileExpeditionProgress(createExpeditionProgress(savedProgress), {
    ...previewState.learning,
    completedMissionIds: evaluateMissions(previewState.learning, paperI18n.language).completedIds,
    completedContractIds: contractState.completedContractIds,
    completedExpeditionChapterIds: expeditionState.completedChapterIds,
    collectedAgencyReportIds: agencyState.reports.filter((report) => report.collected).map((report) => report.id)
});
let surpriseState = createSurpriseState({ seenIds: savedProgress.seenSurpriseIds });
let trackedMissionIds = new Set(evaluateMissions(previewState.learning, paperI18n.language).completedIds);
function currentProgressSnapshot() {
    return {
        ...previewState.learning,
        completedMissionIds: evaluateMissions(previewState.learning, paperI18n.language).completedIds,
        seenSurpriseIds: surpriseState.seenIds,
        completedContractIds: contractState.completedContractIds,
        completedExpeditionChapterIds: expeditionState.completedChapterIds,
        collectedAgencyReportIds: agencyState.reports.filter((report) => report.collected).map((report) => report.id)
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
let localOrbitOpen = false;
let localOrbitHost = null;
let activeOrbitContractId = null;
let contractJourney = createContractJourney();
let activeExpeditionChapterId = null;
let expeditionJourney = createExpeditionJourney();
let activeOrbitTraining = false;
let agencyUiElapsed = 0;
let orbitalClockUiElapsed = 0;
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

const paperScene = createPaperScene(stage, { timeScale: 1 });
const audioDirector = createAudioDirector();
const missionPrefetch = createMissionPrefetch();
const spaceData = createSpaceDataService();
const NASA_SEARCH_TERMS = Object.freeze({
    sun: 'Sun solar observatory', mercury: 'Mercury planet', venus: 'Venus planet',
    earth: 'Earth full disk planet', mars: 'Mars planet', jupiter: 'Jupiter planet',
    saturn: 'Saturn planet', uranus: 'Uranus planet', neptune: 'Neptune planet',
    moon: 'Moon full disk', iss: 'International Space Station', hubble: 'Hubble Space Telescope',
    jwst: 'James Webb Space Telescope', 'voyager-1': 'Voyager spacecraft',
    'tesla-roadster': 'SpaceX Roadster Starman', halley: 'Halley comet', '67p': 'comet 67P'
});

function isoDateOffset(date, days) {
    return new Date(date.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
}

async function hydrateLivingOperations() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const [solar, neo, planet] = await Promise.all([
        spaceData.getSpaceWeather(isoDateOffset(now, -7), date, []),
        spaceData.getNearEarthObjects(date, isoDateOffset(now, 6), []),
        spaceData.getPlanetVector('mars', '499', date, {
            epoch: date,
            positionKm: { x: 225_000_000, y: 0, z: 0 },
            distanceKm: 225_000_000
        })
    ]);
    livingOperations = createLivingOperations({ date, solar, neo, planet });
    agencyUi?.update({ operations: livingOperations, agencyState, nowMs: agencyNowMs });
}

function isOrbitalContractDestinationNearby(contractId) {
    const orbitingObject = nearbyWorldObjectKey ? getWorldObject(nearbyWorldObjectKey) : null;
    return isContractDestinationNearby(contractId, {
        planetKey: flightState.nearbyPlanetKey,
        objectKey: nearbyWorldObjectKey,
        orbitingParentKey: orbitingObject?.parentKey ?? null
    });
}

function currentExpeditionContext() {
    return {
        discoveredKeys: previewState.learning.discoveredKeys,
        completedContractIds: contractState.completedContractIds
    };
}

function currentExpeditionProximity() {
    return {
        planetKey: flightState.nearbyPlanetKey,
        objectKey: nearbyWorldObjectKey
    };
}

function isCurrentExpeditionDestinationNearby(chapterId) {
    return isExpeditionDestinationNearby(chapterId, currentExpeditionProximity());
}

function startableOrbitalContractId() {
    return CONTRACT_CATALOG.find((contract) => getContractStatus(
        contractState,
        contract.id,
        previewState.learning
    ) === 'accepted' && isOrbitalContractDestinationNearby(contract.id))?.id ?? null;
}

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
    const startableContractId = startableOrbitalContractId();
    if (startableContractId) {
        startOrbitalContract(startableContractId);
        return;
    }
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
        seenSurpriseIds: surpriseState.seenIds,
        completedContractIds: contractState.completedContractIds,
        completedExpeditionChapterIds: expeditionState.completedChapterIds,
        collectedAgencyReportIds: agencyState.reports.filter((report) => report.collected).map((report) => report.id)
    });
    progressPresentation = presentProgress(expeditionProgress, currentProgressSnapshot(), paperI18n.language);
    saveProgress({
        ...previewState.learning,
        ...expeditionProgress,
        ...contractState,
        contractAttempts: contractAttemptState.contractAttempts,
        expeditionVersion: expeditionState.expeditionVersion,
        acceptedExpeditionChapterIds: expeditionState.acceptedChapterIds,
        completedExpeditionChapterIds: expeditionState.completedChapterIds,
        expeditionEvidenceIds: expeditionState.evidenceIds,
        expeditionUpgradeIds: expeditionState.upgradeIds,
        expeditionAttempts: expeditionAttemptState.contractAttempts,
        expeditionFinaleState,
        seenMissionTrainingIds: missionTrainingState.seenMissionTrainingIds,
        agencyActiveMissions: agencyState.activeMissions,
        agencyReports: agencyState.reports
    });
    if (feedback) {
        const delta = compareProgress(previousPresentation, progressPresentation);
        previewUI.showProgressFeedback(delta);
        if (delta.xpGained || delta.leveledUp || delta.newAwards?.length) audioDirector.play('reward-chime');
    }
}

function syncAgencyState(nowMs = agencyNowMs, { persist = true, render = false } = {}) {
    const activeCount = agencyState.activeMissions.length;
    const reportCount = agencyState.reports.length;
    agencyState = reconcileAgencyState(agencyState, nowMs);
    const agencyChanged = activeCount !== agencyState.activeMissions.length
        || reportCount !== agencyState.reports.length;
    if (persist && agencyChanged) {
        reconcileAndSaveProgress({ feedback: false });
    }
    if (render || agencyChanged) agencyUi?.update({ operations: livingOperations, agencyState, nowMs });
    else agencyUi?.tick(nowMs);
}

function launchAgencyOperation(configuration) {
    const operation = livingOperations.find((candidate) => candidate.id === configuration.operationId);
    const result = launchAgencyMission(agencyState, { ...configuration, operation, nowMs: agencyNowMs });
    if (result.error) return false;
    agencyState = result.state;
    siteAnalytics.track('agency_event', { family: operation.kind, state: 'launch' });
    audioDirector.play('paper-engine');
    reconcileAndSaveProgress({ feedback: false });
    syncAgencyState(agencyNowMs, { persist: false, render: true });
    return result.mission;
}

function completeAgencyScienceOperation({ missionId, score }) {
    const current = agencyState.activeMissions.find((mission) => mission.id === missionId);
    const result = completeAgencyMissionWithScience(agencyState, missionId, score, agencyNowMs);
    if (result.error) return false;
    agencyState = result.state;
    siteAnalytics.track('agency_event', { family: current?.kind ?? 'unknown', state: 'science-complete' });
    audioDirector.play('reward-chime');
    reconcileAndSaveProgress({ feedback: false });
    syncAgencyState(agencyNowMs, { persist: false, render: true });
    return result.report;
}

function collectAgencyOperationReport(reportId) {
    const current = agencyState.reports.find((report) => report.id === reportId);
    const result = collectAgencyReport(agencyState, reportId, agencyNowMs);
    if (result.error) return false;
    agencyState = result.state;
    siteAnalytics.track('agency_event', { family: current?.kind ?? 'unknown', state: 'collect' });
    reconcileAndSaveProgress();
    audioDirector.play('reward-chime');
    syncAgencyState(agencyNowMs, { persist: false, render: true });
    syncUI(true);
    return true;
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

function handleAcceptContract(contractId) {
    const next = acceptContract(
        contractState,
        contractId,
        previewState.learning
    );
    if (next === contractState) return false;
    contractState = next;
    const contract = getContract(contractId);
    if (contract) missionPrefetch.prefetch(getOrbitalGameplay(contract.activity));
    siteAnalytics.track('contract_event', { contractId, state: 'start' });
    reconcileAndSaveProgress({ feedback: false });
    audioDirector.play('paper-fold');
    syncUI(true);
    return true;
}

function handleTravelContract(contractId) {
    const contract = getContract(contractId);
    if (contract) missionPrefetch.prefetch(getOrbitalGameplay(contract.activity));
    const next = startContractTravel(contractJourney, contractId);
    if (next === contractJourney) return false;
    contractJourney = next;
    if (!flyToWorldObject(next.targetKey, { allowMissionLog: true })) {
        contractJourney = cancelContractTravel(contractJourney);
        syncUI(true);
        return false;
    }
    syncUI(true);
    return true;
}

function handleExpeditionAction(chapterId, action) {
    if (action === 'finale') {
        const next = acceptExpeditionChapter(expeditionState, chapterId, currentExpeditionContext());
        if (next !== expeditionState) {
            expeditionState = next;
            siteAnalytics.track('expedition_event', { chapterId, state: 'accept' });
            reconcileAndSaveProgress({ feedback: false });
            syncUI(true);
        }
        return false;
    }
    if (action === 'complete') {
        const next = completeExpeditionChapter(expeditionState, chapterId);
        if (next === expeditionState) return false;
        expeditionState = next;
        siteAnalytics.track('expedition_event', { chapterId, state: 'complete' });
        audioDirector.play('reward-chime');
        reconcileAndSaveProgress();
        syncUI(true);
        return false;
    }
    if (action === 'accept') {
        const next = acceptExpeditionChapter(
            expeditionState,
            chapterId,
            currentExpeditionContext()
        );
        if (next === expeditionState) return false;
        expeditionState = next;
        const chapter = getExpeditionChapter(chapterId);
        if (chapter) missionPrefetch.prefetch(getOrbitalGameplay(chapter.activity));
        siteAnalytics.track('expedition_event', { chapterId, state: 'accept' });
        audioDirector.play('paper-fold');
        reconcileAndSaveProgress({ feedback: false });
        syncUI(true);
        return false;
    }
    if (action === 'travel') {
        const next = startExpeditionTravel(expeditionJourney, chapterId);
        if (next === expeditionJourney) return false;
        expeditionJourney = next;
        if (!flyToWorldObject(next.targetKey, { allowMissionLog: true })) {
            expeditionJourney = cancelExpeditionTravel(expeditionJourney);
            syncUI(true);
            return false;
        }
        syncUI(true);
        return true;
    }
    if (action === 'start') {
        void startExpeditionChapter(chapterId);
        return true;
    }
    return false;
}

async function startExpeditionChapter(chapterId) {
    const chapter = getExpeditionChapter(chapterId);
    const accepted = getExpeditionChapterStatus(
        expeditionState,
        chapterId,
        currentExpeditionContext()
    ) === 'accepted';
    if (!chapter || chapter.kind !== 'investigation' || !accepted
        || !isCurrentExpeditionDestinationNearby(chapterId)
        || localOrbitOpen || !localOrbitHost) return false;
    localOrbitOpen = true;
    activeExpeditionChapterId = chapter.id;
    activeOrbitContractId = null;
    activeOrbitTraining = false;
    expeditionJourney = cancelExpeditionTravel(expeditionJourney);
    autoPilotState = null;
    updateAutopilotDisplay();
    flightInput.reset();
    flightInput.setEnabled(false);
    objectHover.hidden = true;
    audioDirector.play('paper-fold');
    siteAnalytics.track('expedition_event', { chapterId, state: 'open' });
    syncUI(true);
    const attempt = getContractAttempt(expeditionAttemptState, chapter.id);
    await localOrbitHost.open({
        language: paperI18n.language,
        missionId: chapter.activity,
        attemptKey: chapter.id,
        chapter,
        initialSimulation: attempt?.missionId === chapter.activity ? attempt.simulation : null,
        showTraining: needsMissionTraining(missionTrainingState, getOrbitalGameplay(chapter.activity))
    });
    return true;
}

async function startOrbitalContract(contractId) {
    const contract = getContract(contractId);
    const accepted = getContractStatus(
        contractState,
        contractId,
        previewState.learning
    ) === 'accepted';
    if (!contract || !accepted || !isOrbitalContractDestinationNearby(contractId) || localOrbitOpen || !localOrbitHost) return false;
    localOrbitOpen = true;
    activeOrbitContractId = contractId;
    activeExpeditionChapterId = null;
    activeOrbitTraining = false;
    contractJourney = cancelContractTravel(contractJourney);
    autoPilotState = null;
    updateAutopilotDisplay();
    flightInput.reset();
    flightInput.setEnabled(false);
    objectHover.hidden = true;
    audioDirector.play('paper-fold');
    siteAnalytics.track('contract_event', { contractId, state: 'open' });
    syncUI(true);
    const attempt = getContractAttempt(contractAttemptState, contractId);
    await localOrbitHost.open({
        language: paperI18n.language,
        missionId: contract.activity,
        contract,
        initialSimulation: attempt?.missionId === contract.activity ? attempt.simulation : null,
        showTraining: needsMissionTraining(missionTrainingState, getOrbitalGameplay(contract.activity))
    });
    return true;
}

function getOrbitalGameplay(missionId) {
    return ORBITAL_MISSION_PROFILES[missionId]?.gameplay ?? 'docking';
}

async function startContractTraining(contractId) {
    const contract = getContract(contractId);
    const status = getContractStatus(contractState, contractId, previewState.learning);
    if (!contract || status === 'locked' || localOrbitOpen || !localOrbitHost) return false;
    localOrbitOpen = true;
    activeOrbitContractId = contractId;
    activeExpeditionChapterId = null;
    activeOrbitTraining = true;
    flightInput.reset();
    flightInput.setEnabled(false);
    audioDirector.play('paper-fold');
    syncUI(true);
    await localOrbitHost.open({
        language: paperI18n.language,
        missionId: contract.activity,
        contract,
        trainingMode: true,
        showTraining: true
    });
    return true;
}

function handleOrbitalContractComplete(context) {
    if (activeOrbitTraining || context?.trainingMode) return false;
    if (!activeOrbitContractId) return false;
    const next = completeContract(contractState, activeOrbitContractId);
    if (next === contractState) return false;
    contractState = next;
    contractAttemptState = clearContractAttempt(contractAttemptState, activeOrbitContractId);
    siteAnalytics.track('contract_event', { contractId: activeOrbitContractId, state: 'complete' });
    reconcileAndSaveProgress();
    syncUI(true);
    return true;
}

function handleExpeditionChapterComplete(context) {
    if (activeOrbitTraining || context?.trainingMode || !activeExpeditionChapterId) return false;
    const next = completeExpeditionChapter(expeditionState, activeExpeditionChapterId);
    if (next === expeditionState) return false;
    const completedChapterId = activeExpeditionChapterId;
    expeditionState = next;
    expeditionAttemptState = clearContractAttempt(expeditionAttemptState, completedChapterId);
    siteAnalytics.track('expedition_event', { chapterId: completedChapterId, state: 'complete' });
    reconcileAndSaveProgress();
    syncUI(true);
    return true;
}

function handleLocalMissionComplete(context) {
    if (activeExpeditionChapterId) return handleExpeditionChapterComplete(context);
    return handleOrbitalContractComplete(context);
}

function handleContractAttemptSave(attempt) {
    contractAttemptState = saveContractAttempt(contractAttemptState, attempt);
    reconcileAndSaveProgress({ feedback: false });
}

function handleContractAttemptClear(contractId) {
    const next = clearContractAttempt(contractAttemptState, contractId);
    if (next === contractAttemptState) return false;
    contractAttemptState = next;
    reconcileAndSaveProgress({ feedback: false });
    return true;
}

function handleMissionAttemptSave(attempt) {
    if (!attempt?.attemptKey) return handleContractAttemptSave(attempt);
    expeditionAttemptState = saveContractAttempt(expeditionAttemptState, {
        contractId: attempt.attemptKey,
        missionId: attempt.missionId,
        simulation: attempt.simulation
    });
    reconcileAndSaveProgress({ feedback: false });
}

function handleMissionAttemptClear(attemptKey) {
    if (!activeExpeditionChapterId) return handleContractAttemptClear(attemptKey);
    const next = clearContractAttempt(expeditionAttemptState, attemptKey);
    if (next === expeditionAttemptState) return false;
    expeditionAttemptState = next;
    reconcileAndSaveProgress({ feedback: false });
    return true;
}

function handleMissionTrainingComplete(gameplay) {
    const next = completeMissionTraining(missionTrainingState, gameplay);
    if (next === missionTrainingState) return false;
    missionTrainingState = next;
    reconcileAndSaveProgress({ feedback: false });
    return true;
}

function handleLocalOrbitClose() {
    if (!localOrbitOpen) return;
    localOrbitOpen = false;
    flightInput.setEnabled(true);
    audioDirector.play('paper-fold');
    if (activeOrbitContractId) siteAnalytics.track('contract_event', { contractId: activeOrbitContractId, state: 'close' });
    activeOrbitContractId = null;
    activeExpeditionChapterId = null;
    activeOrbitTraining = false;
    syncUI(true);
}

const previewUI = createPreviewUI({
    learningCatalog: learningCatalogView,
    onExplore: handleExplore,
    onCloseNotebook: handleCloseNotebook,
    onSelectSection: handleSelectSection,
    onAnswerQuiz: handleAnswerQuiz,
    onRetryQuiz: handleRetryQuiz,
    onAcceptContract: handleAcceptContract,
    onTravelContract: handleTravelContract,
    onTrainContract: startContractTraining,
    onStartContract: startOrbitalContract,
    onExpeditionAction: handleExpeditionAction,
    onExpeditionFinaleChange: (nextState) => {
        expeditionFinaleState = createFinaleState(nextState);
        reconcileAndSaveProgress({ feedback: false });
    },
    onMissionLogOpen: () => flightInput.setEnabled(false),
    onMissionLogClose: () => flightInput.setEnabled(true),
    onDismissSurprise: handleDismissSurprise,
    onZoom: (direction) => paperScene.adjustZoom(
        direction === 'cockpit' ? -100 : (direction === 'in' ? -0.9 : 0.9)
    ),
    onToggleOrbits: () => paperScene.toggleOrbits(),
    onOrbitalTimeScale: (timeScale) => paperScene.setOrbitalTimeScale(timeScale),
    onOrbitalTimeToday: () => paperScene.resetOrbitalTimeToToday(Date.now()),
    onSoundToggle: () => {
        audioDirector.toggle();
        return audioDirector.getState();
    }
});
previewUI.updateAudioState(audioDirector.getState());
previewUI.updateOrbitalClock(paperScene.getState().orbitalClock);

agencyUi = createAgencyUi({
    i18n: paperI18n,
    onOpen: () => flightInput.setEnabled(false),
    onClose: () => flightInput.setEnabled(true),
    onLaunch: launchAgencyOperation,
    onScienceComplete: completeAgencyScienceOperation,
    onCollect: collectAgencyOperationReport,
    onOpenCampaign: () => previewUI.openMissionLog('missions')
});
agencyUi.update({ operations: livingOperations, agencyState, nowMs: agencyNowMs });

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

localOrbitHost = createLocalOrbitHost({
    messages: {
        get guidance() { return paperI18n.t('game.docking.guidance'); },
        get retry() { return paperI18n.t('game.docking.assisted'); }
    },
    onComplete: handleLocalMissionComplete,
    onClose: handleLocalOrbitClose,
    onAttemptSave: handleMissionAttemptSave,
    onAttemptClear: handleMissionAttemptClear,
    onTrainingComplete: handleMissionTrainingComplete,
    onAudioCue: (cue) => audioDirector.play(cue)
});

function interactionRadiusFor(object) {
    if (object.interactionRadius) return object.interactionRadius;
    if (object.type === 'moon') return Math.max(2.2, object.scale * 3.5);
    return Math.max(1.65, object.scale * 3.5);
}

function updateAutopilotDisplay() {
    autopilotStatus.hidden = !autoPilotState;
    if (!autoPilotState) return;
    const object = getWorldObject(autoPilotState.targetKey);
    autopilotTarget.textContent = translateWorldObject(object, paperI18n.language).name;
    autopilotProgress.value = Math.round(autoPilotState.progress * 100);
}

function cancelAutopilot() {
    if (autoPilotState) siteAnalytics.track('autopilot_event', { objectKey: autoPilotState.targetKey, state: 'cancel' });
    autoPilotState = null;
    contractJourney = cancelContractTravel(contractJourney);
    expeditionJourney = cancelExpeditionTravel(expeditionJourney);
    updateAutopilotDisplay();
    syncUI(true);
}

function flyToWorldObject(key, { allowMissionLog = false } = {}) {
    const object = getWorldObject(key);
    const target = paperScene.getWorldObjectPosition(key);
    if (!object || !target || previewState.notebook.open || (!allowMissionLog && previewUI.elements.missionLog.open) || agencyUi?.elements.dialog.open) return false;
    flightInput.reset();
    autoPilotState = createAutopilot(key, flightState.position, target, interactionRadiusFor(object));
    audioDirector.play('autopilot-start');
    siteAnalytics.track('autopilot_event', { objectKey: key, state: 'start' });
    objectHover.hidden = true;
    updateAutopilotDisplay();
    return true;
}

function showObjectHover(key, event) {
    if (!key || autoPilotState || previewState.notebook.open || previewUI.elements.missionLog.open || agencyUi?.elements.dialog.open) {
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
        previewState.learning.quiz.attempts,
        contractState.acceptedContractIds.join(','),
        contractState.completedContractIds.join(','),
        contractJourney.activeContractId ?? 'none',
        contractJourney.phase,
        expeditionState.acceptedChapterIds.join(','),
        expeditionState.completedChapterIds.join(','),
        expeditionJourney.activeChapterId ?? 'none',
        expeditionJourney.phase,
        expeditionFinaleState.status,
        expeditionFinaleState.reviewedIds.join(','),
        localOrbitOpen
    ].join(':');
    if (!force && signature === lastUiSignature) return;
    previewUI.update(previewState, {
        flightState,
        nearbyObjectKey: nearbyWorldObjectKey,
        missions,
        expeditionProgress,
        contractState,
        contractJourney,
        expeditionState,
        expeditionContext: currentExpeditionContext(),
        expeditionJourney,
        expeditionFinaleState,
        nearbyContractIds: CONTRACT_CATALOG.filter((contract) => isOrbitalContractDestinationNearby(contract.id))
            .map((contract) => contract.id)
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
    agencyNowMs = deterministicMode ? agencyNowMs + (seconds * 1000) : Date.now();
    agencyUiElapsed += seconds;
    if (agencyUiElapsed >= 1) {
        syncAgencyState(agencyNowMs);
        agencyUiElapsed = 0;
    }
    lastInput = {
        ...flightInput.sample(),
        movementBasis: paperScene.getNavigationBasis()
    };
    const hasManualInput = Math.abs(lastInput.forward) + Math.abs(lastInput.strafe)
        + Math.abs(lastInput.vertical) + Math.abs(lastInput.yawDelta)
        + Math.abs(lastInput.pitchDelta) + Math.abs(lastInput.roll) > 0.01
        || lastInput.boost || lastInput.brake;
    if (autoPilotState && hasManualInput) cancelAutopilot();
    const dialogOpen = previewState.notebook.open || previewUI.elements.missionLog.open || agencyUi?.elements.dialog.open || localOrbitOpen;
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
                const arrived = arriveContractTravel(contractJourney, autopilotTargetKey);
                if (arrived !== contractJourney) {
                    contractJourney = arrived;
                    syncUI(true);
                    previewUI.openMissionLog('missions');
                } else {
                    const expeditionArrived = arriveExpeditionTravel(expeditionJourney, autopilotTargetKey);
                    if (expeditionArrived !== expeditionJourney) {
                        expeditionJourney = expeditionArrived;
                        syncUI(true);
                        previewUI.openMissionLog('investigation');
                    }
                }
            }
        }
    } else if (!dialogOpen) {
        flightState = stepFlight(flightState, lastInput, seconds, paperScene.getPrimaryBodies());
    }
    // Keep the ship and its destination in the same frame of reference while a
    // panel is open. Otherwise the accelerated orbital clock can move a moon or
    // planet out of interaction range before the player can start the mission.
    paperScene.update(dialogOpen ? 0 : seconds);
    orbitalClockUiElapsed += seconds;
    if (orbitalClockUiElapsed >= 0.25) {
        previewUI.updateOrbitalClock(paperScene.getState().orbitalClock);
        orbitalClockUiElapsed = 0;
    }
    nearbyWorldObjectKey = paperScene.findNearbyWorldObject(flightState.position);
    paperScene.setFlightSnapshot(flightState, seconds);
    const surpriseResult = stepSurpriseDirector(surpriseState, {
        deltaSeconds: seconds,
        speed: Math.hypot(flightState.velocity.x, flightState.velocity.y, flightState.velocity.z),
        distanceFromOrigin: Math.hypot(flightState.position.x, flightState.position.y, flightState.position.z),
        dialogOpen: previewState.notebook.open || previewUI.elements.missionLog.open || agencyUi?.elements.dialog.open || localOrbitOpen
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
    if (localOrbitOpen) return;
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
        mode: localOrbitOpen
            ? `local-mission-${activeExpeditionChapterId ?? activeOrbitContractId}`
            : agencyUi?.elements.dialog.open
                ? 'space-agency'
                : (previewState.notebook.open ? 'notebook' : 'free-flight-360'),
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
        contract: { ...contractState, attempts: contractAttemptState.contractAttempts, journey: contractJourney, localOrbitOpen, activeOrbitContractId, trainingMode: activeOrbitTraining },
        expedition: { ...expeditionState, journey: expeditionJourney, attempts: expeditionAttemptState.contractAttempts, activeExpeditionChapterId },
        agency: {
            open: Boolean(agencyUi?.elements.dialog.open),
            operationIds: livingOperations.map((operation) => operation.id),
            activeMissions: agencyState.activeMissions.map((mission) => ({
                id: mission.id,
                operationId: mission.operationId,
                endsAt: mission.endsAt,
                instrumentId: mission.instrumentId,
                routeProfileId: mission.routeProfileId
            })),
            reports: agencyState.reports.map((report) => ({
                id: report.id,
                operationId: report.operationId,
                quality: report.quality,
                collected: report.collected,
                scienceScore: report.scienceScore
            })),
            science: agencyUi?.getScienceState() ?? null
        },
        orbitalMission: localOrbitHost?.getState() ?? null,
        surprise: { activeId: surpriseState.activeId, seenIds: [...surpriseState.seenIds] },
        autopilot: autoPilotState ? { ...autoPilotState } : null,
        audio: audioDirector.getState(),
        orbitalClock: paperScene.getState().orbitalClock,
        scene: paperScene.getState()
    });
};

window.advanceTime = (milliseconds) => {
    deterministicMode = true;
    agencyUi?.advanceTime(milliseconds);
    if (localOrbitOpen) {
        agencyNowMs += Math.max(0, milliseconds);
        syncAgencyState(agencyNowMs);
        localOrbitHost?.advanceTime(milliseconds);
        paperScene.render();
        return;
    }
    const steps = Math.max(1, Math.round(milliseconds / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) step(1 / 60);
    paperScene.render();
};

window.__paperPreview = {
    getState: () => ({ preview: { ...previewState }, flight: { ...flightState }, progression: progressPresentation, contract: { ...contractState, attempts: contractAttemptState.contractAttempts, localOrbitOpen, activeOrbitContractId }, expedition: { ...expeditionState, journey: expeditionJourney, attempts: expeditionAttemptState.contractAttempts, activeExpeditionChapterId }, agency: { ...agencyState, operations: livingOperations }, scene: paperScene.getState() }),
    explore: handleExplore,
    closeNotebook: handleCloseNotebook,
    selectSection: handleSelectSection,
    answerQuiz: handleAnswerQuiz,
    retryQuiz: handleRetryQuiz,
    acceptContract: handleAcceptContract,
    travelContract: handleTravelContract,
    trainContract: startContractTraining,
    startOrbitalContract,
    completeOrbitalContract: handleOrbitalContractComplete,
    acceptExpeditionChapter: (chapterId) => handleExpeditionAction(chapterId, 'accept'),
    travelExpeditionChapter: (chapterId) => handleExpeditionAction(chapterId, 'travel'),
    startExpeditionChapter,
    completeExpeditionChapter: handleExpeditionChapterComplete,
    acceptIssDelivery: () => handleAcceptContract(ISS_DELIVERY_CONTRACT_ID),
    startIssDelivery: () => startOrbitalContract(ISS_DELIVERY_CONTRACT_ID),
    completeIssDelivery: handleOrbitalContractComplete,
    openAgency: () => agencyUi.open(),
    launchAgencyOperation,
    collectAgencyOperationReport,
    setOrbitalTimeScale: (timeScale) => {
        const clock = paperScene.setOrbitalTimeScale(timeScale);
        previewUI.updateOrbitalClock(clock);
        return clock;
    },
    resetOrbitalTimeToToday: () => {
        const clock = paperScene.resetOrbitalTimeToToday(Date.now());
        previewUI.updateOrbitalClock(clock);
        return clock;
    },
    advanceAgencyTime: (milliseconds) => {
        deterministicMode = true;
        agencyNowMs += Math.max(0, Number(milliseconds) || 0);
        syncAgencyState(agencyNowMs);
        return agencyState;
    },
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
    flightInputMode.destroy();
    flightInput.destroy();
    localOrbitHost?.destroy();
    missionPrefetch.destroy();
    agencyUi?.destroy();
    previewUI.destroy();
    audioDirector.destroy();
    paperScene.destroy();
}, { once: true });

paperScene.update(0);
paperScene.setFlightSnapshot(flightState, 0.1);
syncUI(true);
syncAgencyState(agencyNowMs);
reconcileAndSaveProgress({ feedback: false });
updateMissionNavigation();
previewUI.updateCockpitTelemetry(
    createCockpitTelemetry(flightState, currentNavigation, paperScene.getState().cameraMode),
    currentNavigation
);
previewUI.markReady();
paperScene.render();
hydrateTrackedObjects().catch(() => {});
hydrateDailySky().catch(() => {});
hydrateLivingOperations().catch(() => {});
window.requestAnimationFrame(frame);
