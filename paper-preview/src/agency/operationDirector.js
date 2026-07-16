const DEFAULT_SOURCES = Object.freeze({
    solar: Object.freeze({ status: 'fallback', name: 'NASA DONKI', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' }),
    neo: Object.freeze({ status: 'fallback', name: 'NASA/JPL CNEOS', url: 'https://cneos.jpl.nasa.gov/' }),
    planet: Object.freeze({ status: 'fallback', name: 'NASA/JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' })
});

function sourceFrom(result, fallback) {
    return Object.freeze({
        status: result?.status ?? fallback.status,
        name: result?.source?.name ?? fallback.name,
        url: result?.source?.url ?? fallback.url,
        updatedAt: result?.updatedAt ?? null
    });
}

function operation(value) {
    return Object.freeze({
        ...value,
        facts: Object.freeze({ ...value.facts }),
        source: Object.freeze({ ...value.source })
    });
}

function fallbackSolar(date) {
    return { id: `quiet-${date}`, classType: 'quiet', peakTime: `${date}T12:00:00Z`, sourceLocation: 'solar-disc' };
}

function fallbackNeo(date) {
    return {
        id: `paper-scout-${date}`,
        name: 'Paper Scout',
        approachDate: date,
        missDistanceKm: 1_250_000,
        speedKps: 8.2,
        diameterMeters: 18,
        hazardous: false
    };
}

function mostRecentSolarSignal(values, fallback) {
    if (!Array.isArray(values) || values.length === 0) return fallback;
    return values.reduce((latest, candidate) => {
        const latestTime = Date.parse(latest?.peakTime ?? latest?.beginTime ?? '') || 0;
        const candidateTime = Date.parse(candidate?.peakTime ?? candidate?.beginTime ?? '') || 0;
        return candidateTime > latestTime ? candidate : latest;
    });
}

/** @param {any} input */
export function createLivingOperations(input = {}) {
    const { date, solar, neo, planet } = input;
    const day = /^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ? date : new Date().toISOString().slice(0, 10);
    const flare = mostRecentSolarSignal(solar?.data, fallbackSolar(day));
    const nearObject = neo?.data?.[0] ?? fallbackNeo(day);
    const planetDistanceKm = Number.isFinite(planet?.data?.distanceKm) ? planet.data.distanceKm : 225_000_000;

    return Object.freeze([
        operation({
            id: `solar:${day}:${flare.id}`,
            kind: 'solar-weather',
            targetKey: 'sun',
            durationMs: 120_000,
            recommendedInstrumentId: 'magnetometer',
            recommendedPowerProfileId: 'focused',
            source: sourceFrom(solar, DEFAULT_SOURCES.solar),
            facts: { flareClass: flare.classType, peakTime: flare.peakTime, sourceLocation: flare.sourceLocation }
        }),
        operation({
            id: `neo:${day}:${nearObject.id}`,
            kind: 'near-earth-object',
            targetKey: 'earth',
            durationMs: 300_000,
            recommendedInstrumentId: 'camera',
            recommendedPowerProfileId: 'balanced',
            source: sourceFrom(neo, DEFAULT_SOURCES.neo),
            facts: {
                objectName: nearObject.name,
                approachDate: nearObject.approachDate,
                missDistanceKm: nearObject.missDistanceKm,
                speedKps: nearObject.speedKps,
                diameterMeters: nearObject.diameterMeters,
                hazardous: nearObject.hazardous
            }
        }),
        operation({
            id: `planetary-map:${day}:mars`,
            kind: 'planetary-map',
            targetKey: 'mars',
            durationMs: 480_000,
            recommendedInstrumentId: 'radio',
            recommendedPowerProfileId: 'survey',
            source: sourceFrom(planet, DEFAULT_SOURCES.planet),
            facts: { distanceKm: planetDistanceKm, ephemerisDate: day }
        })
    ]);
}

function number(value, language, digits = 0) {
    return new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: digits }).format(value);
}

function solarCopy(operation, language) {
    const flareClass = operation.facts.flareClass === 'quiet'
        ? (language === 'en' ? 'quiet' : 'tranquila')
        : operation.facts.flareClass;
    return language === 'en'
        ? {
            title: operation.facts.flareClass === 'quiet' ? 'Quiet solar watch' : `${flareClass} solar watch`,
            summary: 'Measure how activity from the Sun travels through the Solar System.',
            objective: 'Record the magnetic signature', action: 'Prepare probe'
        }
        : {
            title: operation.facts.flareClass === 'quiet' ? 'Vigília solar tranquila' : `Vigília solar ${flareClass}`,
            summary: 'Mede como a atividade do Sol atravessa o Sistema Solar.',
            objective: 'Registar a assinatura magnética', action: 'Preparar sonda'
        };
}

function neoCopy(operation, language) {
    const distance = number(operation.facts.missDistanceKm, language);
    return language === 'en'
        ? { title: `Close approach: ${operation.facts.objectName}`, summary: `Observe a small body passing ${distance} km from Earth.`, objective: 'Photograph and estimate its size', action: 'Prepare probe' }
        : { title: `Aproximação: ${operation.facts.objectName}`, summary: `Observa um pequeno corpo a passar a ${distance} km da Terra.`, objective: 'Fotografar e estimar o tamanho', action: 'Preparar sonda' };
}

function planetCopy(operation, language) {
    const distance = number(operation.facts.distanceKm / 1_000_000, language, 1);
    return language === 'en'
        ? { title: 'Mars radio map', summary: `Test a deep-space link across about ${distance} million km.`, objective: 'Map signal delay and strength', action: 'Prepare probe' }
        : { title: 'Mapa rádio de Marte', summary: `Testa uma ligação espacial através de cerca de ${distance} milhões de km.`, objective: 'Mapear o atraso e a força do sinal', action: 'Preparar sonda' };
}

export function getLocalizedOperation(operationValue, language = 'pt') {
    const languageKey = language === 'en' ? 'en' : 'pt';
    const copy = operationValue.kind === 'solar-weather'
        ? solarCopy(operationValue, languageKey)
        : operationValue.kind === 'near-earth-object'
            ? neoCopy(operationValue, languageKey)
            : planetCopy(operationValue, languageKey);
    return Object.freeze({ ...operationValue, ...copy });
}
