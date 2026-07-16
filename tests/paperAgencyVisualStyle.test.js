import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../paper-preview/styles.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../paper-preview/jogo/index.html', import.meta.url), 'utf8');
const consoleSource = readFileSync(new URL('../paper-preview/src/agency/scienceConsole.js', import.meta.url), 'utf8');
const sealUrl = new URL('../paper-preview/public/art/agency/agency-seal.svg', import.meta.url);

describe('paper agency visual direction', () => {
    it('uses a centered dossier on larger screens and reserves fullscreen for small screens', () => {
        expect(css).toMatch(/\.space-agency\s*\{[^}]*width:\s*min\(70rem, calc\(100vw - 3rem\)\)/s);
        expect(css).toMatch(/\.space-agency\s*\{[^}]*height:\s*min\(48rem, calc\(100dvh - 3rem\)\)/s);
        expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]*?\.space-agency\s*\{[^}]*width:\s*100dvw[^}]*height:\s*100dvh/s);
        expect(css).toMatch(/\.agency-desk\s*\{[^}]*grid-template-rows:\s*auto auto minmax\(0, 1fr\)/s);
        expect(css).toMatch(/\.agency-science-console\s*\{[^}]*position:\s*absolute/s);
        expect(css).toMatch(/\.agency-setup-sheet\s*\{[^}]*position:\s*absolute/s);
    });

    it('has a project-owned agency seal and reuses the real paper texture library', () => {
        expect(existsSync(sealUrl)).toBe(true);
        const seal = readFileSync(sealUrl, 'utf8');
        expect(seal).toContain('<title>Paper Space Agency seal</title>');
        expect(seal).toContain('filter id="paper-shadow"');
        expect(html).toContain('src="/art/agency/agency-seal.svg"');
        expect(css).toContain("url('/art/textures/paper-craft-surface.webp')");
    });

    it('renders textured cut-paper scenes with animated feedback instead of flat primitives', () => {
        for (const fragment of [
            'createPaperArtAtlas',
            'drawPaperBackdrop',
            'drawPaperPlanet',
            'drawExhaustParticles',
            'drawCaptureFlash',
            'drawSignalRibbons'
        ]) expect(consoleSource).toContain(fragment);
        expect(consoleSource).toContain("'/art/textures/paper-craft-surface.webp'");
        expect(consoleSource).toContain("'/art/textures/paper-sun-surface.webp'");
        expect(consoleSource).toContain("'/art/textures/paper-earth-surface.webp'");
        expect(consoleSource).toContain("'/art/textures/paper-mars-surface.webp'");
        expect(consoleSource).toContain("'/art/textures/paper-rocky-surface.webp'");
    });
});
