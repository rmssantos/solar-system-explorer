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
        expect(css).toMatch(/\.local-orbit-playfield\s*\{\s*min-height:\s*min\(40vh,\s*330px\)/);
        expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    });
});
