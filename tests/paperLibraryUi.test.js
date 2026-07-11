import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/biblioteca/index.html', import.meta.url), 'utf8');

describe('paper expedition library UI', () => {
    it('provides a searchable, filterable archive with persistent progress', () => {
        expect(html).toContain('href="/library.css"');
        expect(html).toContain('src="/src/library.js"');
        expect(html).toContain('id="library-search"');
        expect(html).toContain('data-library-category="worlds"');
        expect(html).toContain('id="library-discovery-filter"');
        expect(html).toContain('id="library-grid"');
        expect(html).toContain('id="library-empty"');
        expect(html).toContain('id="library-rank"');
        expect(html).toContain('id="library-progress"');
    });

    it('includes a scientific detail sheet, quiz and physical awards shelf', () => {
        expect(html).toContain('id="library-detail"');
        expect(html).toContain('id="detail-photo"');
        expect(html).toContain('id="detail-source"');
        expect(html).toContain('id="detail-measurements"');
        expect(html).toContain('id="library-quiz"');
        expect(html).toContain('id="library-quiz-options"');
        expect(html).toContain('id="library-awards"');
    });

    it('uses clean cross-navigation and contains no html filename links', () => {
        expect(html).toContain('href="/jogo/"');
        expect(html).toContain('href="/"');
        expect(html).not.toMatch(/href="[^"]+\.html/);
    });
});
