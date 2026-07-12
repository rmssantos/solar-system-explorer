import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('paper soundscape integration', () => {
    it('exposes one accessible paper-radio control in the existing tool stack', () => {
        const html = read('../paper-preview/jogo/index.html');
        expect(html).toContain('id="sound-toggle"');
        expect(html).toMatch(/id="sound-toggle"[^>]+aria-pressed="true"/);
        expect(html).toContain('data-i18n="game.audio.sound"');
        expect(html).not.toContain('data-i18n-aria="game.audio.mute"');
    });

    it('localizes sound, mute and enable actions in PT and EN', () => {
        const i18n = read('../paper-preview/src/i18n/paperI18n.js');
        expect(i18n.match(/'game\.audio\.sound'/g)).toHaveLength(2);
        expect(i18n.match(/'game\.audio\.mute'/g)).toHaveLength(2);
        expect(i18n.match(/'game\.audio\.enable'/g)).toHaveLength(2);
    });

    it('routes live flight state and semantic game moments through the audio director', () => {
        const main = read('../paper-preview/src/main.js');
        expect(main).toContain("import { createAudioDirector } from './audio/audioDirector.js'");
        expect(main).toContain('audioDirector.update({');
        expect(main).toContain("audioDirector.play('paper-fold')");
        expect(main).toContain("audioDirector.play(selectedIndex === quiz.correctIndex ? 'quiz-correct' : 'quiz-wrong')");
        expect(main).toContain("audioDirector.play('autopilot-start')");
        expect(main).toContain("audioDirector.play('autopilot-arrive')");
        expect(main).toContain("audioDirector.play('lumi-signal')");
        expect(main).toContain('audio: audioDirector.getState()');
        expect(main).toContain('audioDirector.destroy()');
    });

    it('keeps the UI callback-driven and reflects the persisted audio state', () => {
        const ui = read('../paper-preview/src/ui.js');
        expect(ui).toContain('onSoundToggle');
        expect(ui).toContain("soundToggle: document.querySelector('#sound-toggle')");
        expect(ui).toContain('function updateAudioState');
        expect(ui).toContain("elements.soundToggle.setAttribute('aria-pressed'");
    });
});
