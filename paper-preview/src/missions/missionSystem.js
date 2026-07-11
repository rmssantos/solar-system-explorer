function mission(value) {
    return Object.freeze({
        ...value,
        discover: Object.freeze(value.discover ?? []),
        quizzes: Object.freeze(value.quizzes ?? [])
    });
}

export const MISSION_CATALOG = Object.freeze([
    mission({ id: 'rings-route', title: 'Rota dos anéis', titleEn: 'Route of the Rings', description: 'Voa até Saturno e abre o caderno.', descriptionEn: 'Fly to Saturn and open the notebook.', discover: ['saturn'] }),
    mission({ id: 'inner-worlds', title: 'Mundos interiores', titleEn: 'Inner worlds', description: 'Descobre Mercúrio, Vénus, Terra e Marte.', descriptionEn: 'Discover Mercury, Venus, Earth and Mars.', discover: ['mercury', 'venus', 'earth', 'mars'] }),
    mission({ id: 'moon-oceans', title: 'Oceanos escondidos', titleEn: 'Hidden oceans', description: 'Visita a Lua, Europa, Encélado e Titã.', descriptionEn: 'Visit the Moon, Europa, Enceladus and Titan.', discover: ['moon', 'europa', 'enceladus', 'titan'] }),
    mission({ id: 'human-traces', title: 'Pegadas humanas', titleEn: 'Human traces', description: 'Encontra ISS, Hubble, Voyager 1 e Starman.', descriptionEn: 'Find the ISS, Hubble, Voyager 1 and Starman.', discover: ['iss', 'hubble', 'voyager-1', 'tesla-roadster'] }),
    mission({ id: 'small-wonders', title: 'Pequenos grandes mundos', titleEn: 'Small, great worlds', description: 'Investiga asteroides, cometas e meteoritos famosos.', descriptionEn: 'Investigate famous asteroids, comets and meteorites.', discover: ['ceres', 'bennu', 'halley', 'apophis', 'chelyabinsk', 'hoba'] }),
    mission({ id: 'grand-tour', title: 'Grande Volta', titleEn: 'Grand Tour', description: 'Regista o Sol, todos os planetas e conclui o desafio da Terra.', descriptionEn: 'Record the Sun and every planet, then complete Earth’s challenge.', discover: ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'], quizzes: ['earth-0'] })
]);

export function evaluateMissions({ discoveredKeys = [], completedQuizIds = [] } = {}, language = 'pt') {
    const discovered = new Set(discoveredKeys);
    const quizzes = new Set(completedQuizIds);
    const evaluated = MISSION_CATALOG.map((definition) => {
        const discoverCount = definition.discover.filter((key) => discovered.has(key)).length;
        const quizCount = definition.quizzes.filter((id) => quizzes.has(id)).length;
        const total = definition.discover.length + definition.quizzes.length;
        return Object.freeze({
            ...definition,
            title: language === 'en' ? definition.titleEn : definition.title,
            description: language === 'en' ? definition.descriptionEn : definition.description,
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
