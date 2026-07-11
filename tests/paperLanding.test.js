import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('Paper Solar Explorer homepage', () => {
    it('explains the experience, audience, learning, and scientific provenance', () => {
        const html = read('../paper-preview/index.html');
        expect(html).toContain('Explora o Sistema Solar');
        expect(html).toContain('Para famílias');
        expect(html).toContain('Para escolas');
        expect(html).toContain('NASA');
        expect(html).toContain('JPL');
        expect(html).toContain('missões');
        expect(html).toContain('fotografias reais');
    });

    it('starts the dedicated game without loading the WebGL runtime on the homepage', () => {
        const html = read('../paper-preview/index.html');
        expect(html).toContain('href="/jogo/"');
        expect(html).toContain('href="/biblioteca/"');
        expect(html).not.toContain('id="paper-stage"');
        expect(html).not.toContain('src="/src/main.js"');
    });

    it('keeps the full game shell on the dedicated game page', () => {
        const html = read('../paper-preview/jogo/index.html');
        expect(html).toContain('id="paper-stage"');
        expect(html).toContain('src="/src/main.js"');
        expect(html).toContain('href="/"');
    });
});
