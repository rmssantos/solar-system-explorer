import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';

const audioDir = new URL('../paper-preview/public/audio/', import.meta.url);
const expectedAssets = [
    'cosmic-ambience.mp3',
    'paper-engine.mp3',
    'paper-fold.mp3',
    'autopilot-start.mp3',
    'autopilot-arrive.mp3',
    'quiz-correct.mp3',
    'quiz-wrong.mp3',
    'reward-chime.mp3',
    'lumi-signal.mp3'
];

describe('paper audio asset pipeline', () => {
    it('keeps local environment files out of git', () => {
        const gitignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8');
        expect(gitignore).toMatch(/^\.env$/m);
        expect(gitignore).toMatch(/^\.env\.\*$/m);
        expect(gitignore).toMatch(/^!\.env\.example$/m);
    });

    it('generates every approved cue without exposing the key to Vite', () => {
        const script = readFileSync(new URL('../scripts/generate-paper-audio.mjs', import.meta.url), 'utf8');
        expect(script).toContain('https://api.elevenlabs.io/v1/sound-generation');
        expect(script).toContain("'xi-api-key'");
        expect(script).toContain('ELEVEN_LABS');
        expect(script).not.toContain('VITE_ELEVEN');
        for (const filename of expectedAssets) expect(script).toContain(filename);
    });

    it('ships non-empty generated MP3 assets', () => {
        for (const filename of expectedAssets) {
            const file = new URL(filename, audioDir);
            expect(existsSync(file), `${filename} is missing`).toBe(true);
            expect(statSync(file).size, `${filename} is empty`).toBeGreaterThan(1_000);
        }
    });
});
