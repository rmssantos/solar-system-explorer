import { PLANETS } from './state.js';
import { chooseNearbyObject } from './world/proximity.js';

const numberFormatter = new Intl.NumberFormat('pt-PT');

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
    onMissionLogOpen,
    onMissionLogClose,
    onZoom
}) {
    const elements = {
        objective: document.querySelector('#objective-chip'),
        objectiveText: document.querySelector('#objective-text'),
        explore: document.querySelector('#explore-nearby'),
        nearbyPlanetName: document.querySelector('#nearby-planet-name'),
        joystick: document.querySelector('#flight-joystick'),
        joystickKnob: document.querySelector('#joystick-knob'),
        upButton: document.querySelector('#flight-up'),
        downButton: document.querySelector('#flight-down'),
        boostButton: document.querySelector('#flight-boost'),
        notebookTrigger: document.querySelector('#notebook-trigger'),
        notebook: document.querySelector('#field-notebook'),
        closeNotebook: document.querySelector('#close-notebook'),
        notebookKicker: document.querySelector('#notebook-kicker'),
        notebookTitle: document.querySelector('#notebook-title'),
        notebookFact: document.querySelector('#notebook-fact'),
        notebookNote: document.querySelector('#notebook-note'),
        notebookWow: document.querySelector('#notebook-wow'),
        notebookPhoto: document.querySelector('#notebook-photo'),
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
        , missionLog: document.querySelector('#mission-log')
        , closeMissionLog: document.querySelector('#close-mission-log')
        , missionList: document.querySelector('#mission-list')
        , apodCard: document.querySelector('#apod-card')
        , apodImage: document.querySelector('#apod-image')
        , apodTitle: document.querySelector('#apod-title')
        , apodDate: document.querySelector('#apod-date')
        , zoomOut: document.querySelector('#zoom-out')
        , zoomCockpit: document.querySelector('#zoom-cockpit')
        , zoomIn: document.querySelector('#zoom-in')
    };

    const handleTabClick = (event) => {
        const tab = event.target.closest('[data-section]');
        if (tab) onSelectSection(tab.dataset.section);
    };
    const handleQuizClick = (event) => {
        const option = event.target.closest('[data-quiz-index]');
        if (option) onAnswerQuiz(Number(option.dataset.quizIndex));
    };
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
        , [elements.objective, 'click', () => {
            elements.missionLog.showModal();
            onMissionLogOpen();
        }]
        , [elements.closeMissionLog, 'click', () => {
            elements.missionLog.close();
            onMissionLogClose();
        }]
        , [elements.missionLog, 'cancel', () => onMissionLogClose()]
        , [elements.zoomOut, 'click', () => onZoom('out')]
        , [elements.zoomCockpit, 'click', () => onZoom('cockpit')]
        , [elements.zoomIn, 'click', () => onZoom('in')]
    ];

    for (const [element, eventName, handler] of listeners) {
        element.addEventListener(eventName, handler);
    }

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
        elements.measureRadius.textContent = `${numberFormatter.format(measurements.radiusKm)} km`;
        elements.measureDistance.textContent = measurements.distanceMillionKm === 0
            ? 'Centro do Sistema Solar'
            : `${numberFormatter.format(measurements.distanceMillionKm)} milhões km`;
        elements.measureDay.textContent = measurements.dayLength;
        elements.measureYear.textContent = measurements.yearLength;
        elements.measureTemperature.textContent = measurements.temperature;
        elements.measureMoons.textContent = numberFormatter.format(measurements.moonCount);
    }

    function renderData(learning, record) {
        const envelope = learning.dataByObject[record.key];
        const status = envelope?.status ?? 'fallback';
        const labels = { live: 'Ao vivo', cached: 'Cache recente', fallback: 'Dados incluídos' };
        elements.dataStatus.textContent = labels[status];
        elements.dataStatus.className = `data-status is-${status}`;
        elements.dataUpdated.textContent = envelope
            ? `Atualizado ${new Date(envelope.updatedAt).toLocaleString('pt-PT')}`
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
            elements.quizQuestion.textContent = 'Ainda não há desafio para este objeto.';
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
            ? `${learning.quiz.status === 'correct' ? 'Certo! ' : 'Ainda não. '}${learning.quiz.explanation}`
            : '';
        elements.quizRetry.hidden = learning.quiz.status !== 'wrong';
    }

    function renderLearning(state, record) {
        elements.notebookKicker.textContent = record.type;
        elements.notebookTitle.textContent = record.name;
        elements.notebookFact.textContent = record.fact;
        elements.notebookNote.textContent = record.comparison;
        elements.notebookWow.textContent = record.wowFacts[0];
        const dynamicPhoto = state.learning.dataByObject[record.key]?.data?.imageUrl;
        const photoUrl = dynamicPhoto ?? record.localPhoto;
        if (elements.notebookPhoto.getAttribute('src') !== photoUrl) {
            elements.notebookPhoto.src = photoUrl;
        }
        elements.notebookPhoto.alt = `Fotografia real de ${record.name}`;
        elements.photoCaption.textContent = state.learning.dataByObject[record.key]?.data?.imageTitle
            ?? `Fotografia real de ${record.name}`;
        const dynamicSource = state.learning.dataByObject[record.key]?.data;
        elements.photoSource.textContent = dynamicSource?.imageSourceName ?? record.photoSource.name;
        elements.photoSource.href = dynamicSource?.imageSourceUrl ?? record.photoSource.url;
        renderTabs(state.learning.section);
        renderMeasurements(record);
        renderData(state.learning, record);
        renderQuiz(state.learning, record);
    }

    function update(state, { flightState = null, nearbyObjectKey = null, missions = null } = {}) {
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
        if (nearbyPlanet) elements.nearbyPlanetName.textContent = `Explorar ${nearbyPlanet.name}`;
        const activeMission = missions?.active;
        elements.objective.classList.toggle('is-complete', !activeMission);
        elements.objectiveText.textContent = activeMission
            ? `${activeMission.title} · ${activeMission.progress.current}/${activeMission.progress.total}`
            : 'Todas as missões cumpridas';
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
        elements.navDistance.textContent = navigation.distance < 1.5
            ? 'Ao alcance'
            : `${Math.round(navigation.distance)} unidades`;
        elements.navArrow.style.transform = `rotate(${navigation.angleRadians}rad)`;
    }

    function setApod(envelope) {
        if (!envelope?.data?.imageUrl) return;
        elements.apodImage.src = envelope.data.imageUrl;
        elements.apodTitle.textContent = envelope.data.title;
        elements.apodDate.textContent = `${envelope.data.date || 'Hoje'} · ${envelope.status === 'live' ? 'NASA ao vivo' : 'incluído/cache'}`;
        elements.apodCard.hidden = false;
    }

    function destroy() {
        for (const [element, eventName, handler] of listeners) {
            element.removeEventListener(eventName, handler);
        }
    }

    return { update, updateNavigation, setApod, markReady, destroy, elements };
}
