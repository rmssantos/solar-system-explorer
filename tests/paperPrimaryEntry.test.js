import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const fromRepo = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFileSync(fromRepo(path), 'utf8');

describe('Paper experience as the primary application', () => {
    it('uses the Paper root for the default development, build and preview scripts', () => {
        const metadata = JSON.parse(read('package.json'));
        const readme = read('README.md');

        expect(metadata.scripts.dev).toBe('vite paper-preview --host 0.0.0.0');
        expect(metadata.scripts.build).toBe('vite build paper-preview --outDir ../dist --emptyOutDir');
        expect(metadata.scripts.preview).toBe('vite preview paper-preview --outDir ../dist');
        expect(metadata.scripts['dev:archive']).toBe('vite --host --open /arquivo/jogo-antigo/index.html');
        expect(readme).toContain('npm run dev          # local Paper experience');
        expect(readme).toContain('npm run dev:archive  # archived legacy experience');
    });

    it('keeps the legacy entry in an explicit archive instead of the repository root', () => {
        expect(existsSync(fromRepo('index.html'))).toBe(false);
        expect(existsSync(fromRepo('arquivo/jogo-antigo/index.html'))).toBe(true);
        expect(existsSync(fromRepo('arquivo/jogo-antigo/biblioteca.html'))).toBe(true);

        if (!existsSync(fromRepo('arquivo/jogo-antigo/index.html'))) return;
        const archivedEntry = read('arquivo/jogo-antigo/index.html');
        expect(archivedEntry).toContain('Sistema Solar Interactivo 3D');
        expect(archivedEntry).toContain('href="/styles/style.css"');
        expect(archivedEntry).toContain('src="/src/main.js"');
    });
});
