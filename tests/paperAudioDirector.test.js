import { describe, expect, it, vi } from 'vitest';
import { createAudioDirector } from '../paper-preview/src/audio/audioDirector.js';
import { existsSync, statSync } from 'node:fs';

class FakeAudio {
    constructor(src) {
        this.src = src;
        this.loop = false;
        this.preload = '';
        this.volume = 0;
        this.playbackRate = 1;
        this.paused = true;
        this.playCalls = 0;
        this.listeners = new Map();
    }

    play() {
        this.playCalls += 1;
        this.paused = false;
        return Promise.resolve();
    }

    pause() { this.paused = true; }
    addEventListener(name, callback) { this.listeners.set(name, callback); }
    removeEventListener(name) { this.listeners.delete(name); }
}

function createHarness(initialPreference = null, now = () => 1_000) {
    const audios = [];
    const values = new Map(initialPreference === null ? [] : [['paper-solar-audio-enabled-v1', initialPreference]]);
    const storage = {
        getItem: vi.fn((key) => values.get(key) ?? null),
        setItem: vi.fn((key, value) => values.set(key, value))
    };
    const listeners = new Map();
    const documentRef = {
        hidden: false,
        addEventListener: vi.fn((name, handler) => listeners.set(name, handler)),
        removeEventListener: vi.fn((name) => listeners.delete(name))
    };
    const director = createAudioDirector({
        createAudio: (src) => {
            const audio = new FakeAudio(src);
            audios.push(audio);
            return audio;
        },
        storage,
        documentRef,
        now
    });
    return { director, audios, storage, documentRef, listeners };
}

describe('paper audio director', () => {
    it('starts enabled but locked and honors a persisted mute', () => {
        expect(createHarness().director.getState()).toMatchObject({ enabled: true, unlocked: false });
        expect(createHarness('off').director.getState()).toMatchObject({ enabled: false, unlocked: false });
    });

    it('unlocks both seamless loops from a user gesture', async () => {
        const { director, audios } = createHarness();
        await director.unlock();
        expect(audios.slice(0, 2).map((audio) => audio.loop)).toEqual([true, true]);
        expect(audios.slice(0, 2).map((audio) => audio.playCalls)).toEqual([1, 1]);
        expect(director.getState().unlocked).toBe(true);
    });

    it('persists mute and can resume from the sound control gesture', async () => {
        const { director, audios, storage } = createHarness();
        await director.unlock();
        director.toggle();
        expect(storage.setItem).toHaveBeenLastCalledWith('paper-solar-audio-enabled-v1', 'off');
        expect(audios[0].paused).toBe(true);
        await director.toggle();
        expect(storage.setItem).toHaveBeenLastCalledWith('paper-solar-audio-enabled-v1', 'on');
        expect(audios[0].playCalls).toBe(2);
    });

    it('mixes flight state and gates semantic one-shots', async () => {
        const { director, audios } = createHarness();
        expect(director.play('quiz-correct')).toBe(false);
        await director.unlock();
        director.update({ speed: 7, boost: true, autopilot: false, dialogOpen: false }, 1);
        expect(audios[1].volume).toBeGreaterThan(0.3);
        expect(audios[1].playbackRate).toBeGreaterThan(1.2);
        expect(director.play('quiz-correct')).toBe(true);
        expect(audios.at(-1).src).toContain('quiz-correct.mp3');
        expect(director.getState()).toMatchObject({ lastCue: 'quiz-correct', activeCueCount: 1 });
    });

    it('debounces rapid duplicate mission cues without muting different feedback', async () => {
        let clock = 1_000;
        const { director, audios } = createHarness(null, () => clock);
        await director.unlock();
        expect(director.play('shield-impact')).toBe(true);
        expect(director.play('shield-impact')).toBe(false);
        expect(director.play('cargo-capture')).toBe(true);
        clock += 700;
        expect(director.play('shield-impact')).toBe(true);
        expect(audios.filter((audio) => audio.src.includes('shield-impact')).length).toBe(2);
    });

    it('plays the four compact language-neutral living-sky cues', async () => {
        const { director, audios } = createHarness();
        await director.unlock();
        for (const cue of ['sky-camera-shutter', 'sky-event-alert', 'sky-focus-lock', 'sky-photo-developed']) {
            expect(director.play(cue)).toBe(true);
            expect(audios.at(-1).src).toContain(`${cue}.mp3`);
            const file = new URL(`../paper-preview/public/audio/${cue}.mp3`, import.meta.url);
            expect(existsSync(file)).toBe(true);
            expect(statSync(file).size).toBeGreaterThan(10_000);
        }
    });

    it('pauses while hidden and cleans up all audio', async () => {
        const { director, audios, documentRef, listeners } = createHarness();
        await director.unlock();
        documentRef.hidden = true;
        listeners.get('visibilitychange')();
        expect(audios[0].paused).toBe(true);
        expect(director.getState().visible).toBe(false);
        director.destroy();
        expect(documentRef.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
        expect(audios.every((audio) => audio.paused)).toBe(true);
    });
});
