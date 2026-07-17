export const CONTRACT_ATTEMPT_VERSION = 1;

const SIMULATION_KEYS = new Set([
    'phase', 'attempts', 'elapsedSeconds', 'event', 'position', 'velocity', 'x', 'y',
    'angle', 'angularVelocity', 'shield', 'invulnerabilitySeconds', 'transmitters',
    'debris', 'id', 'collected', 'radius', 'angleError', 'frequencyError',
    'lockSeconds', 'transmitting', 'approachAngle', 'periapsis', 'heat', 'speed',
    'speedGain', 'launchProgress', 'inCorridor'
]);

function sanitizeNode(value, depth = 0) {
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    if (typeof value === 'string') return value.slice(0, 96);
    if (depth >= 6) return undefined;
    if (Array.isArray(value)) {
        return value.slice(0, 64)
            .map((item) => sanitizeNode(item, depth + 1))
            .filter((item) => item !== undefined);
    }
    if (!value || typeof value !== 'object') return undefined;
    const safe = {};
    for (const [key, item] of Object.entries(value)) {
        if (!SIMULATION_KEYS.has(key)) continue;
        const sanitized = sanitizeNode(item, depth + 1);
        if (sanitized !== undefined) safe[key] = sanitized;
    }
    return safe;
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
}

function restoreAttempt(value) {
    if (!value || value.version !== CONTRACT_ATTEMPT_VERSION || typeof value.missionId !== 'string') return null;
    const simulation = sanitizeNode(value.simulation);
    if (!simulation || typeof simulation.phase !== 'string') return null;
    return deepFreeze({
        version: CONTRACT_ATTEMPT_VERSION,
        missionId: value.missionId,
        savedAt: Number.isFinite(value.savedAt) ? Math.max(0, value.savedAt) : 0,
        simulation
    });
}

export function createContractAttemptState(value = {}) {
    const source = value.contractAttempts && typeof value.contractAttempts === 'object'
        ? value.contractAttempts
        : {};
    const contractAttempts = {};
    for (const [contractId, attempt] of Object.entries(source)) {
        const restored = restoreAttempt(attempt);
        if (restored) contractAttempts[contractId] = restored;
    }
    return Object.freeze({ contractAttempts: Object.freeze(contractAttempts) });
}

export function getContractAttempt(state, contractId) {
    return createContractAttemptState(state).contractAttempts[contractId] ?? null;
}

export function saveContractAttempt(state, { contractId, missionId, simulation, savedAt = Date.now() } = {}) {
    if (typeof contractId !== 'string' || typeof missionId !== 'string') return state;
    const attempt = restoreAttempt({ version: CONTRACT_ATTEMPT_VERSION, missionId, simulation, savedAt });
    if (!attempt) return state;
    const base = createContractAttemptState(state);
    return createContractAttemptState({
        contractAttempts: { ...base.contractAttempts, [contractId]: attempt }
    });
}

export function clearContractAttempt(state, contractId) {
    const base = createContractAttemptState(state);
    if (!base.contractAttempts[contractId]) return state;
    const contractAttempts = { ...base.contractAttempts };
    delete contractAttempts[contractId];
    return createContractAttemptState({ contractAttempts });
}
