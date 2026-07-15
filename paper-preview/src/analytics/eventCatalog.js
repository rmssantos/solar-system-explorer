const IDENTIFIER = /^[a-z0-9][a-z0-9-]{0,63}$/;

const ENUMS = Object.freeze({
    language: ['pt', 'en'],
    surface: ['home', 'game', 'library', 'privacy'],
    category: ['all', 'worlds', 'moons', 'human', 'small-bodies'],
    discovery: ['all', 'discovered', 'undiscovered'],
    resultBucket: ['0', '1-5', '6-10', '11-25', '26+'],
    attemptBucket: ['1', '2', '3+'],
    provider: ['NASA', 'JPL', 'ESA', 'CelesTrak', 'Wikimedia', 'SpaceX', 'local', 'other'],
    destination: ['home', 'game', 'library', 'privacy', 'source'],
    state: ['start', 'cancel', 'arrive', 'complete', 'open', 'close'],
    errorType: ['asset', 'science-data', 'telemetry', 'render', 'unknown'],
    choice: ['granted', 'denied', 'revoked']
});

const SCHEMAS = Object.freeze({
    navigation_click: { destination: 'destination', surface: 'surface', language: 'language' },
    library_filter: { category: 'category', discovery: 'discovery', resultBucket: 'resultBucket', language: 'language' },
    library_search: { resultBucket: 'resultBucket', category: 'category', language: 'language' },
    object_open: { objectKey: 'id', category: 'category', surface: 'surface' },
    image_open: { objectKey: 'id', surface: 'surface' },
    source_open: { objectKey: 'id', provider: 'provider', surface: 'surface' },
    quiz_result: { quizId: 'id', correct: 'boolean', attemptBucket: 'attemptBucket' },
    mission_event: { missionId: 'id', state: 'state' },
    contract_event: { contractId: 'id', state: 'state' },
    autopilot_event: { objectKey: 'id', state: 'state' },
    language_change: { language: 'language', surface: 'surface' },
    privacy_choice: { choice: 'choice', surface: 'surface' },
    error_event: { errorType: 'errorType', surface: 'surface' }
});

function sanitizeValue(type, value) {
    if (type === 'boolean') return typeof value === 'boolean' ? value : undefined;
    if (type === 'id') return typeof value === 'string' && IDENTIFIER.test(value) ? value : undefined;
    const allowed = ENUMS[type];
    return allowed?.includes(value) ? value : undefined;
}

export function sanitizeAnalyticsEvent(name, properties = {}) {
    const schema = SCHEMAS[name];
    if (!schema) return null;
    const safeProperties = {};
    for (const [key, type] of Object.entries(schema)) {
        if (!(key in properties)) continue;
        const value = sanitizeValue(type, properties[key]);
        if (value === undefined) return null;
        safeProperties[key] = value;
    }
    if (!Object.keys(safeProperties).length) return null;
    return Object.freeze({ name, properties: Object.freeze(safeProperties) });
}

export function sanitizePageView(route, language) {
    const routePaths = { home: '/', game: '/jogo/', library: '/biblioteca/', privacy: '/privacidade/' };
    if (!(route in routePaths) || !ENUMS.language.includes(language)) return null;
    return { name: route, uri: routePaths[route], properties: { language } };
}

export function resultCountBucket(count) {
    const value = Math.max(0, Math.floor(Number(count) || 0));
    if (value === 0) return '0';
    if (value <= 5) return '1-5';
    if (value <= 10) return '6-10';
    if (value <= 25) return '11-25';
    return '26+';
}

export function providerFamily(name = '') {
    const value = String(name).toLowerCase();
    if (value.includes('jpl')) return 'JPL';
    if (value.includes('nasa')) return 'NASA';
    if (value.includes('esa')) return 'ESA';
    if (value.includes('celestrak')) return 'CelesTrak';
    if (value.includes('wikimedia')) return 'Wikimedia';
    if (value.includes('spacex')) return 'SpaceX';
    if (value.includes('inclu') || value.includes('local')) return 'local';
    return 'other';
}
