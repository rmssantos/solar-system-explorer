import { describe, expect, it, vi } from 'vitest';
import { createOrbitalMissionGame } from '../paper-preview/src/minigames/createOrbitalMissionGame.js';

describe('orbital mission game router', () => {
    it.each([
        ['docking', 'dock'],
        ['sweep', 'sweep'],
        ['signal', 'signal'],
        ['slingshot', 'slingshot'],
        ['seismic', 'seismic'],
        ['ice-radar', 'ice-radar'],
        ['plume', 'plume'],
        ['dragonfly', 'dragonfly']
    ])('lazy-routes %s gameplay to its own factory', async (gameplay, expected) => {
        const calls = [];
        const loaders = {
            docking: vi.fn(async () => ({ createDockingGame: async () => calls.push('dock') })),
            sweep: vi.fn(async () => ({ createSweepGame: async () => calls.push('sweep') })),
            signal: vi.fn(async () => ({ createSignalGame: async () => calls.push('signal') })),
            slingshot: vi.fn(async () => ({ createSlingshotGame: async () => calls.push('slingshot') })),
            seismic: vi.fn(async () => ({ createSeismicGame: async () => calls.push('seismic') })),
            'ice-radar': vi.fn(async () => ({ createIceRadarGame: async () => calls.push('ice-radar') })),
            plume: vi.fn(async () => ({ createPlumeGame: async () => calls.push('plume') })),
            dragonfly: vi.fn(async () => ({ createDragonflyGame: async () => calls.push('dragonfly') }))
        };

        await createOrbitalMissionGame({ profile: { gameplay } }, loaders);

        expect(calls).toEqual([expected]);
        expect(loaders[gameplay]).toHaveBeenCalledOnce();
    });

    it('falls back to docking for an unknown gameplay profile', async () => {
        const docking = vi.fn(async () => ({ createDockingGame: async () => 'safe-fallback' }));
        await expect(createOrbitalMissionGame({ profile: { gameplay: 'unknown' } }, {
            docking,
            sweep: vi.fn(),
            signal: vi.fn(),
            slingshot: vi.fn()
        })).resolves.toBe('safe-fallback');
    });
});
