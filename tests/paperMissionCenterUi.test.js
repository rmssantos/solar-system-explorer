import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../paper-preview/src/ui.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');
const i18n = readFileSync(new URL('../paper-preview/src/i18n/paperI18n.js', import.meta.url), 'utf8');

describe('paper mission center', () => {
    it('offers a dedicated top-bar entry with an actionable badge', () => {
        expect(html).toContain('id="mission-center-trigger"');
        expect(html).toContain('id="mission-center-count"');
        expect(html).toContain('data-i18n="game.missionCenter.open"');
        expect(css).toMatch(/\.mission-center-trigger\s*\{[^}]*min-height:\s*44px/s);
    });

    it('opens a campaign rail inside the missions section', () => {
        expect(html).toContain('class="mission-dispatch"');
        expect(html).toContain('id="mission-route"');
        expect(html).toContain('id="mission-dispatch-progress"');
        expect(ui).toContain("missionCenterTrigger: document.querySelector('#mission-center-trigger')");
        expect(ui).toContain("[elements.missionCenterTrigger, 'click', () => openMissionLog('missions')]");
    });

    it('ships bilingual mission-center labels and reduced-motion support', () => {
        expect(i18n).toContain("'game.missionCenter.open': 'Missões'");
        expect(i18n).toContain("'game.missionCenter.open': 'Missions'");
        expect(i18n).toContain("'game.missionCenter.title': 'Centro de Missões'");
        expect(i18n).toContain("'game.missionCenter.title': 'Mission Control'");
        expect(css).toMatch(/prefers-reduced-motion:[^)]+\)[\s\S]*\.mission-center-trigger/s);
    });
});
