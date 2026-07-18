import { PRIMARY_WORLDS } from './worldCatalog.js';

const MIN_PLANET_AU = 0.3871;
const MAX_PLANET_AU = 30.0611;
const MIN_GAME_RADIUS = 11;
const MAX_GAME_RADIUS = 142;
const EPOCH_MS = Date.parse('2000-01-01T12:00:00Z');
const DAY_MS = 86_400_000;
const DEG_TO_RAD = Math.PI / 180;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function compressAu(distanceAu) {
    if (!Number.isFinite(distanceAu) || distanceAu <= 0) return 0;
    const normalized = Math.log(distanceAu / MIN_PLANET_AU)
        / Math.log(MAX_PLANET_AU / MIN_PLANET_AU);
    return MIN_GAME_RADIUS + clamp(normalized, 0, 1) * (MAX_GAME_RADIUS - MIN_GAME_RADIUS);
}

function solveEccentricAnomaly(meanAnomaly, eccentricity) {
    let eccentricAnomaly = meanAnomaly;
    for (let iteration = 0; iteration < 8; iteration += 1) {
        eccentricAnomaly -= (
            eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly
        ) / (1 - eccentricity * Math.cos(eccentricAnomaly));
    }
    return eccentricAnomaly;
}

export function positionAtDate(orbit, date = new Date()) {
    const timestamp = date instanceof Date ? date.getTime() : Number(date);
    const elapsedDays = (timestamp - EPOCH_MS) / DAY_MS;
    const meanAnomaly = (
        orbit.meanAnomalyAtEpochDeg * DEG_TO_RAD
        + (elapsedDays / orbit.periodDays) * Math.PI * 2
    ) % (Math.PI * 2);
    const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, orbit.eccentricity);
    const trueX = orbit.semiMajorAxisAu * (Math.cos(eccentricAnomaly) - orbit.eccentricity);
    const trueZ = orbit.semiMajorAxisAu
        * Math.sqrt(1 - orbit.eccentricity ** 2)
        * Math.sin(eccentricAnomaly);
    const actualRadius = Math.hypot(trueX, trueZ);
    const compressedSemiMajor = compressAu(orbit.semiMajorAxisAu);
    const compressedRadius = compressedSemiMajor * (actualRadius / orbit.semiMajorAxisAu);
    const planeAngle = Math.atan2(trueZ, trueX) + orbit.argumentPeriapsisDeg * DEG_TO_RAD;
    const inclination = orbit.inclinationDeg * DEG_TO_RAD;
    const ascendingNode = orbit.ascendingNodeDeg * DEG_TO_RAD;
    const xInPlane = Math.cos(planeAngle) * compressedRadius;
    const zInPlane = Math.sin(planeAngle) * compressedRadius;
    const inclinedY = zInPlane * Math.sin(inclination);
    const projectedZ = zInPlane * Math.cos(inclination);
    return Object.freeze({
        x: xInPlane * Math.cos(ascendingNode) - projectedZ * Math.sin(ascendingNode),
        y: inclinedY,
        z: xInPlane * Math.sin(ascendingNode) + projectedZ * Math.cos(ascendingNode)
    });
}

export function createPrimarySnapshot(date = new Date()) {
    return Object.freeze(Object.fromEntries(PRIMARY_WORLDS.map((world) => [
        world.key,
        Object.freeze({
            key: world.key,
            position: world.type === 'star'
                ? Object.freeze({ x: 0, y: 0, z: 0 })
                : positionAtDate(world.orbit, date),
            collisionRadius: world.collisionRadius,
            interactionRadius: world.interactionRadius,
            semiMajorAxisAu: world.orbit?.semiMajorAxisAu ?? 0
        })
    ])));
}

export const ORBIT_SCALE = Object.freeze({
    minAu: MIN_PLANET_AU,
    maxAu: MAX_PLANET_AU,
    minRadius: MIN_GAME_RADIUS,
    maxRadius: MAX_GAME_RADIUS
});
