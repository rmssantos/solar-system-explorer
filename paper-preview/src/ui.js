import { PLANETS } from './state.js';

export function createPreviewUI({ onNavigate, onExplore, onCloseNotebook }) {
    const elements = {
        objective: document.querySelector('#objective-chip'),
        objectiveText: document.querySelector('#objective-text'),
        previous: document.querySelector('#previous-planet'),
        next: document.querySelector('#next-planet'),
        explore: document.querySelector('#explore-planet'),
        planetName: document.querySelector('#active-planet-name'),
        notebookTrigger: document.querySelector('#notebook-trigger'),
        notebook: document.querySelector('#field-notebook'),
        closeNotebook: document.querySelector('#close-notebook'),
        notebookKicker: document.querySelector('#notebook-kicker'),
        notebookTitle: document.querySelector('#notebook-title'),
        notebookFact: document.querySelector('#notebook-fact'),
        notebookNote: document.querySelector('#notebook-note'),
        missionStamp: document.querySelector('#mission-stamp'),
        loading: document.querySelector('.stage-loading')
    };

    const listeners = [
        [elements.previous, 'click', () => onNavigate(-1)],
        [elements.next, 'click', () => onNavigate(1)],
        [elements.explore, 'click', onExplore],
        [elements.notebookTrigger, 'click', onExplore],
        [elements.closeNotebook, 'click', onCloseNotebook],
        [elements.notebook, 'cancel', (event) => {
            event.preventDefault();
            onCloseNotebook();
        }]
    ];

    for (const [element, eventName, handler] of listeners) {
        element.addEventListener(eventName, handler);
    }

    function update(state) {
        const activePlanet = PLANETS[state.activeIndex];
        elements.planetName.textContent = activePlanet.name;
        elements.previous.disabled = state.activeIndex === 0 || state.notebook.open;
        elements.next.disabled = state.activeIndex === PLANETS.length - 1 || state.notebook.open;
        elements.explore.disabled = state.notebook.open;
        elements.objective.classList.toggle('is-complete', state.missionComplete);
        elements.objectiveText.textContent = state.missionComplete
            ? 'Saturno encontrado — missão cumprida'
            : 'Chega a Saturno';

        if (state.notebook.open) {
            const notebookPlanet = PLANETS.find((planet) => planet.key === state.notebook.planetKey);
            elements.notebookKicker.textContent = notebookPlanet.kicker;
            elements.notebookTitle.textContent = notebookPlanet.name;
            elements.notebookFact.textContent = notebookPlanet.fact;
            elements.notebookNote.textContent = notebookPlanet.note;
            elements.missionStamp.hidden = !(state.missionComplete && notebookPlanet.key === 'saturn');
            if (!elements.notebook.open) elements.notebook.showModal();
        } else if (elements.notebook.open) {
            elements.notebook.close();
            elements.explore.focus({ preventScroll: true });
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
