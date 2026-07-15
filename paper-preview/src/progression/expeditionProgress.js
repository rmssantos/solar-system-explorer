export const EVENT_XP = Object.freeze({
    discovery: 20,
    quiz: 35,
    surprise: 15,
    mission: 100,
    contract: 140
});

const LEVELS = Object.freeze([
    Object.freeze({ level: 1, threshold: 0, title: 'Cadete de Papel', titleEn: 'Paper Cadet' }),
    Object.freeze({ level: 2, threshold: 100, title: 'Cartógrafo Lunar', titleEn: 'Lunar Cartographer' }),
    Object.freeze({ level: 3, threshold: 250, title: 'Piloto de Órbita', titleEn: 'Orbit Pilot' }),
    Object.freeze({ level: 4, threshold: 450, title: 'Navegador Solar', titleEn: 'Solar Navigator' }),
    Object.freeze({ level: 5, threshold: 700, title: 'Embaixador das Estrelas', titleEn: 'Star Ambassador' }),
    Object.freeze({ level: 6, threshold: 1000, title: 'Guardião do Sistema', titleEn: 'Guardian of the System' })
]);

function award(value) {
    return Object.freeze(value);
}

export const AWARD_CATALOG = Object.freeze([
    award({ id: 'first-light', icon: '☀', title: 'Primeira luz', titleEn: 'First light', description: 'Regista a primeira descoberta.', descriptionEn: 'Record your first discovery.', kind: 'medal' }),
    award({ id: 'rings-route', icon: '◎', title: 'Rota dos anéis', titleEn: 'Route of the Rings', description: 'Cumpre a missão de Saturno.', descriptionEn: 'Complete the Saturn mission.', kind: 'medal' }),
    award({ id: 'inner-cartographer', icon: '✥', title: 'Cartógrafo interior', titleEn: 'Inner cartographer', description: 'Descobre Mercúrio, Vénus, Terra e Marte.', descriptionEn: 'Discover Mercury, Venus, Earth and Mars.', kind: 'medal' }),
    award({ id: 'moon-hopper', icon: '☾', title: 'Salta-luas', titleEn: 'Moon hopper', description: 'Visita Lua, Europa, Encélado e Titã.', descriptionEn: 'Visit the Moon, Europa, Enceladus and Titan.', kind: 'medal' }),
    award({ id: 'human-traces', icon: '⌁', title: 'Caçador de sinais', titleEn: 'Signal hunter', description: 'Encontra quatro pegadas humanas no espaço.', descriptionEn: 'Find four human traces in space.', kind: 'medal' }),
    award({ id: 'quiz-scholar', icon: '✎', title: 'Mente em órbita', titleEn: 'Mind in orbit', description: 'Resolve cinco desafios científicos.', descriptionEn: 'Solve five science challenges.', kind: 'medal' }),
    award({ id: 'grand-tour', icon: '✦', title: 'Grande Volta', titleEn: 'Grand Tour', description: 'Completa a grande viagem do Sistema Solar.', descriptionEn: 'Complete the grand journey through the Solar System.', kind: 'trophy' })
]);

function unique(values = []) {
    return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))];
}

export function createExpeditionProgress(value = {}) {
    return Object.freeze({
        xp: Number.isFinite(value.xp) ? Math.max(0, Math.round(value.xp)) : 0,
        awardedEventIds: Object.freeze(unique(value.awardedEventIds)),
        seenSurpriseIds: Object.freeze(unique(value.seenSurpriseIds))
    });
}

export function awardExpeditionEvent(progress, event) {
    const base = createExpeditionProgress(progress);
    if (!event || !(event.type in EVENT_XP) || !event.id) return base;
    const eventId = `${event.type}:${event.id}`;
    if (base.awardedEventIds.includes(eventId)) return base;
    return createExpeditionProgress({
        ...base,
        xp: base.xp + EVENT_XP[event.type],
        awardedEventIds: [...base.awardedEventIds, eventId]
    });
}

export function getExplorerLevel(xp = 0, language = 'pt') {
    const safeXp = Math.max(0, Number.isFinite(xp) ? xp : 0);
    const index = Math.max(0, LEVELS.findLastIndex((level) => safeXp >= level.threshold));
    const current = LEVELS[index];
    const next = LEVELS[index + 1] ?? null;
    const progress = next
        ? (safeXp - current.threshold) / (next.threshold - current.threshold)
        : 1;
    return Object.freeze({
        ...current,
        title: language === 'en' ? current.titleEn : current.title,
        nextThreshold: next?.threshold ?? current.threshold,
        progress: Math.max(0, Math.min(1, progress))
    });
}

function hasAll(set, values) {
    return values.every((value) => set.has(value));
}

export function evaluateAwards({ discoveredKeys = [], completedQuizIds = [], completedMissionIds = [] } = {}, language = 'pt') {
    const discoveries = new Set(discoveredKeys);
    const missions = new Set(completedMissionIds);
    const unlocked = new Set();
    if (discoveries.size > 0) unlocked.add('first-light');
    if (missions.has('rings-route')) unlocked.add('rings-route');
    if (hasAll(discoveries, ['mercury', 'venus', 'earth', 'mars'])) unlocked.add('inner-cartographer');
    if (hasAll(discoveries, ['moon', 'europa', 'enceladus', 'titan'])) unlocked.add('moon-hopper');
    if (missions.has('human-traces')) unlocked.add('human-traces');
    if (new Set(completedQuizIds).size >= 5) unlocked.add('quiz-scholar');
    if (missions.has('grand-tour')) unlocked.add('grand-tour');
    return Object.freeze(AWARD_CATALOG.filter((item) => unlocked.has(item.id)).map((item) => language === 'en'
        ? Object.freeze({ ...item, title: item.titleEn, description: item.descriptionEn })
        : item));
}

export function reconcileExpeditionProgress(progress, snapshot = {}) {
    let next = createExpeditionProgress(progress);
    for (const id of unique(snapshot.discoveredKeys)) next = awardExpeditionEvent(next, { type: 'discovery', id });
    for (const id of unique(snapshot.completedQuizIds)) next = awardExpeditionEvent(next, { type: 'quiz', id });
    for (const id of unique(snapshot.completedMissionIds)) next = awardExpeditionEvent(next, { type: 'mission', id });
    for (const id of unique(snapshot.completedContractIds)) next = awardExpeditionEvent(next, { type: 'contract', id });
    for (const id of unique(snapshot.seenSurpriseIds)) next = awardExpeditionEvent(next, { type: 'surprise', id });
    return createExpeditionProgress({
        ...next,
        seenSurpriseIds: unique([...(next.seenSurpriseIds ?? []), ...(snapshot.seenSurpriseIds ?? [])])
    });
}
