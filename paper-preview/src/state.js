import { createLearningState, openLearningRecord } from './learning/learningState.js';
import { getWorldObject, PRIMARY_WORLDS } from './world/worldCatalog.js';

export const PLANETS = Object.freeze(PRIMARY_WORLDS.map((world) => Object.freeze({
    key: world.key,
    name: world.name,
    kicker: world.type === 'star' ? 'A nossa estrela' : 'Mundo do Sistema Solar',
    fact: world.fact,
    note: 'Explora o caderno para comparar medidas, ver uma fotografia real e responder ao desafio.'
})));

export function createPreviewState(progress = {}) {
    return {
        activeIndex: 0,
        objectiveTarget: 'saturn',
        missionComplete: false,
        notebook: { open: false, planetKey: null },
        learning: createLearningState(progress)
    };
}

export function navigate(state, direction) {
    const nextIndex = Math.min(
        PLANETS.length - 1,
        Math.max(0, state.activeIndex + Math.sign(direction))
    );

    return {
        ...state,
        activeIndex: nextIndex,
        notebook: { ...state.notebook }
    };
}

export function exploreActive(state) {
    const activePlanet = PLANETS[state.activeIndex];
    return explorePlanet(state, activePlanet.key);
}

export function explorePlanet(state, planetKey) {
    const planet = getWorldObject(planetKey);
    if (!planet) return state;
    return {
        ...state,
        missionComplete: state.missionComplete || planet.key === state.objectiveTarget,
        notebook: { open: true, planetKey: planet.key },
        learning: openLearningRecord(state.learning, planet.key)
    };
}

export function closeNotebook(state) {
    return {
        ...state,
        notebook: { open: false, planetKey: null }
    };
}
