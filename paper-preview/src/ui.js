import { PLANETS } from './state.js';
import { chooseNearbyObject } from './world/proximity.js';
import { AWARD_CATALOG, evaluateAwards } from './progression/expeditionProgress.js';
import { getAwardArt } from './progression/awardArt.js';
import { presentProgress } from './progression/progressPresentation.js';
import { paperI18n } from './i18n/paperI18n.js';
import { bindBackdropDismiss } from './ui/dialogDismiss.js';
import { createMediaViewer } from './ui/mediaViewer.js';
import { siteAnalytics } from './analytics/siteAnalytics.js';
import { providerFamily } from './analytics/eventCatalog.js';
import { ISS_DELIVERY_CONTRACT_ID, getContractStatus } from './contracts/contractState.js';

/** DOM selectors are runtime-validated by the page structure tests. @type {any} */
const document = globalThis.document;

const numberFormatter = () => new Intl.NumberFormat(paperI18n.language === 'en' ? 'en-GB' : 'pt-PT');

function activeQuiz(record) {
    return record.quizzes[0] ?? null;
}

export function createPreviewUI({
    learningCatalog,
    onExplore,
    onCloseNotebook,
    onSelectSection,
    onAnswerQuiz,
    onRetryQuiz,
    onAcceptContract,
    onStartContract,
    onMissionLogOpen,
    onMissionLogClose,
    onDismissSurprise,
    onZoom,
    onToggleOrbits,
    onSoundToggle
}) {
    const elements = {
        objective: document.querySelector('#objective-chip'),
        objectiveText: document.querySelector('#objective-text'),
        explore: document.querySelector('#explore-nearby'),
        nearbyPlanetName: document.querySelector('#nearby-planet-name'),
        joystick: document.querySelector('#flight-joystick'),
        joystickKnob: document.querySelector('#joystick-knob'),
        notebookTrigger: document.querySelector('#notebook-trigger'),
        notebook: document.querySelector('#field-notebook'),
        closeNotebook: document.querySelector('#close-notebook'),
        notebookKicker: document.querySelector('#notebook-kicker'),
        notebookTitle: document.querySelector('#notebook-title'),
        notebookFact: document.querySelector('#notebook-fact'),
        notebookNote: document.querySelector('#notebook-note'),
        notebookWow: document.querySelector('#notebook-wow'),
        notebookPhoto: document.querySelector('#notebook-photo'),
        notebookPhotoOpen: document.querySelector('#notebook-photo-open'),
        photoCaption: document.querySelector('#notebook-photo-caption'),
        photoSource: document.querySelector('#notebook-photo-source'),
        tabs: [...document.querySelectorAll('.notebook-tabs [role="tab"]')],
        panels: [...document.querySelectorAll('.notebook-panel')],
        measureRadius: document.querySelector('#measure-radius'),
        measureDistance: document.querySelector('#measure-distance'),
        measureDay: document.querySelector('#measure-day'),
        measureYear: document.querySelector('#measure-year'),
        measureTemperature: document.querySelector('#measure-temperature'),
        measureMoons: document.querySelector('#measure-moons'),
        dataStatus: document.querySelector('#data-status'),
        dataUpdated: document.querySelector('#data-updated'),
        dataSummary: document.querySelector('#data-summary'),
        dataSource: document.querySelector('#data-source'),
        quizQuestion: document.querySelector('#quiz-question'),
        quizOptions: document.querySelector('#quiz-options'),
        quizFeedback: document.querySelector('#quiz-feedback'),
        quizRetry: document.querySelector('#quiz-retry'),
        missionStamp: document.querySelector('#mission-stamp'),
        loading: document.querySelector('.stage-loading')
        , navBeacon: document.querySelector('#nav-beacon')
        , navArrow: document.querySelector('#nav-arrow')
        , navTarget: document.querySelector('#nav-target')
        , navDistance: document.querySelector('#nav-distance')
         , navScience: document.querySelector('#nav-science')
         , missionLog: document.querySelector('#mission-log')
         , missionLogBody: document.querySelector('#mission-log > article')
         , closeMissionLog: document.querySelector('#close-mission-log')
        , missionList: document.querySelector('#mission-list')
        , apodCard: document.querySelector('#apod-card')
        , apodImage: document.querySelector('#apod-image')
        , apodTitle: document.querySelector('#apod-title')
        , apodDate: document.querySelector('#apod-date')
        , zoomOut: document.querySelector('#zoom-out')
        , zoomCockpit: document.querySelector('#zoom-cockpit')
        , zoomIn: document.querySelector('#zoom-in')
        , orbitToggle: document.querySelector('#orbit-toggle')
        , soundToggle: document.querySelector('#sound-toggle')
        , passportLevel: document.querySelector('#passport-level')
        , passportXp: document.querySelector('#passport-xp')
        , passportProgress: document.querySelector('#passport-progress')
        , rankChip: document.querySelector('#rank-chip')
        , rankTitle: document.querySelector('#rank-title')
        , rankXp: document.querySelector('#rank-xp')
        , rankProgress: document.querySelector('#rank-progress')
        , passportTabs: [...document.querySelectorAll('[data-passport-section]')]
        , passportPanels: [...document.querySelectorAll('[data-passport-panel]')]
        , collectionGrid: document.querySelector('#collection-grid')
        , awardsGrid: document.querySelector('#awards-grid')
        , lumiTransmission: document.querySelector('#lumi-transmission')
        , lumiTitle: document.querySelector('#lumi-title')
        , lumiMessage: document.querySelector('#lumi-message')
        , dismissLumi: document.querySelector('#dismiss-lumi')
        , cockpitInstruments: document.querySelector('#cockpit-instruments')
        , cockpitSpeed: document.querySelector('#cockpit-speed')
        , cockpitSpeedNeedle: document.querySelector('#cockpit-speed-needle')
        , cockpitTarget: document.querySelector('#cockpit-target')
        , cockpitRadarTarget: document.querySelector('#cockpit-radar-target')
        , cockpitX: document.querySelector('#cockpit-x')
        , cockpitY: document.querySelector('#cockpit-y')
        , cockpitZ: document.querySelector('#cockpit-z')
        , cockpitHorizon: document.querySelector('#cockpit-horizon')
        , cockpitYaw: document.querySelector('#cockpit-yaw')
        , cockpitPitch: document.querySelector('#cockpit-pitch')
        , cockpitRoll: document.querySelector('#cockpit-roll')
        , rewardToast: document.querySelector('#reward-toast')
        , rewardToastIcon: document.querySelector('#reward-toast-icon')
        , rewardToastKicker: document.querySelector('#reward-toast-kicker')
        , rewardToastTitle: document.querySelector('#reward-toast-title')
        , rewardToastMessage: document.querySelector('#reward-toast-message')
        , languageToggle: document.querySelector('[data-language-toggle]')
        , mediaViewer: document.querySelector('#media-viewer')
        , issContractCard: document.querySelector('#iss-contract-card')
        , issContractStatus: document.querySelector('#iss-contract-status')
        , issContractAction: document.querySelector('#iss-contract-action')
    };

    let lumiTimer = null;
    let rewardTimer = null;
    let activeMedia = null;
    let audioState = { enabled: true, unlocked: false };
    const mediaViewer = createMediaViewer(elements.mediaViewer, {
        onImageOpen: (media) => siteAnalytics.track('image_open', { objectKey: media.objectKey, surface: 'game' }),
        onSourceOpen: (media) => siteAnalytics.track('source_open', {
            objectKey: media.objectKey,
            provider: providerFamily(media.source?.name),
            surface: 'game'
        })
    });

    function renderLanguageToggle() {
        elements.languageToggle.textContent = paperI18n.language === 'pt' ? 'EN' : 'PT';
        elements.languageToggle.setAttribute('aria-label', paperI18n.t('shared.switchTo'));
        updateAudioState(audioState);
    }
    const unsubscribeLanguage = paperI18n.subscribe(renderLanguageToggle);
    renderLanguageToggle();

    function hideSurprise() {
        if (lumiTimer) window.clearTimeout(lumiTimer);
        lumiTimer = null;
        elements.lumiTransmission.hidden = true;
        onDismissSurprise();
    }

    const handleTabClick = (event) => {
        const tab = event.target.closest('[data-section]');
        if (tab) onSelectSection(tab.dataset.section);
    };
    const handleQuizClick = (event) => {
        const option = event.target.closest('[data-quiz-index]');
        if (option) onAnswerQuiz(Number(option.dataset.quizIndex));
    };
    function selectPassportSection(section) {
        elements.passportTabs.forEach((candidate) => {
            const selected = candidate.dataset.passportSection === section;
            candidate.setAttribute('aria-selected', String(selected));
            candidate.tabIndex = selected ? 0 : -1;
        });
        elements.passportPanels.forEach((panel) => {
            panel.hidden = panel.dataset.passportPanel !== section;
        });
    }

    function openMissionLog(section) {
        selectPassportSection(section);
        elements.missionLog.showModal();
        elements.missionLogBody.scrollTop = 0;
        onMissionLogOpen();
    }

    function closeMissionLog() {
        if (elements.missionLog.open) elements.missionLog.close();
        onMissionLogClose();
    }

    const listeners = [
        [elements.explore, 'click', onExplore],
        [elements.notebookTrigger, 'click', onExplore],
        [elements.closeNotebook, 'click', onCloseNotebook],
        [elements.notebook, 'cancel', (event) => {
            event.preventDefault();
            onCloseNotebook();
        }],
        [elements.tabs[0].parentElement, 'click', handleTabClick],
        [elements.quizOptions, 'click', handleQuizClick],
        [elements.quizRetry, 'click', onRetryQuiz]
        , [elements.issContractAction, 'click', () => {
            if (elements.issContractAction.dataset.contractAction === 'accept') onAcceptContract();
            else if (elements.issContractAction.dataset.contractAction === 'start') {
                closeMissionLog();
                onStartContract();
            }
        }]
        , [elements.objective, 'click', () => openMissionLog('missions')]
        , [elements.rankChip, 'click', () => openMissionLog('awards')]
        , [elements.closeMissionLog, 'click', closeMissionLog]
        , [elements.missionLog, 'cancel', () => onMissionLogClose()]
        , [elements.zoomOut, 'click', () => onZoom('out')]
        , [elements.zoomCockpit, 'click', () => onZoom('cockpit')]
        , [elements.zoomIn, 'click', () => onZoom('in')]
        , [elements.orbitToggle, 'click', () => {
            const visible = onToggleOrbits();
            elements.orbitToggle.setAttribute('aria-pressed', String(visible));
        }]
        , [elements.soundToggle, 'click', () => updateAudioState(onSoundToggle())]
        , [elements.passportTabs[0].parentElement, 'click', (event) => {
            const tab = event.target.closest('[data-passport-section]');
            if (!tab) return;
            selectPassportSection(tab.dataset.passportSection);
        }]
        , [elements.dismissLumi, 'click', hideSurprise]
        , [elements.languageToggle, 'click', () => paperI18n.toggle()]
        , [elements.notebookPhotoOpen, 'click', () => {
            if (activeMedia) mediaViewer.open({ ...activeMedia, trigger: elements.notebookPhotoOpen });
        }]
        , [elements.photoSource, 'click', () => {
            if (activeMedia) siteAnalytics.track('source_open', {
                objectKey: activeMedia.objectKey,
                provider: providerFamily(activeMedia.source?.name),
                surface: 'game'
            });
        }]
    ];

    for (const [element, eventName, handler] of listeners) {
        element.addEventListener(eventName, handler);
    }
    const unbindNotebookBackdrop = bindBackdropDismiss(elements.notebook, onCloseNotebook);
    const unbindMissionBackdrop = bindBackdropDismiss(elements.missionLog, closeMissionLog);

    function renderTabs(section) {
        elements.tabs.forEach((tab) => {
            const selected = tab.dataset.section === section;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        elements.panels.forEach((panel) => {
            panel.hidden = panel.id !== `panel-${section}`;
        });
    }

    function renderMeasurements(record) {
        const measurements = record.measurements;
        const formatter = numberFormatter();
        elements.measureRadius.textContent = `${formatter.format(measurements.radiusKm)} km`;
        elements.measureDistance.textContent = measurements.distanceMillionKm === 0
            ? paperI18n.t('game.measure.center')
            : paperI18n.t('game.measure.millionKm', { value: formatter.format(measurements.distanceMillionKm) });
        elements.measureDay.textContent = measurements.dayLength;
        elements.measureYear.textContent = measurements.yearLength;
        elements.measureTemperature.textContent = measurements.temperature;
        elements.measureMoons.textContent = formatter.format(measurements.moonCount);
    }

    function renderData(learning, record) {
        const envelope = learning.dataByObject[record.key];
        const status = envelope?.status ?? 'fallback';
        const labels = { live: paperI18n.t('game.data.live'), cached: paperI18n.t('game.data.cached'), fallback: paperI18n.t('game.data.included') };
        elements.dataStatus.textContent = envelope?.presentationKind === 'reference'
            ? paperI18n.t('game.data.reference')
            : labels[status];
        elements.dataStatus.className = `data-status is-${status}`;
        elements.dataUpdated.textContent = envelope
            ? paperI18n.t('game.data.updated', { value: new Date(envelope.updatedAt).toLocaleString(paperI18n.language === 'en' ? 'en-GB' : 'pt-PT') })
            : '';
        elements.dataSummary.textContent = envelope?.data?.summary
            ?? `${record.fact} A atualização científica online será acrescentada sem substituir estes dados incluídos.`;
        elements.dataSource.textContent = envelope?.source?.name ?? record.photoSource.name;
        elements.dataSource.href = envelope?.source?.url ?? record.photoSource.url;
    }

    function renderQuiz(learning, record) {
        const quiz = activeQuiz(record);
        elements.quizOptions.replaceChildren();
        if (!quiz) {
            elements.quizQuestion.textContent = paperI18n.t('game.quiz.none');
            elements.quizFeedback.hidden = true;
            elements.quizRetry.hidden = true;
            return;
        }

        elements.quizQuestion.textContent = quiz.question;
        quiz.options.forEach((optionText, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.quizIndex = String(index);
            button.textContent = optionText;
            const answered = learning.quiz.status !== 'idle' && learning.quiz.quizId === quiz.id;
            button.disabled = answered;
            if (answered && index === learning.quiz.selectedIndex) button.classList.add('is-selected');
            if (answered && index === quiz.correctIndex) button.classList.add('is-correct');
            if (answered && learning.quiz.status === 'wrong' && index === learning.quiz.selectedIndex) {
                button.classList.add('is-wrong');
            }
            elements.quizOptions.append(button);
        });

        const answered = learning.quiz.status !== 'idle' && learning.quiz.quizId === quiz.id;
        elements.quizFeedback.hidden = !answered;
        elements.quizFeedback.textContent = answered
            ? `${paperI18n.t(learning.quiz.status === 'correct' ? 'game.quiz.correct' : 'game.quiz.wrong')} ${learning.quiz.explanation}`
            : '';
        elements.quizRetry.hidden = learning.quiz.status !== 'wrong';
    }

    function renderLearning(state, record) {
        elements.notebookKicker.textContent = record.type;
        elements.notebookTitle.textContent = record.name;
        elements.notebookFact.textContent = record.fact;
        elements.notebookNote.textContent = record.comparison;
        elements.notebookWow.textContent = record.wowFacts[0];
        const photoUrl = record.localPhoto;
        if (elements.notebookPhoto.getAttribute('src') !== photoUrl) {
            elements.notebookPhoto.src = photoUrl;
        }
        elements.notebookPhoto.alt = paperI18n.t('game.photo.real', { name: record.name });
        elements.photoCaption.textContent = paperI18n.t('game.photo.real', { name: record.name });
        elements.photoSource.textContent = record.photoSource.name;
        elements.photoSource.href = record.photoSource.url;
        activeMedia = {
            objectKey: record.key,
            src: photoUrl,
            alt: elements.notebookPhoto.alt,
            caption: elements.photoCaption.textContent,
            source: {
                name: elements.photoSource.textContent,
                url: elements.photoSource.href
            }
        };
        renderTabs(state.learning.section);
        renderMeasurements(record);
        renderData(state.learning, record);
        renderQuiz(state.learning, record);
    }

    function renderProgression(state, missions, expeditionProgress) {
        const progressView = presentProgress(expeditionProgress, {
            ...state.learning,
            completedMissionIds: missions?.completedIds ?? []
        }, paperI18n.language);
        const rankLabel = paperI18n.t('game.level', { level: progressView.level, title: progressView.title });
        elements.passportLevel.textContent = rankLabel;
        elements.passportXp.textContent = `${progressView.xp} XP`;
        elements.passportProgress.value = progressView.progressPercent / 100;
        elements.rankTitle.textContent = rankLabel;
        elements.rankXp.textContent = `${progressView.xp} XP`;
        elements.rankProgress.value = progressView.progressPercent;
        elements.rankChip.setAttribute('aria-label', `${rankLabel} · ${progressView.xp} XP`);

        const discovered = new Set(state.learning.discoveredKeys);
        elements.collectionGrid.replaceChildren(...Object.values(learningCatalog).map((record) => {
            const unlocked = discovered.has(record.key);
            const card = document.createElement('article');
            card.className = `collection-card${unlocked ? ' is-unlocked' : ''}`;
            const icon = document.createElement('span');
            icon.textContent = unlocked ? (record.type === 'Lua' ? '☾' : record.type === 'Planeta' ? '●' : '✦') : '?';
            const copy = document.createElement('div');
            const name = document.createElement('strong');
            name.textContent = unlocked ? record.name : paperI18n.t('game.collection.locked');
            const type = document.createElement('small');
            type.textContent = unlocked ? record.type : paperI18n.t('game.collection.hint');
            copy.append(name, type);
            card.append(icon, copy);
            return card;
        }));

        const unlockedAwards = new Set(evaluateAwards({
            ...state.learning,
            completedMissionIds: missions?.completedIds ?? []
        }, paperI18n.language).map((award) => award.id));
        elements.awardsGrid.replaceChildren(...AWARD_CATALOG.map((award) => {
            const unlocked = unlockedAwards.has(award.id);
            const localizedTitle = paperI18n.language === 'en' ? award.titleEn : award.title;
            const localizedDescription = paperI18n.language === 'en' ? award.descriptionEn : award.description;
            const card = document.createElement('article');
            card.className = `award-card${unlocked ? ' is-unlocked' : ''}`;
            const medal = document.createElement('img');
            medal.src = getAwardArt(award.id);
            medal.alt = '';
            medal.width = 96;
            medal.height = 96;
            medal.loading = 'lazy';
            medal.classList.toggle('is-locked', !unlocked);
            const copy = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = localizedTitle;
            const description = document.createElement('small');
            description.textContent = unlocked ? localizedDescription : `${localizedDescription} · ${paperI18n.t('game.awards.locked')}`;
            copy.append(title, description);
            card.append(medal, copy);
            return card;
        }));
    }

    function renderContract(state, destinationNearby, contractState) {
        const status = getContractStatus(contractState, ISS_DELIVERY_CONTRACT_ID, state.learning);
        elements.issContractCard.hidden = status === 'locked';
        if (status === 'locked') return status;
        elements.issContractStatus.textContent = paperI18n.t(`game.contract.${status}`);
        elements.issContractCard.dataset.status = status;
        elements.issContractAction.disabled = false;
        if (status === 'available') {
            elements.issContractAction.dataset.contractAction = 'accept';
            elements.issContractAction.textContent = paperI18n.t('game.contract.iss.accept');
        } else if (status === 'accepted' && destinationNearby) {
            elements.issContractAction.dataset.contractAction = 'start';
            elements.issContractAction.textContent = paperI18n.t('game.contract.iss.start');
        } else if (status === 'accepted') {
            elements.issContractAction.dataset.contractAction = 'travel';
            elements.issContractAction.textContent = paperI18n.t('game.contract.travel');
            elements.issContractAction.disabled = true;
        } else {
            elements.issContractAction.dataset.contractAction = 'complete';
            elements.issContractAction.textContent = paperI18n.t('game.contract.complete');
            elements.issContractAction.disabled = true;
        }
        return status;
    }

    function update(state, { flightState = null, nearbyObjectKey = null, missions = null, expeditionProgress = null, contractState = null, contractDestinationNearby = false } = {}) {
        const fallbackPlanet = PLANETS[state.activeIndex];
        const nearbyKey = flightState
            ? chooseNearbyObject(flightState.nearbyPlanetKey, nearbyObjectKey)
            : (fallbackPlanet?.key ?? null);
        const nearbyPlanet = nearbyKey
            ? (learningCatalog[nearbyKey] ?? PLANETS.find((planet) => planet.key === nearbyKey))
            : null;
        elements.explore.hidden = !nearbyPlanet || state.notebook.open;
        elements.explore.disabled = state.notebook.open;
        elements.notebookTrigger.disabled = !nearbyPlanet || state.notebook.open;
        const contractStatus = renderContract(state, contractDestinationNearby, contractState);
        if (nearbyPlanet) {
            elements.nearbyPlanetName.textContent = contractDestinationNearby && contractStatus === 'accepted'
                ? paperI18n.t('game.contract.iss.start')
                : paperI18n.t('game.explore', { name: nearbyPlanet.name });
        }
        const activeMission = missions?.active;
        elements.objective.classList.toggle('is-complete', !activeMission);
        elements.objectiveText.textContent = activeMission
            ? `${activeMission.title} · ${activeMission.progress.current}/${activeMission.progress.total}`
            : paperI18n.t('game.missions.all');
        if (missions) {
            elements.missionList.replaceChildren(...missions.missions.map((mission) => {
                const item = document.createElement('li');
                item.classList.toggle('is-complete', mission.complete);
                const copy = document.createElement('div');
                const title = document.createElement('strong');
                title.textContent = mission.title;
                const description = document.createElement('p');
                description.textContent = mission.description;
                copy.append(title, description);
                const progress = document.createElement('progress');
                progress.max = mission.progress.total;
                progress.value = mission.progress.current;
                progress.setAttribute('aria-label', `${mission.progress.current} de ${mission.progress.total}`);
                item.append(copy, progress);
                return item;
            }));
            renderProgression(state, missions, expeditionProgress);
        }

        if (state.notebook.open) {
            const record = learningCatalog[state.notebook.planetKey];
            renderLearning(state, record);
            elements.missionStamp.hidden = !(state.missionComplete && record.key === 'saturn');
            if (!elements.notebook.open) elements.notebook.showModal();
        } else if (elements.notebook.open) {
            elements.notebook.close();
            (elements.explore.hidden ? elements.notebookTrigger : elements.explore).focus({ preventScroll: true });
        }
    }

    function markReady() {
        elements.loading?.remove();
    }

    function updateNavigation(navigation) {
        elements.navBeacon.hidden = !navigation;
        if (!navigation) return;
        elements.navTarget.textContent = navigation.name;
        elements.navDistance.textContent = navigation.distanceLabel;
        elements.navScience.textContent = navigation.scientificLabel;
        elements.navArrow.style.transform = `rotate(${navigation.angleRadians}rad)`;
    }

    function setApod(envelope) {
        if (!envelope?.data?.imageUrl) return;
        elements.apodImage.src = envelope.data.imageUrl;
        elements.apodTitle.textContent = envelope.data.title;
        elements.apodDate.textContent = `${envelope.data.date || (paperI18n.language === 'en' ? 'Today' : 'Hoje')} · ${envelope.status === 'live' ? (paperI18n.language === 'en' ? 'NASA live' : 'NASA ao vivo') : (paperI18n.language === 'en' ? 'included/cache' : 'incluído/cache')}`;
        elements.apodCard.hidden = false;
    }

    function showSurprise(event) {
        elements.lumiTitle.textContent = event.title;
        elements.lumiMessage.textContent = event.message;
        elements.lumiTransmission.hidden = false;
        if (lumiTimer) window.clearTimeout(lumiTimer);
        lumiTimer = window.setTimeout(hideSurprise, 14_000);
    }

    function showProgressFeedback(delta) {
        if (!delta || (!delta.xpGained && !delta.leveledUp && !delta.newAwards?.length)) return;
        const award = delta.newAwards?.[0] ?? null;
        elements.rewardToastIcon.textContent = award ? '' : (delta.leveledUp ? '✦' : '+');
        elements.rewardToastIcon.style.backgroundImage = award ? `url(${getAwardArt(award.id)})` : '';
        if (award) {
            elements.rewardToastKicker.textContent = paperI18n.t('game.progress.award');
            elements.rewardToastTitle.textContent = award.title;
            elements.rewardToastMessage.textContent = `${award.description}${delta.xpGained ? ` · +${delta.xpGained} XP` : ''}`;
        } else if (delta.leveledUp) {
            elements.rewardToastKicker.textContent = paperI18n.t('game.progress.levelUp');
            elements.rewardToastTitle.textContent = paperI18n.t('game.level', delta.newLevel);
            elements.rewardToastMessage.textContent = delta.xpGained ? `+${delta.xpGained} XP` : paperI18n.t('game.progress.keep');
        } else {
            elements.rewardToastKicker.textContent = paperI18n.t('game.progress.saved');
            elements.rewardToastTitle.textContent = `+${delta.xpGained} XP`;
            elements.rewardToastMessage.textContent = paperI18n.t('game.progress.keep');
        }
        if (rewardTimer) window.clearTimeout(rewardTimer);
        window.setTimeout(() => {
            elements.rewardToast.hidden = false;
            if (typeof elements.rewardToast.showPopover === 'function' && !elements.rewardToast.matches(':popover-open')) {
                elements.rewardToast.showPopover();
            }
        }, 0);
        rewardTimer = window.setTimeout(() => {
            if (typeof elements.rewardToast.hidePopover === 'function' && elements.rewardToast.matches(':popover-open')) {
                elements.rewardToast.hidePopover();
            }
            elements.rewardToast.hidden = true;
        }, 5_500);
    }

    function updateAudioState(nextState) {
        audioState = { ...audioState, ...nextState };
        elements.soundToggle.setAttribute('aria-pressed', String(audioState.enabled));
        elements.soundToggle.classList.toggle('is-muted', !audioState.enabled);
        elements.soundToggle.classList.toggle('is-unlocked', audioState.unlocked);
        elements.soundToggle.setAttribute('aria-label', paperI18n.t(audioState.enabled ? 'game.audio.mute' : 'game.audio.enable'));
    }

    function updateCockpitTelemetry(telemetry, navigation) {
        elements.cockpitInstruments.hidden = !telemetry.visible;
        document.body.classList.toggle('is-cockpit', telemetry.visible);
        if (!telemetry.visible) return;
        elements.cockpitSpeed.textContent = telemetry.speed.toFixed(1);
        elements.cockpitSpeedNeedle.style.transform = `rotate(${telemetry.speedNeedleDeg}deg)`;
        elements.cockpitTarget.textContent = navigation?.name ?? '—';
        elements.cockpitRadarTarget.style.left = `${telemetry.radar.xPercent}%`;
        elements.cockpitRadarTarget.style.top = `${telemetry.radar.yPercent}%`;
        elements.cockpitX.textContent = telemetry.coordinates.x;
        elements.cockpitY.textContent = telemetry.coordinates.y;
        elements.cockpitZ.textContent = telemetry.coordinates.z;
        elements.cockpitHorizon.style.transform = `translateY(${telemetry.horizonOffsetPercent}%) rotate(${-telemetry.rollDeg}deg)`;
        elements.cockpitYaw.textContent = `${telemetry.yawDeg}°`;
        elements.cockpitPitch.textContent = `${telemetry.pitchDeg}°`;
        elements.cockpitRoll.textContent = `${telemetry.rollDeg}°`;
    }

    function destroy() {
        if (lumiTimer) window.clearTimeout(lumiTimer);
        if (rewardTimer) window.clearTimeout(rewardTimer);
        unsubscribeLanguage();
        mediaViewer.destroy();
        unbindNotebookBackdrop();
        unbindMissionBackdrop();
        for (const [element, eventName, handler] of listeners) {
            element.removeEventListener(eventName, handler);
        }
    }

    return { update, updateNavigation, updateCockpitTelemetry, updateAudioState, setApod, showSurprise, showProgressFeedback, closeMissionLog, markReady, destroy, elements };
}
