import { PLANETS } from './state.js';

export function createPreviewUI({ onExplore, onCloseNotebook }) {
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
        missionStamp: document.querySelector('#mission-stamp'),
        loading: document.querySelector('.stage-loading')
    };

    const listeners = [
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

    function update(state, { flightState = null } = {}) {
        const fallbackPlanet = PLANETS[state.activeIndex];
        const nearbyKey = flightState?.nearbyPlanetKey ?? fallbackPlanet?.key ?? null;
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
            const notebookPlanet = PLANETS.find((planet) => planet.key === state.notebook.planetKey);
            elements.notebookKicker.textContent = notebookPlanet.kicker;
            elements.notebookTitle.textContent = notebookPlanet.name;
            elements.notebookFact.textContent = notebookPlanet.fact;
            elements.notebookNote.textContent = notebookPlanet.note;
            elements.missionStamp.hidden = !(state.missionComplete && notebookPlanet.key === 'saturn');
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
