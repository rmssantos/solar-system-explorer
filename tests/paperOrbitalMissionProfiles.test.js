import { describe, expect, it } from 'vitest';
import { getOrbitalMissionProfile, ORBITAL_MISSION_PROFILES } from '../paper-preview/src/minigames/orbitalMissionProfiles.js';

describe('orbital mission profiles', () => {
    it('keeps the five-stop campaign and adds four distinct investigation mechanics', () => {
        expect(Object.keys(ORBITAL_MISSION_PROFILES)).toEqual([
            'iss-docking', 'hubble-service', 'lunar-sweep', 'mars-relay', 'jupiter-slingshot',
            'moon-seismology', 'europa-radar', 'enceladus-plume', 'titan-dragonfly'
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
        expect(getOrbitalMissionProfile('jupiter-slingshot', 'pt')).toMatchObject({
            gameplay: 'slingshot', completionEvent: 'slingshot-complete', title: 'Estilingue de Júpiter'
        });
        expect([
            getOrbitalMissionProfile('moon-seismology').gameplay,
            getOrbitalMissionProfile('europa-radar').gameplay,
            getOrbitalMissionProfile('enceladus-plume').gameplay,
            getOrbitalMissionProfile('titan-dragonfly').gameplay
        ]).toEqual(['seismic', 'ice-radar', 'plume', 'dragonfly']);
    });

    it('localizes telemetry and shared controls for each mechanic', () => {
        const sweep = getOrbitalMissionProfile('lunar-sweep', 'pt');
        const signal = getOrbitalMissionProfile('mars-relay', 'en');

        expect(sweep.metrics.map((metric) => metric.label)).toEqual(['Transmissores', 'Escudo', 'Sinal']);
        expect(sweep.controls).not.toContain('rotate-left');
        expect(sweep.centerControl).toBe('Travar');
        expect(signal.metrics.map((metric) => metric.label)).toEqual(['Angle', 'Frequency', 'Lock']);
        expect(signal.centerControl).toBe('Transmit');
        const slingshot = getOrbitalMissionProfile('jupiter-slingshot', 'pt');
        expect(slingshot.metrics.map((metric) => metric.label)).toEqual(['Rota', 'Distância a Júpiter', 'Velocidade ganha']);
        expect(slingshot.centerControl).toBe('Ativar impulso');
    });

    it('falls back safely to the ISS profile and Portuguese copy', () => {
        expect(getOrbitalMissionProfile('missing', 'fr')).toMatchObject({
            id: 'iss-docking',
            title: 'Correio para a ISS'
        });
    });
});
