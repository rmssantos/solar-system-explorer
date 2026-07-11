function surprise(value) {
    return Object.freeze(value);
}

export const SURPRISE_CATALOG = Object.freeze([
    surprise({ id: 'paper-comet', title: 'Um risco no céu!', message: 'É um cometa: gelo, poeira e rocha a ganhar uma cauda quando se aproxima do Sol.', effect: 'comet' }),
    surprise({ id: 'lost-signal', title: 'Bip… bip… recebemos algo', message: 'Um sinal muito fraco atravessou o rádio. No espaço real, as antenas da Deep Space Network escutam sondas a milhares de milhões de quilómetros.', effect: 'signal' }),
    surprise({ id: 'probe-postcard', title: 'Postal de uma sonda', message: 'As Voyager levam um disco dourado com sons e imagens da Terra — uma mensagem para quem o possa encontrar.', effect: 'postcard' }),
    surprise({ id: 'meteor-shower', title: 'Chuva de meteoros', message: 'Estes riscos luminosos seriam pequenos grãos a entrar numa atmosfera. Aqui passam como confettis cósmicos de papel.', effect: 'meteor' }),
    surprise({ id: 'data-capsule', title: 'Cápsula científica', message: 'Encontraste uma nota: a luz do Sol demora cerca de 8 minutos e 20 segundos a chegar à Terra.', effect: 'capsule' }),
    surprise({ id: 'golden-star', title: 'Estrela de navegação', message: 'Não é um prémio por velocidade. É um lembrete: as melhores descobertas acontecem quando olhamos para os lados.', effect: 'star' })
]);

function unique(values = []) {
    return [...new Set(values.filter((value) => typeof value === 'string'))];
}

export function createSurpriseState(value = {}) {
    return Object.freeze({
        elapsedSeconds: Number.isFinite(value.elapsedSeconds) ? Math.max(0, value.elapsedSeconds) : 0,
        nextAtSeconds: Number.isFinite(value.nextAtSeconds) ? Math.max(0, value.nextAtSeconds) : 35,
        activeId: value.activeId ?? null,
        seenIds: Object.freeze(unique(value.seenIds))
    });
}

export function dismissSurprise(state) {
    return createSurpriseState({ ...state, activeId: null });
}

export function stepSurpriseDirector(state, context = {}) {
    const base = createSurpriseState(state);
    const elapsedSeconds = base.elapsedSeconds + Math.max(0, context.deltaSeconds ?? 0);
    const waiting = base.activeId
        || context.dialogOpen
        || (context.speed ?? 0) < 0.6
        || (context.distanceFromOrigin ?? 0) < 8
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
            nextAtSeconds: elapsedSeconds + 65 + cooldownRandom * 40,
            activeId: event.id,
            seenIds: [...base.seenIds, event.id]
        }),
        event
    });
}

export function getSurprise(id) {
    return SURPRISE_CATALOG.find((item) => item.id === id) ?? null;
}
