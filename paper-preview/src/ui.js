import { PLANETS } from './state.js';

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
    onRetryQuiz
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
        if (elements.notebookPhoto.getAttribute('src') !== record.localPhoto) {
            elements.notebookPhoto.src = record.localPhoto;
        }
        elements.notebookPhoto.alt = `Fotografia real de ${record.name}`;
        elements.photoCaption.textContent = `Fotografia real de ${record.name}`;
        elements.photoSource.textContent = record.photoSource.name;
        elements.photoSource.href = record.photoSource.url;
        renderTabs(state.learning.section);
        renderMeasurements(record);
        renderData(state.learning, record);
        renderQuiz(state.learning, record);
    }

    function update(state, { flightState = null } = {}) {
        const fallbackPlanet = PLANETS[state.activeIndex];
        const nearbyKey = flightState
            ? flightState.nearbyPlanetKey
            : (fallbackPlanet?.key ?? null);
        const nearbyPlanet = PLANETS.find((planet) => planet.key === nearbyKey);
        elements.explore.hidden = !nearbyPlanet || state.notebook.open;
        elements.explore.disabled = state.notebook.open;
        elements.notebookTrigger.disabled = !nearbyPlanet || state.notebook.open;
        if (nearbyPlanet) elements.nearbyPlanetName.textContent = `Explorar ${nearbyPlanet.name}`;
        elements.objective.classList.toggle('is-complete', state.missionComplete);
        elements.objectiveText.textContent = state.missionComplete
            ? 'Saturno encontrado — missão cumprida'
            : 'Chega a Saturno';

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

    function destroy() {
        for (const [element, eventName, handler] of listeners) {
            element.removeEventListener(eventName, handler);
        }
    }

    return { update, markReady, destroy, elements };
}
