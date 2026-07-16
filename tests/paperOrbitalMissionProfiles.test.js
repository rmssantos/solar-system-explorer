import { describe, expect, it } from 'vitest';
import { getOrbitalMissionProfile, ORBITAL_MISSION_PROFILES } from '../paper-preview/src/minigames/orbitalMissionProfiles.js';

describe('orbital mission profiles', () => {
    it('defines a four-stop campaign with three distinct game mechanics', () => {
        expect(Object.keys(ORBITAL_MISSION_PROFILES)).toEqual([
            'iss-docking', 'hubble-service', 'lunar-sweep', 'mars-relay'
        ]);
        expect(getOrbitalMissionProfile('iss-docking', 'pt')).toMatchObject({
            target: 'iss', gameplay: 'docking', completionEvent: 'docked', driftAcceleration: 0
        });
        expect(getOrbitalMissionProfile('hubble-service', 'en')).toMatchObject({
            target: 'hubble', gameplay: 'docking',
            title: 'Hubble maintenance'
        });
        expect(getOrbitalMissionProfile('lunar-sweep', 'pt')).toMatchObject({
            gameplay: 'sweep', completionEvent: 'sweep-complete', title: 'Varredura lunar'
        });
        expect(getOrbitalMissionProfile('mars-relay', 'en')).toMatchObject({
            gameplay: 'signal', completionEvent: 'signal-complete', title: 'Mars relay'
        });
    });

    it('localizes telemetry and shared controls for each mechanic', () => {
        const sweep = getOrbitalMissionProfile('lunar-sweep', 'pt');
        const signal = getOrbitalMissionProfile('mars-relay', 'en');

        expect(sweep.metrics.map((metric) => metric.label)).toEqual(['Transmissores', 'Escudo', 'Sinal']);
        expect(sweep.controls).not.toContain('rotate-left');
        expect(sweep.centerControl).toBe('Travar');
        expect(signal.metrics.map((metric) => metric.label)).toEqual(['Angle', 'Frequency', 'Lock']);
        expect(signal.centerControl).toBe('Transmit');
    });

    it('falls back safely to the ISS profile and Portuguese copy', () => {
        expect(getOrbitalMissionProfile('missing', 'fr')).toMatchObject({
            id: 'iss-docking',
            title: 'Correio para a ISS'
        });
    });
});
