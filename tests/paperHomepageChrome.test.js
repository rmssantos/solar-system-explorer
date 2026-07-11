import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const home = read('../paper-preview/index.html');

describe('homepage navigation and footer', () => {
    it('keeps the primary header visible while scrolling', () => {
        const shared = read('../paper-preview/shared-header.css');
        expect(shared).toMatch(/\.site-header\s*\{[^}]*position:\s*sticky/);
        expect(shared).toMatch(/\.site-header\s*\{[^}]*top:\s*0/);
        expect(shared).toMatch(/\.site-header\s*\{[^}]*width:\s*100%/);
        expect(shared).toMatch(/\.site-header\s*\{[^}]*min-height:\s*68px/);
    });

    it('uses a structured footer with useful destinations and quiet privacy controls', () => {
        expect(home).toContain('class="site-footer"');
        expect(home).toContain('class="footer-navigation"');
        expect(home).toContain('href="/biblioteca/"');
        expect(home).toContain('href="https://github.com/rmssantos/solar-system-explorer"');
        expect(home).toMatch(/class="footer-legal"[\s\S]*data-privacy-settings/);
    });

    it('shares the same slim header component with the library', () => {
        const library = read('../paper-preview/biblioteca/index.html');
        expect(home).toContain('href="/shared-header.css"');
        expect(library).toContain('href="/shared-header.css"');
        expect(library).toContain('<header class="site-header">');
        expect(library).toContain('class="brand"');
        expect(library).toContain('class="header-actions"');
    });

    it('keeps the sticky library search controls below the shared header', () => {
        const libraryCss = read('../paper-preview/library.css');
        expect(libraryCss).toContain('.catalog-controls{top:80px}');
    });
});
