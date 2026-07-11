function mission(value) {
    return Object.freeze({
        ...value,
        discover: Object.freeze(value.discover ?? []),
        quizzes: Object.freeze(value.quizzes ?? [])
    });
}

export const MISSION_CATALOG = Object.freeze([
    mission({ id: 'rings-route', title: 'Rota dos anéis', description: 'Voa até Saturno e abre o caderno.', discover: ['saturn'] }),
    mission({ id: 'inner-worlds', title: 'Mundos interiores', description: 'Descobre Mercúrio, Vénus, Terra e Marte.', discover: ['mercury', 'venus', 'earth', 'mars'] }),
    mission({ id: 'moon-oceans', title: 'Oceanos escondidos', description: 'Visita a Lua, Europa, Encélado e Titã.', discover: ['moon', 'europa', 'enceladus', 'titan'] }),
    mission({ id: 'human-traces', title: 'Pegadas humanas', description: 'Encontra ISS, Hubble, Voyager 1 e Starman.', discover: ['iss', 'hubble', 'voyager-1', 'tesla-roadster'] }),
    mission({ id: 'small-wonders', title: 'Pequenos grandes mundos', description: 'Investiga asteroides, cometas e meteoritos famosos.', discover: ['ceres', 'bennu', 'halley', 'apophis', 'chelyabinsk', 'hoba'] }),
    mission({ id: 'grand-tour', title: 'Grande Volta', description: 'Regista o Sol, todos os planetas e conclui o desafio da Terra.', discover: ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'], quizzes: ['earth-0'] })
]);

export function evaluateMissions({ discoveredKeys = [], completedQuizIds = [] } = {}) {
    const discovered = new Set(discoveredKeys);
    const quizzes = new Set(completedQuizIds);
    const evaluated = MISSION_CATALOG.map((definition) => {
        const discoverCount = definition.discover.filter((key) => discovered.has(key)).length;
        const quizCount = definition.quizzes.filter((id) => quizzes.has(id)).length;
        const total = definition.discover.length + definition.quizzes.length;
        return Object.freeze({
            ...definition,
            complete: discoverCount + quizCount === total,
            progress: Object.freeze({ current: discoverCount + quizCount, total })
        });
    });
    const completedIds = evaluated.filter((item) => item.complete).map((item) => item.id);
    return Object.freeze({
        active: evaluated.find((item) => !item.complete) ?? null,
        completedIds: Object.freeze(completedIds),
        missions: Object.freeze(evaluated)
    });
}
