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
        expect(css).toMatch(/@media\s*\(max-width:\s*700px\),\s*\(pointer:\s*coarse\)\s*and\s*\(max-width:\s*1100px\)/);
        expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    });

    it('uses a viewport-sized, non-scrolling game board on phones', () => {
        expect(css).toMatch(/\.local-orbit-mission\s*\{[^}]*width:\s*100dvw[^}]*height:\s*100dvh[^}]*max-height:\s*none/s);
        expect(css).toMatch(/\.local-orbit-sheet\s*\{[^}]*position:\s*relative[^}]*height:\s*100dvh[^}]*overflow:\s*hidden/s);
        expect(css).toMatch(/\.local-orbit-playfield\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*height:\s*100%[^}]*aspect-ratio:\s*auto/s);
        expect(css).toMatch(/\.local-orbit-result p\s*\{[^}]*display:\s*block[^}]*max-width:\s*32ch/s);
    });

    it('gives touch players large controls over the fullscreen playfield', () => {
        expect(css).toMatch(/\.local-orbit-heading\s*\{[^}]*position:\s*absolute[^}]*z-index:\s*4/s);
        expect(css).toMatch(/\.docking-instruments\s*\{[^}]*position:\s*absolute[^}]*z-index:\s*4/s);
        expect(css).toMatch(/\.docking-controls\s*\{[^}]*position:\s*absolute[^}]*z-index:\s*4/s);
        expect(css).toMatch(/\.docking-control\s*\{[^}]*min-height:\s*clamp\(56px,/s);
        expect(css).toContain('.local-orbit-sheet:has(.local-orbit-result:not([hidden])) .docking-controls');
    });

    it('keeps the directional pad aligned when a mission hides rotation controls', () => {
        expect(css).toMatch(/\[data-docking-action="up"\]\s*\{[^}]*grid-area:\s*1\s*\/\s*2/s);
        expect(css).toMatch(/\[data-docking-action="reverse"\]\s*\{[^}]*grid-area:\s*2\s*\/\s*1/s);
        expect(css).toMatch(/\[data-docking-action="stabilize"\]\s*\{[^}]*grid-area:\s*2\s*\/\s*2/s);
        expect(css).toMatch(/\[data-docking-action="forward"\]\s*\{[^}]*grid-area:\s*2\s*\/\s*3/s);
        expect(css).toMatch(/\[data-docking-action="down"\]\s*\{[^}]*grid-area:\s*3\s*\/\s*2/s);
    });

    it('keeps the reward toast away from an active docking game', () => {
        expect(css).toContain('body:has(.local-orbit-mission[open]) .reward-toast');
    });

    it('stacks catalog-driven contract cards and styles their contextual action', () => {
        expect(css).toMatch(/\.contract-list\s*\{[^}]*display:\s*grid/s);
        expect(css).toMatch(/\.contract-card\s*>\s*button\s*\{[^}]*min-height:\s*46px/s);
    });

    it('places landscape playfield, telemetry and controls inside the same viewport grid', () => {
        expect(css).toMatch(/@media\s*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)\s*and\s*\(max-width:\s*1100px\)/);
        expect(css).toMatch(/@media[^{]*\(max-width:\s*700px\)[^{]*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)\s*and\s*\(max-width:\s*1100px\)\s*\{/s);
        expect(css).toMatch(/\.docking-controls\s*\{[^}]*right:\s*max\(/s);
    });
});
