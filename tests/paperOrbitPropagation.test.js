import { describe, expect, it } from 'vitest';
import { propagateOmm, projectEarthOrbit } from '../paper-preview/src/data/orbitPropagation.js';

const ISS_OMM = {
    OBJECT_NAME: 'ISS (ZARYA)', OBJECT_ID: '1998-067A', EPOCH: '2026-07-10T12:00:00.000000',
    MEAN_MOTION: 15.49, ECCENTRICITY: 0.0005, INCLINATION: 51.64,
    RA_OF_ASC_NODE: 210.4, ARG_OF_PERICENTER: 86.2, MEAN_ANOMALY: 34.8,
    EPHEMERIS_TYPE: 0, CLASSIFICATION_TYPE: 'U', NORAD_CAT_ID: 25544,
    ELEMENT_SET_NO: 999, REV_AT_EPOCH: 55000, BSTAR: 0.00012,
    MEAN_MOTION_DOT: 0.0001, MEAN_MOTION_DDOT: 0
};

describe('OMM orbit propagation', () => {
    it('propagates an OMM record to a finite ECI vector', () => {
        const result = propagateOmm(ISS_OMM, new Date('2026-07-10T12:15:00Z'));
        expect(result).not.toBeNull();
        expect(Object.values(result.positionKm).every(Number.isFinite)).toBe(true);
        expect(result.distanceKm).toBeGreaterThan(6300);
    });

    it('projects the real direction into a readable diorama orbit', () => {
        const projected = projectEarthOrbit({ x: 4000, y: -5000, z: 3000 }, 2.4);
        expect(Math.hypot(projected.x, projected.y, projected.z)).toBeCloseTo(2.4, 6);
    });
});
