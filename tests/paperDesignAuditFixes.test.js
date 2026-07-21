import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const readIfPresent = (path) => {
    const url = new URL(path, import.meta.url);
    return existsSync(url) ? readFileSync(url, 'utf8') : '';
};

const gameCss = read('../paper-preview/styles.css');
const landingCss = read('../paper-preview/landing.css');
const landingJs = read('../paper-preview/src/landing.js');
const libraryCss = read('../paper-preview/library.css');
const privacyCss = read('../paper-preview/privacy.css');
const sharedHeaderCss = read('../paper-preview/shared-header.css');
const tokensCss = readIfPresent('../paper-preview/tokens.css');

describe('validated design-audit corrections', () => {
    it('shares brand primitives while preserving contextual component aliases', () => {
        expect(tokensCss).toContain('--brand-space:');
        expect(tokensCss).toContain('--brand-paper:');
        expect(tokensCss).toContain('--brand-sun:');
        expect(tokensCss).toContain('--brand-coral:');

        for (const css of [gameCss, landingCss, libraryCss, privacyCss, sharedHeaderCss]) {
            expect(css).toMatch(/^@import url\(['"]\.\/tokens\.css['"]\);/);
        }

        expect(gameCss).toContain('--notebook-paper: var(--brand-paper);');
        expect(gameCss).toContain('--sun-pulp: var(--brand-sun);');
        expect(gameCss).toContain('--coral-pencil: var(--brand-coral);');
    });

    it('does not shrink the audited HUD and docking labels to 5–8px', () => {
        expect(gameCss).not.toMatch(/\.cockpit-coordinates\s*\{[^}]*font-size:\s*\.31rem/);
        expect(gameCss).not.toMatch(/\.rank-chip-heading\s*\{[^}]*font-size:\s*\.(?:44|48)rem/);
        expect(gameCss).not.toMatch(/\.local-orbit-kicker\s*\{[^}]*font-size:\s*\.(?:36|42)rem/);
        expect(gameCss).not.toMatch(/\.docking-instruments small\s*\{[^}]*font-size:\s*\.(?:34|43)rem/);
        expect(gameCss).not.toMatch(/\.agency-choice-recommended\s*\{[^}]*font-size:\s*\.48rem/);
    });

    it('keeps landing content visible by default when JavaScript is unavailable', () => {
        expect(landingCss).not.toMatch(/^\[data-reveal\]\s*\{[^}]*opacity:\s*0/m);
        expect(landingCss).toContain('[data-reveal].is-revealable');
        expect(landingJs).toContain("target.classList.add('is-revealable')");
    });

    it('raises the one audited secondary-text color that actually fails AA', () => {
        expect(privacyCss).toContain('color:var(--text-on-space-muted)');
        expect(privacyCss).not.toContain('color:#fff6d866');
        expect(libraryCss).toContain('color:var(--text-on-space-muted)');
        expect(libraryCss).not.toContain('color:#fff6d866');
    });

    it('gives key game controls hover feedback and paper-styled progress bars', () => {
        expect(gameCss).toContain('.notebook-trigger:not(:disabled):hover');
        expect(gameCss).toContain('.quiz-options button:not(:disabled):hover');
        expect(gameCss).toContain('.docking-control:hover');
        expect(gameCss).toContain('progress::-webkit-progress-value');
        expect(gameCss).toContain('progress::-moz-progress-bar');
    });

    it('removes two additional interface-guideline violations found during validation', () => {
        expect(privacyCss).not.toMatch(/transition:\s*\.[0-9]+s\s+ease/);
        expect(gameCss).not.toContain('.nav-beacon { top: 5.5rem;');
    });
});
