import { describe, expect, it } from 'vitest';
import {
    clearContractAttempt,
    createContractAttemptState,
    getContractAttempt,
    saveContractAttempt
} from '../paper-preview/src/contracts/contractAttemptState.js';

describe('orbital contract attempt persistence', () => {
    it('stores a versioned sanitized deterministic snapshot per contract', () => {
        const state = saveContractAttempt(createContractAttemptState(), {
            contractId: 'lunar-sweep',
            missionId: 'lunar-sweep',
            savedAt: 1234,
            simulation: {
                phase: 'sweeping', elapsedSeconds: 8.5,
                position: { x: 0.2, y: -0.1, secret: 'drop-me' },
                velocity: { x: 0.1, y: 0 },
                transmitters: [{ id: 'luna-1', x: 0, y: 0, collected: true }],
                secret: 'never persist this'
            }
        });

        expect(getContractAttempt(state, 'lunar-sweep')).toEqual({
            version: 1,
            missionId: 'lunar-sweep',
            savedAt: 1234,
            simulation: {
                phase: 'sweeping', elapsedSeconds: 8.5,
                position: { x: 0.2, y: -0.1 },
                velocity: { x: 0.1, y: 0 },
                transmitters: [{ id: 'luna-1', x: 0, y: 0, collected: true }]
            }
        });
    });

    it('ignores malformed or future-version attempts and supports idempotent clearing', () => {
        const restored = createContractAttemptState({
            contractAttempts: {
                broken: { version: 99, missionId: 'unknown', simulation: { phase: 'bad' } },
                valid: { version: 1, missionId: 'iss-docking', savedAt: 50, simulation: { phase: 'approach' } }
            }
        });

        expect(getContractAttempt(restored, 'broken')).toBeNull();
        expect(getContractAttempt(restored, 'valid')?.simulation.phase).toBe('approach');
        const cleared = clearContractAttempt(restored, 'valid');
        expect(getContractAttempt(cleared, 'valid')).toBeNull();
        expect(clearContractAttempt(cleared, 'valid')).toBe(cleared);
    });

    it('round-trips a partial Jupiter slingshot plan', () => {
        const state = saveContractAttempt(createContractAttemptState(), {
            contractId: 'jupiter-slingshot',
            missionId: 'jupiter-slingshot',
            simulation: {
                phase: 'planning', angleError: 0.08, flybyDistance: 0.51,
                boostProgress: 1.2, committing: false, risk: null
            }
        });
        expect(getContractAttempt(state, 'jupiter-slingshot')?.simulation).toMatchObject({
            phase: 'planning', angleError: 0.08, flybyDistance: 0.51,
            boostProgress: 1.2, committing: false, risk: null
        });
    });

    it('round-trips a lunar sensor network without private renderer data', () => {
        const state = saveContractAttempt(createContractAttemptState(), {
            contractId: 'moon-seismology',
            missionId: 'moon-seismology',
            simulation: {
                phase: 'aligning', cursor: { x: 0.2, y: -0.1 },
                sensors: [{ id: 'sensor-1', x: -0.6, y: 0.2 }],
                alignmentOffset: 0.24, selectedImpact: 1, actionHeld: false,
                rendererHandle: 'drop-me'
            }
        });
        expect(getContractAttempt(state, 'moon-seismology')?.simulation).toEqual({
            phase: 'aligning', cursor: { x: 0.2, y: -0.1 },
            sensors: [{ id: 'sensor-1', x: -0.6, y: 0.2 }],
            alignmentOffset: 0.24, selectedImpact: 1, actionHeld: false
        });
    });

    it('round-trips a Europa radar map without renderer data', () => {
        const state = saveContractAttempt(createContractAttemptState(), {
            contractId: 'europa-radar', missionId: 'europa-radar',
            simulation: {
                phase: 'scanning', position: 0.4, power: 0.72, heat: 0.3,
                scanning: true, overheated: false, passProgress: [1, 0.5, 0],
                coverage: 0.5, echoConfidence: 0.8, beamSprite: 'drop-me'
            }
        });
        expect(getContractAttempt(state, 'europa-radar')?.simulation).toEqual({
            phase: 'scanning', position: 0.4, power: 0.72, heat: 0.3,
            scanning: true, overheated: false, passProgress: [1, 0.5, 0],
            coverage: 0.5, echoConfidence: 0.8
        });
    });

    it('round-trips an Enceladus plume sample', () => {
        const state = saveContractAttempt(createContractAttemptState(), {
            contractId: 'enceladus-plume', missionId: 'enceladus-plume',
            simulation: { phase: 'collecting', samples: 2, purity: 0.9, cooling: 0.7,
                collector: false, grains: [{ id: 'c1', x: 0, y: 0.2, size: 'small', collected: true }] }
        });
        expect(getContractAttempt(state, 'enceladus-plume')?.simulation).toMatchObject({ samples: 2, purity: 0.9, cooling: 0.7, collector: false });
    });

    it('round-trips a Titan dragonfly route', () => {
        const state = saveContractAttempt(createContractAttemptState(), {
            contractId: 'titan-dragonfly', missionId: 'titan-dragonfly',
            simulation: { phase: 'flying', routeProgress: 0.52, altitude: 0.7, stability: 0.82,
                wind: -0.2, analysedSites: ['dunes'], actionHeld: false }
        });
        expect(getContractAttempt(state, 'titan-dragonfly')?.simulation).toMatchObject({ routeProgress: 0.52, altitude: 0.7, stability: 0.82, analysedSites: ['dunes'] });
    });
});
