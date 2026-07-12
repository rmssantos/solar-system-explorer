import { describe, expect, it } from 'vitest';
import { createAudioMix, normalizeFlightSpeed } from '../paper-preview/src/audio/audioState.js';

describe('paper soundscape mix', () => {
    it('normalizes flight speed into a bounded zero-to-one range', () => {
        expect(normalizeFlightSpeed(-2)).toBe(0);
        expect(normalizeFlightSpeed(3.5)).toBe(0.5);
        expect(normalizeFlightSpeed(99)).toBe(1);
    });

    it('stays silent until enabled, unlocked and visible', () => {
        expect(createAudioMix({ enabled: true, unlocked: false, visible: true, speed: 4 })).toMatchObject({
            ambienceVolume: 0,
            engineVolume: 0
        });
        expect(createAudioMix({ enabled: false, unlocked: true, visible: true, speed: 4 })).toMatchObject({
            ambienceVolume: 0,
            engineVolume: 0
        });
        expect(createAudioMix({ enabled: true, unlocked: true, visible: false, speed: 4 })).toMatchObject({
            ambienceVolume: 0,
            engineVolume: 0
        });
    });

    it('raises the engine with speed and boost while keeping levels restrained', () => {
        const idle = createAudioMix({ enabled: true, unlocked: true, visible: true, speed: 0 });
        const cruise = createAudioMix({ enabled: true, unlocked: true, visible: true, speed: 3.5 });
        const boost = createAudioMix({ enabled: true, unlocked: true, visible: true, speed: 7, boost: true });
        expect(idle.ambienceVolume).toBeCloseTo(0.2);
        expect(idle.engineVolume).toBeCloseTo(0.015);
        expect(cruise.engineVolume).toBeGreaterThan(idle.engineVolume);
        expect(boost.engineVolume).toBeGreaterThan(cruise.engineVolume);
        expect(boost.engineVolume).toBeLessThanOrEqual(0.38);
        expect(boost.enginePlaybackRate).toBeGreaterThan(cruise.enginePlaybackRate);
    });

    it('ducks the soundscape under dialogs and adds gentle autopilot focus', () => {
        const flight = createAudioMix({ enabled: true, unlocked: true, visible: true, speed: 3 });
        const dialog = createAudioMix({ enabled: true, unlocked: true, visible: true, speed: 3, dialogOpen: true });
        const autopilot = createAudioMix({ enabled: true, unlocked: true, visible: true, speed: 3, autopilot: true });
        expect(dialog.ambienceVolume).toBeLessThan(flight.ambienceVolume);
        expect(dialog.engineVolume).toBeLessThan(flight.engineVolume);
        expect(autopilot.ambienceVolume).toBeGreaterThan(flight.ambienceVolume);
    });
});
