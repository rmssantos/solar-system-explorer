import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../paper-preview/jogo/index.html');
const css = read('../paper-preview/styles.css');
const ui = read('../paper-preview/src/ui.js');

describe('paper time observatory HUD', () => {
    it('provides a labelled toggle, live date and four explicit sky speeds', () => {
        expect(html).toContain('id="time-observatory-toggle"');
        expect(html).toContain('aria-controls="time-observatory"');
        expect(html).toContain('id="time-observatory"');
        expect(html).toContain('id="time-observatory-date"');
        expect(html).toContain('id="time-observatory-today"');
        expect(html).toContain('id="time-observatory-explanation"');
        for (const scale of [0, 1, 10, 100]) {
            expect(html).toContain(`data-orbital-time-scale="${scale}"`);
        }
    });

    it('keeps the observatory edge-aligned, touch-safe and responsive', () => {
        expect(css).toMatch(/\.time-observatory\s*\{[^}]*position:\s*fixed[^}]*right:/s);
        expect(css).toMatch(/\.orbital-time-controls\s+button\s*\{[^}]*min-height:\s*44px/s);
        expect(css).toMatch(/@media\s*\(max-width:\s*600px\)[\s\S]*?\.time-observatory\s*\{/);
        expect(css).toMatch(/@media\s*\(max-height:\s*520px\)\s*and\s*\(orientation:\s*landscape\)[\s\S]*?\.time-observatory\s*\{/);
        expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.time-orbit-icon/);
    });

    it('opens, closes and renders localized orbital-clock snapshots', () => {
        expect(ui).toContain('onOrbitalTimeScale');
        expect(ui).toContain('onOrbitalTimeToday');
        expect(ui).toContain("elements.timeObservatoryToggle.setAttribute('aria-expanded'");
        expect(ui).toContain("event.target.closest('[data-orbital-time-scale]')");
        expect(ui).toContain('[elements.timeObservatoryToday, \'click\'');
        expect(ui).toContain('function updateOrbitalClock(clock)');
        expect(ui).toContain("new Intl.DateTimeFormat(paperI18n.language === 'en' ? 'en-GB' : 'pt-PT'");
        expect(ui).toContain("paperI18n.t('game.time.daysPerSecond', { days: clock.daysPerSecond })");
        expect(ui).toMatch(/return\s*\{[^}]*updateOrbitalClock,/s);
    });
});
