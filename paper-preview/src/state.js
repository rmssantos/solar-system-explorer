export const PLANETS = Object.freeze([
    Object.freeze({
        key: 'sun',
        name: 'Sol',
        kicker: 'A nossa estrela',
        fact: 'A luz do Sol demora cerca de 8 minutos e 20 segundos a chegar à Terra.',
        note: 'É uma estrela, não um planeta. No diorama, o seu brilho parece papel vegetal iluminado.'
    }),
    Object.freeze({
        key: 'earth',
        name: 'Terra',
        kicker: 'O planeta azul',
        fact: 'A Terra completa uma volta ao Sol em aproximadamente 365 dias e 6 horas.',
        note: 'Água líquida, atmosfera protetora e a distância certa ao Sol tornam a Terra especial.'
    }),
    Object.freeze({
        key: 'saturn',
        name: 'Saturno',
        kicker: 'O mundo dos anéis',
        fact: 'Os anéis são feitos de incontáveis fragmentos de gelo e rocha.',
        note: 'Apesar do tamanho, Saturno é o planeta menos denso do Sistema Solar.'
    })
]);

export function createPreviewState() {
    return {
        activeIndex: 0,
        objectiveTarget: 'saturn',
        missionComplete: false,
        notebook: { open: false, planetKey: null },
        learning: createLearningState()
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
    const planet = PLANETS.find((candidate) => candidate.key === planetKey);
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
import { createLearningState, openLearningRecord } from './learning/learningState.js';
