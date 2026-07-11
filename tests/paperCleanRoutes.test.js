import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../paper-preview/', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

describe('clean public routes', () => {
    it('never exposes html filenames in public navigation', () => {
        const gamePath = existsSync(new URL('jogo/index.html', root)) ? 'jogo/index.html' : 'jogo.html';
        const pages = [read('index.html'), read(gamePath)];
        const hrefs = pages.flatMap((html) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]));

        expect(hrefs.some((href) => href.includes('.html'))).toBe(false);
        expect(hrefs).toContain('/jogo/');
        expect(hrefs).toContain('/biblioteca/');
    });

    it('ships game and library as directory index entries', () => {
        expect(existsSync(new URL('jogo/index.html', root))).toBe(true);
        expect(existsSync(new URL('biblioteca/index.html', root))).toBe(true);
    });
});
