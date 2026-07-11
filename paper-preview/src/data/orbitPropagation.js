import { json2satrec, propagate } from 'satellite.js';

export function propagateOmm(omm, date = new Date()) {
    try {
        const satelliteOmm = omm.OBJECT_NAME ? omm : {
            OBJECT_NAME: omm.name,
            OBJECT_ID: omm.objectId ?? '',
            EPOCH: omm.epoch,
            MEAN_MOTION: omm.meanMotion,
            ECCENTRICITY: omm.eccentricity,
            INCLINATION: omm.inclinationDeg,
            RA_OF_ASC_NODE: omm.rightAscensionDeg,
            ARG_OF_PERICENTER: omm.argumentPerigeeDeg,
            MEAN_ANOMALY: omm.meanAnomalyDeg,
            EPHEMERIS_TYPE: 0,
            CLASSIFICATION_TYPE: 'U',
            NORAD_CAT_ID: omm.catalogNumber,
            ELEMENT_SET_NO: 999,
            REV_AT_EPOCH: 0,
            BSTAR: omm.bstar ?? 0,
            MEAN_MOTION_DOT: omm.meanMotionDot ?? 0,
            MEAN_MOTION_DDOT: omm.meanMotionDdot ?? 0
        };
        const record = json2satrec(satelliteOmm);
        const result = propagate(record, date);
        if (!result?.position) return null;
        const positionKm = {
            x: Number(result.position.x),
            y: Number(result.position.y),
            z: Number(result.position.z)
        };
        if (!Object.values(positionKm).every(Number.isFinite)) return null;
        return {
            positionKm,
            velocityKmS: result.velocity ? {
                x: Number(result.velocity.x),
                y: Number(result.velocity.y),
                z: Number(result.velocity.z)
            } : null,
            distanceKm: Math.hypot(positionKm.x, positionKm.y, positionKm.z)
        };
    } catch {
        return null;
    }
}

export function projectEarthOrbit(positionKm, radius) {
    const length = Math.hypot(positionKm.x, positionKm.y, positionKm.z) || 1;
    return {
        x: (positionKm.x / length) * radius,
        y: (positionKm.z / length) * radius,
        z: (positionKm.y / length) * radius
    };
}
