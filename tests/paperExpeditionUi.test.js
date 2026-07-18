import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../paper-preview/jogo/index.html');
const css = read('../paper-preview/styles.css');
const ui = read('../paper-preview/src/ui.js');

describe('Signal of the Moons investigation board UI', () => {
    it('adds the investigation without replacing missions, collection or awards', () => {
        for (const section of ['missions', 'investigation', 'collection', 'awards']) {
            expect(html).toContain(`data-passport-section="${section}"`);
            expect(html).toContain(`data-passport-panel="${section}"`);
        }
        expect(html).toContain('id="expedition-board"');
        expect(html).toContain('id="expedition-chapter-list"');
        expect(html).toContain('id="expedition-evidence-grid"');
    });

    it('renders chapter artwork, progress and a delegated action surface', () => {
        expect(ui).toContain('presentExpeditionBoard');
        expect(ui).toContain('function renderExpeditionBoard');
        expect(ui).toContain("artButton.dataset.expeditionArt = chapter.id");
        expect(ui).toContain("action.dataset.expeditionAction = chapter.action");
        expect(ui).toContain("event.target.closest('[data-expedition-action]')");
        expect(ui).toContain('onExpeditionAction(chapterId, action.dataset.expeditionAction)');
        expect(ui).toContain('mediaViewer.open({');
        expect(ui).toContain('src: chapter.art');
    });

    it('localizes investigation, finale and assistance accessibility labels', () => {
        for (const key of [
            'game.expedition.progressAria', 'game.expedition.routeAria',
            'game.expedition.finale.close', 'game.expedition.finale.evidenceAria',
            'game.mission.assists.aria', 'game.mission.assists.title',
            'game.mission.assists.guide', 'game.mission.assists.calmPace',
            'game.mission.assists.largeControls', 'game.mission.assists.noTimer'
        ]) expect(html).toContain(`data-i18n${key.includes('Aria') || key.endsWith('.aria') || key.endsWith('.close') ? '-aria' : ''}="${key}"`);
    });

    it('stays readable and touch-safe on phones and reduced-motion devices', () => {
        expect(css).toMatch(/\.expedition-action\s*\{[^}]*min-height:\s*44px/s);
        expect(css).toMatch(/@container\s+expedition-board\s*\(max-width:\s*36rem\)/);
        expect(css).toMatch(/@media\s*\(max-width:\s*600px\)[\s\S]*?\.passport-tabs/);
        expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.expedition/s);
    });
});
