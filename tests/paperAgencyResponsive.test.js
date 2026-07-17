import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');

describe('responsive paper agency desk', () => {
    it('fills the viewport and respects every safe-area edge', () => {
        expect(css).toMatch(/\.space-agency\s*\{[^}]*width:\s*100(?:dvw|%)[^}]*height:\s*100(?:dvh|%)/s);
        expect(css).toContain('env(safe-area-inset-top)');
        expect(css).toContain('env(safe-area-inset-right)');
        expect(css).toContain('env(safe-area-inset-bottom)');
        expect(css).toContain('env(safe-area-inset-left)');
    });

    it('keeps the journey route readable and all interactive targets at least 44px', () => {
        expect(css).toMatch(/\.agency-route\s*\{[^}]*overflow-x:\s*auto/s);
        expect(css).toMatch(/\.agency-route li[^{]*\{[^}]*min-height:\s*44px/s);
        expect(css).toMatch(/\.agency-(?:primary|secondary)-action[^{]*\{[^}]*min-height:\s*44px/s);
        expect(css).toMatch(/\.agency-choice[^{]*\{[^}]*min-height:\s*44px/s);
    });

    it('provides dedicated phone portrait and short-landscape compositions', () => {
        expect(css).toMatch(/@media\s*\(max-width:\s*640px\)/);
        expect(css).toMatch(/@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*500px\)/);
        expect(css).toMatch(/\.agency-operation-list[\s\S]*grid-template-columns:\s*1fr/s);
    });

    it('supports visible keyboard focus and reduced motion', () => {
        expect(css).toMatch(/\.space-agency[^\n{]*:focus-visible|\.space-agency[\s\S]*:focus-visible/);
        expect(css).toMatch(/prefers-reduced-motion:[^)]+\)[\s\S]*\.agency-/s);
    });
});
