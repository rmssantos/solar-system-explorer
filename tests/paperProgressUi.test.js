import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/jogo.html', import.meta.url), 'utf8');

describe('paper expedition passport UI', () => {
    it('provides missions, collection and awards without covering the flight view', () => {
        expect(html).toContain('id="passport-level"');
        expect(html).toContain('id="passport-xp"');
        expect(html).toContain('data-passport-section="missions"');
        expect(html).toContain('data-passport-section="collection"');
        expect(html).toContain('data-passport-section="awards"');
        expect(html).toContain('id="collection-grid"');
        expect(html).toContain('id="awards-grid"');
    });
});
