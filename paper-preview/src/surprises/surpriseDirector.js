function surprise(value) {
    return Object.freeze(value);
}

export const SURPRISE_CATALOG = Object.freeze([
    surprise({ id: 'paper-comet', title: 'Um risco no céu!', titleEn: 'A streak across the sky!', message: 'É um cometa: gelo, poeira e rocha a ganhar uma cauda quando se aproxima do Sol.', messageEn: 'It is a comet: ice, dust and rock growing a tail as it approaches the Sun.', effect: 'comet' }),
    surprise({ id: 'lost-signal', title: 'Bip… bip… recebemos algo', titleEn: 'Beep… beep… something came through', message: 'Um sinal muito fraco atravessou o rádio. No espaço real, as antenas da Deep Space Network escutam sondas a milhares de milhões de quilómetros.', messageEn: 'A very faint signal crossed the radio. In real space, Deep Space Network antennas listen to probes billions of kilometres away.', effect: 'signal' }),
    surprise({ id: 'probe-postcard', title: 'Postal de uma sonda', titleEn: 'A postcard from a probe', message: 'As Voyager levam um disco dourado com sons e imagens da Terra — uma mensagem para quem o possa encontrar.', messageEn: 'The Voyager probes carry a Golden Record with sounds and images from Earth — a message for whoever may find it.', effect: 'postcard' }),
    surprise({ id: 'meteor-shower', title: 'Chuva de meteoros', titleEn: 'Meteor shower', message: 'Estes riscos luminosos seriam pequenos grãos a entrar numa atmosfera. Aqui passam como confettis cósmicos de papel.', messageEn: 'These bright streaks would be tiny grains entering an atmosphere. Here they pass like cosmic paper confetti.', effect: 'meteor' }),
    surprise({ id: 'data-capsule', title: 'Cápsula científica', titleEn: 'Science capsule', message: 'Encontraste uma nota: a luz do Sol demora cerca de 8 minutos e 20 segundos a chegar à Terra.', messageEn: 'You found a note: sunlight takes about 8 minutes and 20 seconds to reach Earth.', effect: 'capsule' }),
    surprise({ id: 'golden-star', title: 'Estrela de navegação', titleEn: 'Navigation star', message: 'Não é um prémio por velocidade. É um lembrete: as melhores descobertas acontecem quando olhamos para os lados.', messageEn: 'This is not a prize for speed. It is a reminder: the best discoveries happen when we look around.', effect: 'star' })
]);

function unique(values = []) {
    return [...new Set(values.filter((value) => typeof value === 'string'))];
}

export function createSurpriseState(value = {}) {
    return Object.freeze({
        elapsedSeconds: Number.isFinite(value.elapsedSeconds) ? Math.max(0, value.elapsedSeconds) : 0,
        nextAtSeconds: Number.isFinite(value.nextAtSeconds) ? Math.max(0, value.nextAtSeconds) : 90,
        sessionEventCount: Number.isFinite(value.sessionEventCount) ? Math.max(0, Math.floor(value.sessionEventCount)) : 0,
        activeId: value.activeId ?? null,
        seenIds: Object.freeze(unique(value.seenIds))
    });
}

export function dismissSurprise(state) {
    return createSurpriseState({ ...state, activeId: null });
}

export function stepSurpriseDirector(state, context = {}) {
    const base = createSurpriseState(state);
    const activeFlight = (context.speed ?? 0) >= 1.2 && (context.distanceFromOrigin ?? 0) >= 12;
    const canAccumulate = activeFlight && !base.activeId && !context.dialogOpen;
    const elapsedSeconds = base.elapsedSeconds + (canAccumulate ? Math.max(0, context.deltaSeconds ?? 0) : 0);
    const waiting = base.activeId
        || context.dialogOpen
        || !activeFlight
        || base.sessionEventCount >= 2
        || elapsedSeconds < base.nextAtSeconds;
    if (waiting) {
        return Object.freeze({ state: createSurpriseState({ ...base, elapsedSeconds }), event: null });
    }

    let candidates = SURPRISE_CATALOG.filter((item) => !base.seenIds.includes(item.id));
    if (candidates.length === 0) candidates = [...SURPRISE_CATALOG];
    const random = typeof context.random === 'function' ? context.random : Math.random;
    const unit = Math.max(0, Math.min(0.999999, random()));
    const event = candidates[Math.floor(unit * candidates.length)];
    const cooldownRandom = Math.max(0, Math.min(1, random()));
    return Object.freeze({
        state: createSurpriseState({
            elapsedSeconds,
            nextAtSeconds: elapsedSeconds + 180 + cooldownRandom * 120,
            sessionEventCount: base.sessionEventCount + 1,
            activeId: event.id,
            seenIds: [...base.seenIds, event.id]
        }),
        event
    });
}

export function getSurprise(id) {
    return SURPRISE_CATALOG.find((item) => item.id === id) ?? null;
}

export function getLocalizedSurprise(id, language = 'pt') {
    const item = getSurprise(id);
    if (!item || language !== 'en') return item;
    return Object.freeze({ ...item, title: item.titleEn, message: item.messageEn });
}
