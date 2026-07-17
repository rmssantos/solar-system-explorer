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
});
