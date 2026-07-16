import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');

describe('paper local-orbit mission surface', () => {
    it('provides a semantic modal with a protected canvas playfield', () => {
        expect(html).toContain('<dialog id="local-orbit-mission"');
        expect(html).toContain('aria-labelledby="local-orbit-title"');
        expect(html).toContain('id="local-orbit-stage"');
        expect(html).toContain('id="local-orbit-loading"');
        expect(html).toContain('id="local-orbit-error"');
        expect(html).toContain('id="local-orbit-result"');
    });

    it('keeps telemetry and controls in accessible DOM elements', () => {
        for (const id of ['docking-distance', 'docking-speed', 'docking-alignment', 'docking-guidance']) {
            expect(html).toContain(`id="${id}"`);
        }
        for (const action of ['forward', 'reverse', 'up', 'down', 'rotate-left', 'rotate-right', 'stabilize']) {
            expect(html).toContain(`data-docking-action="${action}"`);
        }
        expect(html).toMatch(/data-docking-action="stabilize"[^>]*type="button"/);
        expect(html).toContain('class="docking-keyboard-hint"');
        expect(html).toContain('data-i18n="game.docking.keys"');
    });

    it('uses a responsive paper surface with safe touch targets and reduced motion', () => {
        expect(css).toMatch(/\.local-orbit-mission\s*\{/);
        expect(css).toMatch(/\.docking-control\s*\{[^}]*min-(?:width|height):\s*44px/s);
        expect(css).toMatch(/@media\s*\(max-width:\s*700px\)/);
        expect(css).toContain('aspect-ratio: 16 / 9');
        expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    });

    it('uses a viewport-sized, non-scrolling game board on phones', () => {
        expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*?\.local-orbit-mission\s*\{[^}]*width:\s*100dvw[^}]*height:\s*100dvh[^}]*max-height:\s*none/s);
        expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*?\.local-orbit-sheet\s*\{[^}]*height:\s*100dvh[^}]*overflow:\s*hidden/s);
        expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*?\.local-orbit-playfield\s*\{[^}]*min-height:\s*0[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
        expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*?\.local-orbit-result p\s*\{[^}]*display:\s*none/s);
    });

    it('keeps the reward toast away from an active docking game', () => {
        expect(css).toContain('body:has(.local-orbit-mission[open]) .reward-toast');
    });

    it('places landscape playfield, telemetry and controls inside the same viewport grid', () => {
        expect(css).toMatch(/@media\s*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)[\s\S]*?\.local-orbit-playfield\s*\{[^}]*grid-row:\s*2\s*\/\s*span\s*2/s);
        expect(css).toMatch(/@media\s*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)[\s\S]*?\.docking-controls\s*\{[^}]*grid-row:\s*3/s);
    });
});
