import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../paper-preview/index.html', import.meta.url), 'utf8');
const assetPath = (name) => new URL(`../paper-preview/public/art/${name}.webp`, import.meta.url);

describe('original paper-style homepage assets', () => {
    it('uses a dedicated illustration for each expedition step', () => {
        for (const name of ['step-fly', 'step-discover', 'step-learn', 'step-collect']) {
            expect(html).toContain(`/art/${name}.webp`);
            expect(statSync(assetPath(name)).size).toBeLessThan(80_000);
        }
    });

    it('does not keep placeholder glyph circles as the step artwork', () => {
        expect(html).not.toContain('chapter-icon');
        expect(html).toContain('class="chapter-art"');
    });

    it('uses original Saturn paper art in the field notebook instead of the CSS placeholder', () => {
        expect(html).toContain('/art/field-notebook-saturn.webp');
        expect(html).toContain('class="field-notebook-art"');
        expect(html).not.toContain('planet-photo');
        expect(statSync(assetPath('field-notebook-saturn')).size).toBeLessThan(180_000);
    });
});
