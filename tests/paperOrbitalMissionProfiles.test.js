import { describe, expect, it } from 'vitest';
import { getOrbitalMissionProfile, ORBITAL_MISSION_PROFILES } from '../paper-preview/src/minigames/orbitalMissionProfiles.js';

describe('orbital mission profiles', () => {
    it('defines distinct ISS delivery and Hubble maintenance missions', () => {
        expect(Object.keys(ORBITAL_MISSION_PROFILES)).toEqual(['iss-docking', 'hubble-service']);
        expect(getOrbitalMissionProfile('iss-docking', 'pt')).toMatchObject({ target: 'iss', driftAcceleration: 0 });
        expect(getOrbitalMissionProfile('hubble-service', 'en')).toMatchObject({
            target: 'hubble',
            title: 'Hubble maintenance'
        });
    });

    it('falls back safely to the ISS profile and Portuguese copy', () => {
        expect(getOrbitalMissionProfile('missing', 'fr')).toMatchObject({
            id: 'iss-docking',
            title: 'Correio para a ISS'
        });
    });
});
